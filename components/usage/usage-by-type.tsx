'use client'

import type { OutputsByType } from '@/app/api/usage/route'

interface UsageByTypeProps {
  outputsByType: OutputsByType[]
  totalOutputs: number
}

const typeConfig: Record<string, { label: string; icon: string }> = {
  copy: { label: 'Copy', icon: 'content_copy' },
  narrative: { label: 'Narrativa', icon: 'auto_stories' },
  hooks: { label: 'Hooks', icon: 'link' },
  cta: { label: 'CTA', icon: 'ads_click' },
  image: { label: 'Imagem', icon: 'image' },
}

export function UsageByType({ outputsByType, totalOutputs }: UsageByTypeProps) {
  const maxCount = Math.max(...outputsByType.map((o) => o.count), 1)

  return (
    <div className="space-y-4">
      {/* Total outputs card */}
      <div className="glass-panel rounded-xl p-6 group relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-tertiary/10 p-3 text-tertiary">
            <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
          </div>
          <div>
            <p className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
              Total de Outputs
            </p>
            <p className="font-display text-headline-xl text-on-surface">
              {totalOutputs}
            </p>
          </div>
        </div>
      </div>

      {/* Per-type breakdown */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {['copy', 'narrative', 'hooks', 'cta', 'image'].map((type) => {
          const entry = outputsByType.find((o) => o.type === type)
          const count = entry?.count ?? 0
          const config = typeConfig[type] ?? { label: type, icon: 'help' }
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <div
              key={type}
              className="glass-panel rounded-xl p-4 group relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-rounded text-sm text-on-surface-variant">
                  {config.icon}
                </span>
                <p className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  {config.label}
                </p>
              </div>
              <p className="font-display text-headline-lg text-on-surface">
                {count}
              </p>

              {/* Usage bar */}
              <div className="mt-2 bg-surface-container-highest h-1.5 rounded-full">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
