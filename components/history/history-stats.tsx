'use client'

import {
  FileText,
  BookOpen,
  Anchor,
  MousePointerClick,
  ImageIcon,
  Layers,
} from 'lucide-react'
import type { OutputStats } from '@/hooks/use-outputs'

interface HistoryStatsProps {
  stats: OutputStats
  isLoading?: boolean
}

const STAT_ITEMS: {
  key: keyof OutputStats
  label: string
  icon: typeof FileText
}[] = [
  { key: 'total', label: 'Total', icon: Layers },
  { key: 'copy', label: 'Copy', icon: FileText },
  { key: 'narrative', label: 'Narrativa', icon: BookOpen },
  { key: 'hooks', label: 'Hooks', icon: Anchor },
  { key: 'cta', label: 'CTA', icon: MousePointerClick },
  { key: 'image', label: 'Imagem', icon: ImageIcon },
]

/**
 * Stats bento grid showing output counts per type.
 * Design system: grid-cols-2 md:grid-cols-4, glass-card stat items.
 */
export function HistoryStats({ stats, isLoading = false }: HistoryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="glass-card flex items-center gap-3 rounded-xl p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-body-sm text-on-surface-variant truncate">
              {label}
            </p>
            {isLoading ? (
              <div className="mt-1 h-6 w-8 animate-pulse rounded bg-white/10" />
            ) : (
              <p className="font-display text-title-lg text-on-surface">
                {stats[key]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
