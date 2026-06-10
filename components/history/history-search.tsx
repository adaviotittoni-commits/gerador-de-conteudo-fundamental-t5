'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistorySearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Search input for the history page.
 *
 * Design system: bg-surface-container-highest/50 border-white/10 rounded-full,
 * search icon on the left.
 */
export function HistorySearch({ value, onChange, className }: HistorySearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar nos outputs..."
        aria-label="Buscar nos outputs"
        className="w-full bg-surface-container-highest/50 border border-white/10 rounded-full py-3 pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
      />
    </div>
  )
}
