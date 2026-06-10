import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'

// ---------------------------------------------------------------------------
// Rate Limiting — in-memory counter (max 10 req/min per user)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  // Clean up expired entries periodically (every 100 checks)
  if (rateLimitMap.size > 100) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt <= now) rateLimitMap.delete(key)
    }
  }

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// ---------------------------------------------------------------------------
// Provider validation helpers
// ---------------------------------------------------------------------------

type Provider = 'openai' | 'gemini' | 'anthropic'

async function validateOpenAI(
  key: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    })
    if (res.ok) return { valid: true }
    const body = await res.json().catch(() => ({}))
    return {
      valid: false,
      error: body?.error?.message || `OpenAI returned status ${res.status}`,
    }
  } catch (err) {
    return {
      valid: false,
      error: `Failed to reach OpenAI: ${(err as Error).message}`,
    }
  }
}

async function validateGemini(
  key: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    )
    if (res.ok) return { valid: true }
    const body = await res.json().catch(() => ({}))
    return {
      valid: false,
      error:
        body?.error?.message || `Gemini API returned status ${res.status}`,
    }
  } catch (err) {
    return {
      valid: false,
      error: `Failed to reach Gemini API: ${(err as Error).message}`,
    }
  }
}

async function validateAnthropic(
  key: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })
    // 200 = valid key; 401 = invalid key; other errors = key may be valid
    if (res.ok) return { valid: true }
    if (res.status === 401) {
      return { valid: false, error: 'Invalid Anthropic API key' }
    }
    // 400, 429, etc. — key format is accepted, treat as valid
    return { valid: true }
  } catch (err) {
    return {
      valid: false,
      error: `Failed to reach Anthropic API: ${(err as Error).message}`,
    }
  }
}

const validators: Record<
  Provider,
  (key: string) => Promise<{ valid: boolean; error?: string }>
> = {
  openai: validateOpenAI,
  gemini: validateGemini,
  anthropic: validateAnthropic,
}

// ---------------------------------------------------------------------------
// Edge Function entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate
    const user = await verifyAuth(req)

    // 2. Rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'RATE_LIMITED', message: 'Max 10 requests per minute. Please wait.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 3. Parse body
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const body = await req.json()
    const { provider, key } = body as { provider?: string; key?: string }

    if (!provider || !key) {
      return new Response(
        JSON.stringify({ error: 'INVALID_KEY', message: 'provider and key are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!['openai', 'gemini', 'anthropic'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_KEY', message: `Unsupported provider: ${provider}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 4. Validate key against provider
    const validate = validators[provider as Provider]
    const result = await validate(key)

    // 5. Update key status in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const newStatus = result.valid ? 'valid' : 'invalid'

    await supabase
      .from('api_keys')
      .update({ status: newStatus })
      .eq('user_id', user.id)
      .eq('provider', provider)

    // 6. Return result — NEVER include the key in the response
    return new Response(
      JSON.stringify({ valid: result.valid, error: result.error }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = (error as Error).message

    if (message === 'AUTH_REQUIRED') {
      return new Response(
        JSON.stringify({ error: 'AUTH_REQUIRED', message: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
