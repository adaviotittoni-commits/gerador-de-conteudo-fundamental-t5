'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GenerationStatus, GenerationType } from '@/hooks/use-generation'

const TYPE_LABELS: Record<GenerationType, string> = {
  copy: 'Copy',
  narrative: 'Narrativa',
  hooks: 'Hooks',
  cta: 'CTA',
  image: 'Imagem',
}

interface GenerationTriggerProps {
  /** Whether generation is currently running */
  isGenerating: boolean
  /** Per-type generation statuses */
  statuses: Record<GenerationType, GenerationStatus>
  /** Callback to start the full generation pipeline */
  onGenerate: () => void
  /** Whether the project already has outputs (show "Regenerar Tudo" instead) */
  hasOutputs?: boolean
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Primary "Gerar Conteudo" button with per-type progress indicators.
 *
 * Design system: btn-gradient-primary with bolt icon.
 * Shows AI Thinking Line progress and per-type status during generation.
 */
export function GenerationTrigger({
  isGenerating,
  statuses,
  onGenerate,
  hasOutputs = false,
  className,
}: GenerationTriggerProps) {
  const activeStatuses = Object.values(statuses).filter(
    (s) => s.status !== 'idle',
  )
  const showProgress = activeStatuses.length > 0

  return (
    <div className={cn('space-y-4', className)}>
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className={cn(
          'btn-gradient-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
          'hover:scale-105 active:scale-95',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100',
        )}
      >
        <Zap className={cn('h-4 w-4', isGenerating && 'animate-pulse')} />
        {isGenerating
          ? 'Gerando...'
          : hasOutputs
            ? 'Regenerar Tudo'
            : 'Gerar Conteudo'}
      </button>

      {/* Per-type progress indicators */}
      {showProgress && (
        <div className="space-y-2">
          {Object.values(statuses).map((s) => {
            if (s.status === 'idle') return null

            return (
              <div
                key={s.type}
                className="flex items-center gap-3 text-sm"
              >
                {/* Status indicator */}
                {s.status === 'generating' && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                {s.status === 'completed' && (
                  <div className="flex h-3 w-3 items-center justify-center rounded-full bg-success">
                    <svg
                      className="h-2 w-2 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                {s.status === 'error' && (
                  <div className="flex h-3 w-3 items-center justify-center rounded-full bg-error text-white text-[8px] font-bold">
                    !
                  </div>
                )}

                <span
                  className={cn(
                    'text-on-surface-variant',
                    s.status === 'completed' && 'text-success',
                    s.status === 'error' && 'text-error',
                  )}
                >
                  {TYPE_LABELS[s.type]}
                </span>

                {s.error && (
                  <span className="text-xs text-error truncate max-w-xs">
                    {s.error}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* AI Thinking Line across the top during generation */}
      {isGenerating && <div className="progress-line w-full rounded" />}
    </div>
  )
}
