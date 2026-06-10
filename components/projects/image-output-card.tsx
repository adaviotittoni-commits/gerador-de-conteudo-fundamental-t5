'use client'

import { Download, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageOutputCardProps {
  /** The URL of the generated image */
  imageUrl: string
  /** The prompt used to generate the image */
  prompt: string
  /** The provider that generated the image (e.g. 'openai', 'gemini') */
  provider: string
  /** The model used for generation */
  model: string
  /** The date the image was created */
  createdAt: string
  /** Whether a regeneration is currently in progress */
  isRegenerating?: boolean
  /** Callback to regenerate this image */
  onRegenerate?: () => void
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Image output card with preview, hover zoom, and download button.
 * Follows the design system: glass-card, rounded-2xl, border-l-4 border-l-secondary.
 */
export function ImageOutputCard({
  imageUrl,
  prompt,
  provider,
  model,
  createdAt,
  isRegenerating = false,
  onRegenerate,
  className,
}: ImageOutputCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  function handleDownload() {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `image-${Date.now()}.png`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={cn(
        'glass-card group rounded-2xl border-l-4 border-l-secondary p-6 relative',
        'hover:-translate-y-1 transition-all',
        className,
      )}
    >
      {/* Progress line during regeneration */}
      {isRegenerating && (
        <div className="progress-line absolute top-0 left-0 right-0 rounded-t-2xl" />
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-label-md font-medium text-on-surface">Imagem</span>
          <span className="bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-full font-mono text-xs border border-tertiary/20">
            {provider}/{model}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download image"
            className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              aria-label="Regenerate image"
              className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <Zap
                className={cn(
                  'h-4 w-4 group-hover:rotate-12 transition-transform',
                  isRegenerating && 'animate-pulse',
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Image preview with hover zoom */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt={prompt}
          className="w-full rounded-xl object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Fade overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-3">
          <p className="text-sm text-white line-clamp-2">{prompt}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-end text-body-sm text-on-surface-variant">
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
