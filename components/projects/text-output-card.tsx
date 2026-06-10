'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type TextOutputType = 'copy' | 'narrative' | 'hooks' | 'cta'

const BORDER_COLORS: Record<TextOutputType, string> = {
  copy: 'border-l-primary',
  narrative: 'border-l-secondary',
  hooks: 'border-l-tertiary',
  cta: 'border-l-tertiary',
}

const TYPE_LABELS: Record<TextOutputType, string> = {
  copy: 'Copy',
  narrative: 'Narrativa',
  hooks: 'Hooks',
  cta: 'CTA',
}

interface TextOutputCardProps {
  /** The text content of the output */
  content: string
  /** The type of text output */
  type: TextOutputType
  /** The provider that generated the output */
  provider: string
  /** The model used for generation */
  model: string
  /** ISO date string of when the output was created */
  createdAt: string
  /** Whether a regeneration is currently in progress */
  isRegenerating?: boolean
  /** Callback to regenerate this output type */
  onRegenerate?: () => void
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Card for displaying a text-based generation output.
 *
 * Design system: glass-card, rounded-2xl, border-l-4 (color by type),
 * AI Chip for model, copy button, char/word count in footer.
 */
export function TextOutputCard({
  content,
  type,
  provider,
  model,
  createdAt,
  isRegenerating = false,
  onRegenerate,
  className,
}: TextOutputCardProps) {
  const [copied, setCopied] = useState(false)

  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const charCount = content.length
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing — clipboard may be unavailable
    }
  }, [content])

  return (
    <div
      className={cn(
        'glass-card group rounded-2xl border-l-4 p-6 relative',
        BORDER_COLORS[type],
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
          <span className="text-label-md font-medium text-on-surface">
            {TYPE_LABELS[type]}
          </span>
          {/* AI Chip */}
          <span className="bg-tertiary/10 text-tertiary px-3 py-1.5 rounded-full font-mono text-xs border border-tertiary/20">
            {provider}/{model}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
            className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          {/* Regenerate button */}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              aria-label="Regenerate"
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

      {/* Body */}
      <div className="text-body-md leading-relaxed text-on-surface whitespace-pre-wrap">
        {content}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span>{charCount} chars</span>
          <span>{wordCount} words</span>
        </div>
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
