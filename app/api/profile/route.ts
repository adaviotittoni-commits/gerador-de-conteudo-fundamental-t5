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
    console.error('Failed to fetch profile:', error)

    // If profile doesn't exist, create it
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, name: '' })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 },
        )
      }

      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }

  const mappedProfile = {
    ...profile,
    full_name: profile.name,
    youtube_url: profile.social_urls?.youtube ?? '',
    instagram_url: profile.social_urls?.instagram ?? '',
  }

  return NextResponse.json({ profile: mappedProfile })
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
    name: result.data.full_name,
    niche: result.data.niche ?? '',
    target_audience: result.data.target_audience ?? '',
    brand_colors: result.data.brand_colors ?? [],
    preferred_fonts: result.data.preferred_fonts ?? [],
    social_urls: {
      youtube: result.data.youtube_url || null,
      instagram: result.data.instagram_url || null,
    },
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...profileData })
    .select()
    .single()

  if (error) {
    console.error('Failed to update profile:', JSON.stringify(error, null, 2))
    console.error('Profile data sent:', JSON.stringify({ id: user.id, ...profileData }, null, 2))
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 },
    )
  }

  const mappedProfile = {
    ...profile,
    full_name: profile.name,
    youtube_url: profile.social_urls?.youtube ?? '',
    instagram_url: profile.social_urls?.instagram ?? '',
  }

  return NextResponse.json({ profile: mappedProfile, message: 'Profile updated successfully' })
}
