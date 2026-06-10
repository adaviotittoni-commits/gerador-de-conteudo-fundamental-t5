'use client'

import { cn } from '@/lib/utils'

type ProjectStatus = 'draft' | 'generating' | 'completed' | 'error'

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; classes: string }
> = {
  draft: {
    label: 'Rascunho',
    classes: 'bg-surface-container-high text-on-surface-variant',
  },
  generating: {
    label: 'Gerando...',
    classes: 'bg-primary/15 text-primary animate-pulse',
  },
  completed: {
    label: 'Concluido',
    classes: 'bg-success/15 text-success',
  },
  error: {
    label: 'Erro',
    classes: 'bg-error/15 text-error',
  },
}

interface ProjectHeaderProps {
  /** Project title (derived from input text) */
  title: string
  /** Current project status */
  status: ProjectStatus
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Project page header showing title and status badge.
 */
export function ProjectHeader({
  title,
  status,
  className,
}: ProjectHeaderProps) {
  const statusConfig = STATUS_CONFIG[status]

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-on-surface truncate">
          {title}
        </h1>
      </div>
      <span
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shrink-0',
          statusConfig.classes,
        )}
      >
        {statusConfig.label}
      </span>
    </div>
  )
}
