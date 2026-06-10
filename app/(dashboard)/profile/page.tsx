import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists yet (edge case), create a default
  const defaultProfile = {
    id: user.id,
    full_name: '',
    niche: '',
    target_audience: '',
    brand_colors: [] as string[],
    preferred_fonts: [] as string[],
    youtube_url: null,
    instagram_url: null,
    tone_of_voice: null,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const currentProfile = profile ?? defaultProfile
  const isNewUser = !currentProfile.full_name

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface">
            Profile
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Manage your creator profile and brand identity
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <ProfileForm profile={currentProfile} isNewUser={isNewUser} />
      </div>
    </div>
  )
}
