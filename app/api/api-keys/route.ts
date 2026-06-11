import { encryptApiKey } from '@/lib/crypto'
import { createClient } from '@/lib/supabase/server'
import { addApiKeySchema } from '@/lib/validations/api-keys'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, user_id, provider, key_hint, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 },
    )
  }

  const mappedKeys = (keys ?? []).map((k) => ({
    ...k,
    key_suffix: k.key_hint,
  }))

  return NextResponse.json({ keys: mappedKeys })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    )
  }

  const result = addApiKeySchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 },
    )
  }

  const { provider, key } = result.data
  const keySuffix = key.slice(-4)

  // Encrypt the API key before storing (Story 2.2)
  let encryptedKey: string
  try {
    encryptedKey = await encryptApiKey(key)
  } catch {
    return NextResponse.json(
      { error: 'Failed to encrypt API key. Server configuration issue.' },
      { status: 500 },
    )
  }

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .upsert(
      {
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
        key_hint: keySuffix,
        status: 'pending',
      },
      { onConflict: 'user_id,provider' },
    )
    .select('id, user_id, provider, key_hint, status, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: `A key for ${provider} already exists. Remove it first.` },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 },
    )
  }

  const mappedKey = { ...apiKey, key_suffix: apiKey.key_hint }

  return NextResponse.json(
    { key: mappedKey, message: 'API key saved successfully' },
    { status: 201 },
  )
}
