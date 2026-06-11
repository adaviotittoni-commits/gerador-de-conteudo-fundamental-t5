'use client'

import Link from 'next/link'
import { Trash2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProjectWithOutputCount } from '@/hooks/use-projects'

const statusConfig = {
  draft: {
    label: 'Rascunho',
    className: 'bg-warning/10 text-warning',
  },
  generating: {
    label: 'Gerando',
    className: 'bg-primary/10 text-primary animate-pulse',
  },
  completed: {
    label: 'Concluido',
    className: 'bg-success/10 text-success',
  },
  error: {
    label: 'Erro',
    className: 'bg-error/10 text-error',
  },
} as const

const borderColorByStatus = {
  draft: 'border-l-warning',
  generating: 'border-l-primary',
  completed: 'border-l-success',
  error: 'border-l-error',
} as const

function truncateTitle(text: string, maxWords = 8): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return words.slice(0, maxWords).join(' ') + '...'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface ProjectCardProps {
  project: ProjectWithOutputCount
  onDelete: (project: ProjectWithOutputCount) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const borderColor = borderColorByStatus[project.status]

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 border-l-4 group cursor-pointer transition-all hover:scale-[1.01]',
        borderColor,
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        className="block space-y-3"
      >
        {/* Header: title + status badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-title-md text-on-surface line-clamp-2">
            {truncateTitle(project.input_text)}
          </h3>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-mono text-label-sm',
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>

        {/* Body: briefing preview */}
        <p className="text-body-sm text-on-surface-variant line-clamp-2">
          {project.input_text}
        </p>

        {/* Footer: date + output count */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-label-sm text-on-surface-variant">
            {formatDate(project.created_at)}
          </span>
          <div className="flex items-center gap-1 font-mono text-label-sm text-on-surface-variant">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {project.output_count}{' '}
              {project.output_count === 1 ? 'output' : 'outputs'}
            </span>
          </div>
        </div>
      </Link>

      {/* Delete button — outside the link */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(project)
          }}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-label-sm text-error transition-colors hover:bg-error/10"
          aria-label={`Deletar projeto ${truncateTitle(project.input_text, 4)}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Deletar
        </button>
      </div>
    </div>
  )
}
