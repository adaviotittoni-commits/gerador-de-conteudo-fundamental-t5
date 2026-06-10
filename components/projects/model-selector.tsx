'use client'

import { useEffect, useState } from 'react'
import { ModelCard } from '@/components/projects/model-card'
import {
  getProvidersForProcess,
  PROCESS_LABELS,
} from '@/lib/providers/config'
import type {
  ContentProcess,
  ModelConfig,
  ModelSelection,
  Provider,
  Tier,
} from '@/lib/providers/types'
import { MODEL_TIERS } from '@/lib/providers/config'

interface ModelSelectorProps {
  modelConfig: Partial<ModelConfig>
  onChange: (config: Partial<ModelConfig>) => void
}

function makeSelection(provider: Provider, tier: Tier): ModelSelection {
  return {
    provider,
    model: MODEL_TIERS[provider][tier],
    tier,
  }
}

export function ModelSelector({ modelConfig, onChange }: ModelSelectorProps) {
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKeys() {
      try {
        const res = await fetch('/api/api-keys')
        if (!res.ok) {
          setAvailableProviders([])
          return
        }
        const data = await res.json()
        const providers = (data.keys ?? []).map(
          (k: { provider: Provider }) => k.provider,
        )
        setAvailableProviders(providers)
      } catch {
        setAvailableProviders([])
      } finally {
        setLoading(false)
      }
    }
    fetchKeys()
  }, [])

  function handleSelect(
    process: ContentProcess,
    provider: Provider,
    tier: Tier,
  ) {
    const selection = makeSelection(provider, tier)
    onChange({
      ...modelConfig,
      [process]: process === 'image' ? selection : selection,
    })
  }

  function isSelected(
    process: ContentProcess,
    provider: Provider,
    tier: Tier,
  ): boolean {
    const current = modelConfig[process]
    if (!current) return false
    return current.provider === provider && current.tier === tier
  }

  const processes: ContentProcess[] = ['copy', 'narrative', 'hooks', 'cta', 'image']

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-body-sm text-on-surface-variant">
          Carregando providers...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {processes.map((process) => {
        const providers = getProvidersForProcess(process)
        const tiers: Tier[] = ['mini', 'premium']

        return (
          <div key={process} className="space-y-3">
            <h3 className="text-label-lg text-on-surface font-medium">
              {PROCESS_LABELS[process]}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {providers.flatMap((provider) =>
                tiers.map((tier) => (
                  <ModelCard
                    key={`${provider}-${tier}`}
                    provider={provider}
                    tier={tier}
                    isSelected={isSelected(process, provider, tier)}
                    isAvailable={availableProviders.includes(provider)}
                    onSelect={() => handleSelect(process, provider, tier)}
                  />
                )),
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
