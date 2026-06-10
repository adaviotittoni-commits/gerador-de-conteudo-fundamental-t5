import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { decryptKey } from '../_shared/crypto.ts'
import { getProvider } from '../_shared/providers/factory.ts'
import type { ProviderName } from '../_shared/providers/types.ts'

/** Providers that support image generation. */
const IMAGE_PROVIDERS: ProviderName[] = ['openai', 'gemini']

/** Rate limit: max images per minute per user. */
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

/** In-memory rate limit store (per-isolate). */
const rateLimitMap = new Map<string, number[]>()

/**
 * Check whether the user has exceeded the image generation rate limit.
 * Returns true if the request should be blocked.
 */
function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  let timestamps = rateLimitMap.get(userId) ?? []
  // Prune entries outside the window
  timestamps = timestamps.filter((t) => t > windowStart)

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(userId, timestamps)
    return true
  }

  timestamps.push(now)
  rateLimitMap.set(userId, timestamps)
  return false
}

/**
 * Map provider error codes to user-friendly messages.
 */
function friendlyError(error: unknown): { message: string; status: number } {
  const msg = (error as Error).message || String(error)

  if (msg === 'AUTH_REQUIRED') {
    return { message: 'Authentication required. Please sign in again.', status: 401 }
  }

  if (msg.includes('RATE_LIMITED') || msg.includes('429')) {
    return {
      message: 'The AI provider is temporarily busy. Please wait a moment and try again.',
      status: 429,
    }
  }

  if (msg.includes('INVALID_KEY') || msg.includes('401') || msg.includes('Unauthorized')) {
    return {
      message: 'Your API key appears to be invalid. Please check your key in Settings.',
      status: 400,
    }
  }

  if (msg.includes('TIMEOUT') || msg.includes('timeout')) {
    return {
      message: 'The AI provider took too long to respond. Please try again.',
      status: 504,
    }
  }

  return {
    message: 'Something went wrong while generating your image. Please try again.',
    status: 500,
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate
    const user = await verifyAuth(req)

    // 2. Validate method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 3. Parse and validate body
    const body = await req.json()
    const { project_id, prompt, provider, model } = body as {
      project_id?: string
      prompt?: string
      provider?: string
      model?: string
    }

    if (!project_id || !prompt || !provider || !model) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'project_id, prompt, provider, and model are required.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 4. Validate provider supports image generation
    if (!IMAGE_PROVIDERS.includes(provider as ProviderName)) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: `Provider "${provider}" does not support image generation. Supported providers: ${IMAGE_PROVIDERS.join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 5. Rate limiting
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({
          error: 'RATE_LIMITED',
          message: 'You have exceeded the image generation limit (5 per minute). Please wait and try again.',
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 6. Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 7. Fetch project and validate ownership
    const { data: project, error: projectError } = await supabase
      .from('content_projects')
      .select('id, user_id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({
          error: 'NOT_FOUND',
          message: 'Project not found or you do not have access to it.',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 8. Fetch and decrypt the user's API key for the selected provider
    const { data: apiKeyRow, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (keyError || !apiKeyRow) {
      return new Response(
        JSON.stringify({
          error: 'KEY_NOT_FOUND',
          message: `No API key found for ${provider}. Please add your key in Settings.`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const decryptedKey = await decryptKey(apiKeyRow.encrypted_key, encryptionKey)

    // 9. Update project status to 'generating'
    await supabase
      .from('content_projects')
      .update({ status: 'generating' })
      .eq('id', project_id)

    // 10. Call the provider
    const aiProvider = getProvider(provider as ProviderName, decryptedKey)

    let result
    try {
      result = await aiProvider.generateImage!(prompt, { model })
    } catch (providerError) {
      // Update project status to 'error' on provider failure
      await supabase
        .from('content_projects')
        .update({ status: 'error' })
        .eq('id', project_id)

      const friendly = friendlyError(providerError)
      return new Response(
        JSON.stringify({ error: 'PROVIDER_ERROR', message: friendly.message }),
        { status: friendly.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 11. Upload image to Supabase Storage
    const fileId = crypto.randomUUID()
    const extension = result.mimeType === 'image/jpeg' ? 'jpg' : 'png'
    const storagePath = `${user.id}/${project_id}/${fileId}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, result.imageData, {
        contentType: result.mimeType,
        upsert: false,
      })

    if (uploadError) {
      // Still try to save the output without the file URL
      await supabase
        .from('content_projects')
        .update({ status: 'error' })
        .eq('id', project_id)

      return new Response(
        JSON.stringify({
          error: 'STORAGE_ERROR',
          message: 'Image was generated but failed to upload. Please try again.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 12. Get signed URL (valid for 1 hour)
    const { data: signedUrlData } = await supabase.storage
      .from('images')
      .createSignedUrl(storagePath, 3600)

    const fileUrl = signedUrlData?.signedUrl ?? ''

    // 13. Save output to database
    const { data: output, error: insertError } = await supabase
      .from('outputs')
      .insert({
        project_id,
        user_id: user.id,
        type: 'image',
        content: prompt,
        file_url: fileUrl,
        provider_used: provider,
        model_used: model,
        tokens_used: null,
      })
      .select('id, project_id, type, content, file_url, provider_used, model_used, tokens_used, created_at')
      .single()

    if (insertError) {
      return new Response(
        JSON.stringify({
          output: {
            type: 'image',
            content: prompt,
            file_url: fileUrl,
            provider_used: provider,
            model_used: model,
          },
          warning: 'Image generated and uploaded but failed to save record. The image URL is still valid.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 14. Update project status to 'completed'
    await supabase
      .from('content_projects')
      .update({ status: 'completed' })
      .eq('id', project_id)

    // 15. Return generated image output
    return new Response(
      JSON.stringify({ output }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    const friendly = friendlyError(error)
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: friendly.message }),
      { status: friendly.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
