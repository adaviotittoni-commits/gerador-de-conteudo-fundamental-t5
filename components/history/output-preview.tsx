'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Output } from '@/types'

const TYPE_LABELS: Record<Output['type'], string> = {
  copy: 'Copy',
  narrative: 'Narrativa',
  hooks: 'Hooks',
  cta: 'CTA',
  image: 'Imagem',
}

const BORDER_COLORS: Record<Output['type'], string> = {
  copy: 'border-l-primary',
  narrative: 'border-l-secondary',
  hooks: 'border-l-tertiary',
  cta: 'border-l-tertiary',
  image: 'border-l-secondary',
}

interface OutputPreviewProps {
  output: Output
  className?: string
}

/**
 * Inline expandable preview for an output in the history list.
 *
 * Text outputs: show truncated 2-line preview, expand to full content.
 * Image outputs: show thumbnail, expand to full size.
 * Actions: copy (text), download (image), "Ver Projeto" link.
 */
export function OutputPreview({ output, className }: OutputPreviewProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const isImage = output.type === 'image'
  const formattedDate = new Date(output.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleCopy = useCallback(async () => {
    if (!output.content) return
    try {
      await navigator.clipboard.writeText(output.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable
    }
  }, [output.content])

  function handleDownload() {
    if (!output.file_url) return
    const link = document.createElement('a')
    link.href = output.file_url
    link.download = `image-${output.id}.png`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={cn(
        'glass-card rounded-xl border-l-4 p-4 transition-all',
        BORDER_COLORS[output.type],
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-label-md font-medium text-on-surface shrink-0">
            {TYPE_LABELS[output.type]}
          </span>
          <span className="bg-tertiary/10 text-tertiary px-2 py-1 rounded-full font-mono text-xs border border-tertiary/20 shrink-0">
            {output.provider_used}/{output.model_used}
          </span>
          <span className="text-body-sm text-on-surface-variant truncate">
            {formattedDate}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!isImage && output.content && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copiado' : 'Copiar'}
              className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}

          {isImage && output.file_url && (
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Download"
              className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          <Link
            href={`/dashboard/projects/${output.project_id}`}
            className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Ver Projeto"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Recolher' : 'Expandir'}
            aria-expanded={expanded}
            className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview / expanded content */}
      {isImage ? (
        <div className={cn('mt-3', expanded ? '' : 'max-h-24 overflow-hidden')}>
          {output.file_url && (
            <img
              src={output.file_url}
              alt={output.content ?? 'Generated image'}
              className={cn(
                'rounded-lg object-cover transition-all',
                expanded ? 'w-full max-w-lg' : 'h-20 w-20',
              )}
            />
          )}
        </div>
      ) : (
        <div className="mt-3">
          <p
            className={cn(
              'text-body-md text-on-surface whitespace-pre-wrap',
              !expanded && 'line-clamp-2',
            )}
          >
            {output.content}
          </p>
        </div>
      )}
    </div>
  )
}
