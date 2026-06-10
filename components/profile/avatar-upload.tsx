'use client'

import { useState, useRef } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Camera } from 'lucide-react'

interface AvatarUploadProps {
  profileId: string
  currentAvatarUrl: string | null
  onUploadComplete: (url: string) => void
}

export function AvatarUpload({
  profileId,
  currentAvatarUrl,
  onUploadComplete,
}: AvatarUploadProps) {
  const { supabase } = useSupabase()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }

    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    handleUpload(file)
  }

  async function handleUpload(file: File) {
    setIsUploading(true)
    setError(null)

    try {
      const ext = file.name.split('.').pop() || 'png'
      const filePath = `${profileId}/avatar.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Save avatar_url in profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId)

      if (updateError) {
        setError(`Failed to save avatar: ${updateError.message}`)
        return
      }

      onUploadComplete(publicUrl)
    } catch {
      setError('An unexpected error occurred during upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      {/* Avatar preview */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-surface-container transition-colors hover:border-primary/40"
        disabled={isUploading}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <span className="font-display text-2xl font-bold text-primary">
              ?
            </span>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="font-mono text-label-sm text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Change Avatar'}
        </button>
        <p className="text-xs text-on-surface-variant">
          JPG, PNG or GIF. Max 2MB.
        </p>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
