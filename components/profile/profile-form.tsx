'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import type { Profile } from '@/types'

interface ProfileFormProps {
  profile: Profile
  isNewUser?: boolean
}

export function ProfileForm({ profile, isNewUser = false }: ProfileFormProps) {
  const [serverMessage, setServerMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatar_url,
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      niche: profile.niche || '',
      target_audience: profile.target_audience || '',
      brand_colors: profile.brand_colors || [],
      preferred_fonts: profile.preferred_fonts || [],
      youtube_url: profile.youtube_url || '',
      instagram_url: profile.instagram_url || '',
    },
  })

  const brandColors = watch('brand_colors') ?? []

  function handleAddColor() {
    if (brandColors.length < 10) {
      setValue('brand_colors', [...brandColors, '#c0c1ff'])
    }
  }

  function handleRemoveColor(index: number) {
    setValue(
      'brand_colors',
      brandColors.filter((_, i) => i !== index),
    )
  }

  function handleColorChange(index: number, value: string) {
    const updated = [...brandColors]
    updated[index] = value
    setValue('brand_colors', updated)
  }

  async function onSubmit(data: ProfileFormData) {
    setServerMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerMessage({
          type: 'error',
          text: json.error || 'Failed to update profile',
        })
        return
      }

      setServerMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      })
    } catch {
      setServerMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner for new users */}
      {isNewUser && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-primary">
            Welcome to Stitch AI!
          </h3>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Fill in your profile so we can personalize content generation for
            you.
          </p>
        </div>
      )}

      {/* Status messages */}
      {serverMessage && (
        <div
          className={
            serverMessage.type === 'success'
              ? 'rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3'
              : 'rounded-xl border border-error/20 bg-error-container/20 px-4 py-3'
          }
        >
          <p
            className={
              serverMessage.type === 'success'
                ? 'text-sm text-green-400'
                : 'text-sm text-error'
            }
          >
            {serverMessage.text}
          </p>
        </div>
      )}

      {/* Avatar upload */}
      <AvatarUpload
        profileId={profile.id}
        currentAvatarUrl={avatarUrl}
        onUploadComplete={(url) => setAvatarUrl(url)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="font-mono text-label-sm uppercase tracking-wider text-primary"
          >
            Name *
          </label>
          <input
            id="full_name"
            type="text"
            placeholder="Your full name"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-sm text-error">{errors.full_name.message}</p>
          )}
        </div>

        {/* Niche */}
        <div className="space-y-2">
          <label
            htmlFor="niche"
            className="font-mono text-label-sm uppercase tracking-wider text-primary"
          >
            Niche
          </label>
          <input
            id="niche"
            type="text"
            placeholder="e.g. Tech, Fitness, Cooking"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            {...register('niche')}
          />
          {errors.niche && (
            <p className="text-sm text-error">{errors.niche.message}</p>
          )}
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label
            htmlFor="target_audience"
            className="font-mono text-label-sm uppercase tracking-wider text-primary"
          >
            Target Audience
          </label>
          <textarea
            id="target_audience"
            rows={3}
            placeholder="Describe your target audience"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            {...register('target_audience')}
          />
          {errors.target_audience && (
            <p className="text-sm text-error">
              {errors.target_audience.message}
            </p>
          )}
        </div>

        {/* Brand Colors */}
        <div className="space-y-2">
          <label className="font-mono text-label-sm uppercase tracking-wider text-primary">
            Brand Colors
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {brandColors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-outline-variant bg-transparent"
                />
                <span className="font-mono text-xs text-on-surface-variant">
                  {color}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="rounded px-1 text-sm text-on-surface-variant hover:text-error"
                >
                  x
                </button>
              </div>
            ))}
            {brandColors.length < 10 && (
              <button
                type="button"
                onClick={handleAddColor}
                className="rounded-lg border border-dashed border-outline-variant px-3 py-2 font-mono text-label-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                + Add Color
              </button>
            )}
          </div>
        </div>

        {/* Social URLs */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="youtube_url"
              className="font-mono text-label-sm uppercase tracking-wider text-primary"
            >
              YouTube URL
            </label>
            <input
              id="youtube_url"
              type="url"
              placeholder="https://youtube.com/@yourchannel"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              {...register('youtube_url')}
            />
            {errors.youtube_url && (
              <p className="text-sm text-error">
                {errors.youtube_url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="instagram_url"
              className="font-mono text-label-sm uppercase tracking-wider text-primary"
            >
              Instagram URL
            </label>
            <input
              id="instagram_url"
              type="url"
              placeholder="https://instagram.com/yourprofile"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              {...register('instagram_url')}
            />
            {errors.instagram_url && (
              <p className="text-sm text-error">
                {errors.instagram_url.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-6 py-3 font-mono text-label-md text-on-primary-fixed transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
