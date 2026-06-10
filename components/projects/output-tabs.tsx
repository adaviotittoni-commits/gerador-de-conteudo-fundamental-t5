'use client'

import { cn } from '@/lib/utils'
import type { Output } from '@/types'

export type OutputTabType = 'copy' | 'narrative' | 'hooks' | 'cta' | 'image'

const TAB_CONFIG: { type: OutputTabType; label: string }[] = [
  { type: 'copy', label: 'Copy' },
  { type: 'narrative', label: 'Narrativa' },
  { type: 'hooks', label: 'Hooks' },
  { type: 'cta', label: 'CTA' },
  { type: 'image', label: 'Imagem' },
]

interface OutputTabsProps {
  activeTab: OutputTabType
  onTabChange: (tab: OutputTabType) => void
  outputs: Output[]
  className?: string
}

/**
 * Tab bar for switching between output types.
 * Shows count badges when outputs exist for a tab.
 *
 * Design system: flex p-1 bg-surface-container rounded-xl border border-white/5
 */
export function OutputTabs({
  activeTab,
  onTabChange,
  outputs,
  className,
}: OutputTabsProps) {
  const countsByType = outputs.reduce<Record<string, number>>((acc, output) => {
    acc[output.type] = (acc[output.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div
      className={cn(
        'flex p-1 bg-surface-container rounded-xl border border-white/5',
        className,
      )}
      role="tablist"
      aria-label="Output types"
    >
      {TAB_CONFIG.map(({ type, label }) => {
        const count = countsByType[type] ?? 0
        const isActive = activeTab === type

        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${type}`}
            onClick={() => onTabChange(type)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all',
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs rounded-full',
                  isActive
                    ? 'bg-on-primary-container/15 text-on-primary-container'
                    : 'bg-white/10 text-on-surface-variant',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
