'use client'

import { useState } from 'react'
import { useUsage } from '@/hooks/use-usage'
import { UsagePeriodFilter } from '@/components/usage/usage-period-filter'
import { ProviderUsageCard } from '@/components/usage/provider-usage-card'
import { UsageByType } from '@/components/usage/usage-by-type'
import type { UsagePeriod } from '@/hooks/use-usage'

export default function UsagePage() {
  const [period, setPeriod] = useState<UsagePeriod>('30d')
  const { data, isLoading, error } = useUsage(period)

  const maxTokens = data
    ? Math.max(...data.tokensByProvider.map((p) => p.total_tokens), 0)
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <span
              className="material-symbols-rounded text-2xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              insights
            </span>
          </div>
          <div>
            <h1 className="font-display text-headline-lg text-on-surface">
              Metricas de Uso
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Acompanhe o consumo de tokens e outputs gerados
            </p>
          </div>
        </div>
        <UsagePeriodFilter period={period} onChange={setPeriod} />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-panel rounded-xl p-6 text-center">
          <p className="text-body-md text-error">
            Erro ao carregar metricas. Tente novamente.
          </p>
        </div>
      )}

      {/* Data loaded */}
      {data && !isLoading && (
        <div className="space-y-8">
          {/* Provider usage cards */}
          <section>
            <h2 className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant mb-4">
              Tokens por Provider
            </h2>
            {data.tokensByProvider.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {data.tokensByProvider.map((provider) => (
                  <ProviderUsageCard
                    key={provider.provider}
                    provider={provider}
                    maxTokens={maxTokens}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-6 text-center">
                <p className="text-body-md text-on-surface-variant">
                  Nenhum token consumido neste periodo
                </p>
              </div>
            )}
          </section>

          {/* Usage by type */}
          <section>
            <h2 className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant mb-4">
              Outputs por Tipo
            </h2>
            <UsageByType
              outputsByType={data.outputsByType}
              totalOutputs={data.totals.total_outputs}
            />
          </section>
        </div>
      )}
    </div>
  )
}
