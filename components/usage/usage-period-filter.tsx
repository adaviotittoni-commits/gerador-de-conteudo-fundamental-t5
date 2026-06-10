'use client'

import { cn } from '@/lib/utils'
import type { UsagePeriod } from '@/hooks/use-usage'

interface UsagePeriodFilterProps {
  period: UsagePeriod
  onChange: (period: UsagePeriod) => void
}

const periods: { value: UsagePeriod; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'all', label: 'Total' },
]

export function UsagePeriodFilter({ period, onChange }: UsagePeriodFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-surface-container p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'rounded-md px-4 py-2 font-mono text-label-sm transition-colors',
            period === p.value
              ? 'bg-primary/10 text-primary'
              : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
