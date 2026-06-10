'use client'

import { Loader2 } from 'lucide-react'
import { OutputPreview } from '@/components/history/output-preview'
import type { Output } from '@/types'

interface HistoryListProps {
  outputs: Output[]
  total: number
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

/**
 * List of output previews with load-more pagination.
 */
export function HistoryList({
  outputs,
  total,
  isLoading,
  hasMore,
  onLoadMore,
}: HistoryListProps) {
  if (isLoading && outputs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isLoading && outputs.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-body-md text-on-surface-variant">
          Nenhum output encontrado.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Count */}
      <p className="font-mono text-label-sm text-on-surface-variant">
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </p>

      {/* Output list */}
      <div className="space-y-3">
        {outputs.map((output) => (
          <OutputPreview key={output.id} output={output} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-lg px-6 py-2 font-mono text-label-md text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Carregar mais'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
