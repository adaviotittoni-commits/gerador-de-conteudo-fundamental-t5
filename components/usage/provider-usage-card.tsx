'use client'

import type { TokensByProvider } from '@/app/api/usage/route'

interface ProviderUsageCardProps {
  provider: TokensByProvider
  maxTokens: number
}

const providerConfig: Record<string, { label: string; color: string }> = {
  openai: { label: 'OpenAI', color: 'text-green-400' },
  gemini: { label: 'Gemini', color: 'text-blue-400' },
  anthropic: { label: 'Anthropic', color: 'text-orange-400' },
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`
  }
  return tokens.toLocaleString()
}

export function ProviderUsageCard({ provider, maxTokens }: ProviderUsageCardProps) {
  const config = providerConfig[provider.provider] ?? {
    label: provider.provider,
    color: 'text-on-surface',
  }

  const percentage = maxTokens > 0 ? (provider.total_tokens / maxTokens) * 100 : 0

  return (
    <div className="glass-panel rounded-xl p-6 group relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg bg-white/5 p-3 ${config.color}`}>
          <span className="material-symbols-rounded text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            data_usage
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
            {config.label}
          </p>
          <p className="font-display text-headline-lg text-on-surface">
            {formatTokens(provider.total_tokens)}
          </p>
          <p className="text-body-sm text-on-surface-variant">tokens</p>
        </div>
      </div>

      {/* Usage bar */}
      <div className="mt-4 bg-surface-container-highest h-1.5 rounded-full">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(percentage, 1)}%` }}
        />
      </div>
    </div>
  )
}
