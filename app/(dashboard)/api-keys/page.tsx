'use client'

import useSWR from 'swr'
import { ApiKeysTable } from '@/components/api-keys/api-keys-table'
import { ProviderInfoCard } from '@/components/api-keys/provider-card'
import type { ApiKey } from '@/types'

type ApiKeyRow = Omit<ApiKey, 'encrypted_key'>

async function fetcher(url: string): Promise<ApiKeyRow[]> {
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return data.keys ?? []
}

export default function ApiKeysPage() {
  const { data: keys, isLoading, mutate } = useSWR('/api/api-keys', fetcher)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface">
            API Keys
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Manage your AI provider API keys for content generation
          </p>
        </div>
      </div>

      {/* Bento Grid: Content (8 cols) + Sidebar (4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <div className="progress-line mx-auto w-48 rounded" />
              <p className="mt-4 text-body-sm text-on-surface-variant">
                Loading keys...
              </p>
            </div>
          ) : (
            <ApiKeysTable
              keys={keys ?? []}
              onKeyAdded={() => mutate()}
              onKeyDeleted={() => mutate()}
            />
          )}
        </div>
        <div className="lg:col-span-4">
          <ProviderInfoCard />
        </div>
      </div>
    </div>
  )
}
