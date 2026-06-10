import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { decryptKey } from '../_shared/crypto.ts'
import { getProvider } from '../_shared/providers/factory.ts'
import { getPrompt } from '../_shared/prompts.ts'
import type { GenerationType } from '../_shared/prompts.ts'
import type { ProviderName } from '../_shared/providers/types.ts'

const VALID_TYPES: GenerationType[] = ['copy', 'narrative', 'hooks', 'cta']
const VALID_PROVIDERS: ProviderName[] = ['openai', 'gemini', 'anthropic']

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
    message: 'Something went wrong while generating your content. Please try again.',
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
    const { project_id, type, provider, model } = body as {
      project_id?: string
      type?: string
      provider?: string
      model?: string
    }

    if (!project_id || !type || !provider || !model) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'project_id, type, provider, and model are required.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!VALID_TYPES.includes(type as GenerationType)) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: `Invalid generation type: ${type}. Must be one of: ${VALID_TYPES.join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!VALID_PROVIDERS.includes(provider as ProviderName)) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: `Unsupported provider: ${provider}. Must be one of: ${VALID_PROVIDERS.join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 4. Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 5. Fetch project and validate ownership
    const { data: project, error: projectError } = await supabase
      .from('content_projects')
      .select('id, user_id, input_text, status')
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

    // 6. Fetch user profile for tone of voice
    const { data: profile } = await supabase
      .from('profiles')
      .select('tone_of_voice')
      .eq('id', user.id)
      .single()

    const toneOfVoice = profile?.tone_of_voice ?? null

    // 7. Fetch and decrypt the user's API key for the selected provider
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

    // 8. Build the prompt
    const prompt = getPrompt(type as GenerationType, project.input_text, toneOfVoice)

    // 9. Update project status to 'generating'
    await supabase
      .from('content_projects')
      .update({ status: 'generating' })
      .eq('id', project_id)

    // 10. Call the provider
    const aiProvider = getProvider(provider as ProviderName, decryptedKey)

    let result
    try {
      result = await aiProvider.generateText(prompt, { model })
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

    // 11. Save output to database
    const { data: output, error: insertError } = await supabase
      .from('outputs')
      .insert({
        project_id,
        user_id: user.id,
        type,
        content: result.text,
        provider_used: provider,
        model_used: model,
        tokens_used: result.tokensUsed,
      })
      .select('id, project_id, type, content, provider_used, model_used, tokens_used, created_at')
      .single()

    if (insertError) {
      // Still return the generated content even if save fails
      return new Response(
        JSON.stringify({
          output: {
            type,
            content: result.text,
            provider_used: provider,
            model_used: model,
            tokens_used: result.tokensUsed,
          },
          warning: 'Content generated but failed to save. You may want to copy it now.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 12. Update project status to 'completed'
    await supabase
      .from('content_projects')
      .update({ status: 'completed' })
      .eq('id', project_id)

    // 13. Return generated content
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
