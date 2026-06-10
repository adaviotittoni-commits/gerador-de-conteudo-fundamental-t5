'use client'

import { Check } from 'lucide-react'
import { MODEL_TIERS, PROVIDER_LABELS } from '@/lib/providers/config'
import type { Provider, Tier } from '@/lib/providers/types'

interface ModelCardProps {
  provider: Provider
  tier: Tier
  isSelected: boolean
  isAvailable: boolean
  onSelect: () => void
}

export function ModelCard({
  provider,
  tier,
  isSelected,
  isAvailable,
  onSelect,
}: ModelCardProps) {
  const modelName = MODEL_TIERS[provider][tier]
  const providerLabel = PROVIDER_LABELS[provider]

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!isAvailable}
      className={`relative flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors ${
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : isAvailable
            ? 'border-outline-variant hover:border-primary/30'
            : 'cursor-not-allowed border-outline-variant opacity-50'
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Provider name */}
      <span className="text-label-md text-on-surface font-medium">
        {providerLabel}
      </span>

      {/* Model name */}
      <span className="font-mono text-body-sm text-on-surface-variant">
        {modelName}
      </span>

      {/* Tier badge */}
      <span
        className={`inline-flex w-fit rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${
          tier === 'mini'
            ? 'bg-tertiary/10 text-tertiary'
            : 'bg-secondary/10 text-secondary'
        }`}
      >
        {tier}
      </span>

      {/* Unavailable message */}
      {!isAvailable && (
        <span className="text-label-sm text-error">Key nao cadastrada</span>
      )}
    </button>
  )
}
