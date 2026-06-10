import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations/profile'
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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }

  return NextResponse.json({ profile })
}

export async function PUT(request: Request) {
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

  const result = profileSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 },
    )
  }

  const profileData = {
    full_name: result.data.full_name,
    niche: result.data.niche ?? '',
    target_audience: result.data.target_audience ?? '',
    brand_colors: result.data.brand_colors ?? [],
    preferred_fonts: result.data.preferred_fonts ?? [],
    youtube_url: result.data.youtube_url || null,
    instagram_url: result.data.instagram_url || null,
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    )
  }

  return NextResponse.json({ profile, message: 'Profile updated successfully' })
}
