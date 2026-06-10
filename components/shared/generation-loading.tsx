'use client'

import { cn } from '@/lib/utils'

export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error'

interface GenerationLoadingProps {
  type: string
  status: GenerationStatus
  className?: string
}

const TYPE_LABELS: Record<string, string> = {
  copy: 'Copy',
  narrative: 'Narrative',
  hooks: 'Hooks',
  cta: 'CTA',
}

/**
 * Loading indicator for content generation.
 * Uses the progress-line animation from the design system.
 */
export function GenerationLoading({ type, status, className }: GenerationLoadingProps) {
  const label = TYPE_LABELS[type] ?? type

  if (status === 'idle') return null

  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 bg-card p-4',
        status === 'error' && 'border-red-500/50',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {status === 'generating' && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        {status === 'completed' && (
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            !
          </div>
        )}
        <span className="text-sm font-medium text-foreground">
          {status === 'generating' && `Generating ${label}...`}
          {status === 'completed' && `${label} ready`}
          {status === 'error' && `${label} failed`}
        </span>
      </div>

      {status === 'generating' && (
        <div className="progress-line mt-3 w-full rounded-full" />
      )}
    </div>
  )
}

interface GenerationLoadingGroupProps {
  statuses: Record<string, GenerationStatus>
  className?: string
}

/**
 * Display loading states for multiple generation types at once.
 */
export function GenerationLoadingGroup({ statuses, className }: GenerationLoadingGroupProps) {
  const activeTypes = Object.entries(statuses).filter(([, s]) => s !== 'idle')

  if (activeTypes.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {activeTypes.map(([type, status]) => (
        <GenerationLoading key={type} type={type} status={status} />
      ))}
    </div>
  )
}
