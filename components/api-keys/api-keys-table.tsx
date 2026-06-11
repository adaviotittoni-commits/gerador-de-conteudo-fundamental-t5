'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddKeyDialog } from '@/components/api-keys/add-key-dialog'
import { DeleteKeyDialog } from '@/components/api-keys/delete-key-dialog'
import type { ApiKey } from '@/types'

const providerConfig = {
  openai: { label: 'OpenAI', icon: '🤖' },
  google_gemini: { label: 'Google Gemini', icon: '✨' },
  anthropic: { label: 'Anthropic', icon: '🧠' },
} as const

function StatusDot({ status }: { status: ApiKey['status'] }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          status === 'valid' &&
            'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]',
          status === 'invalid' && 'bg-error',
          status === 'pending' && 'bg-warning',
        )}
      />
      <span className="text-body-sm text-on-surface-variant capitalize">
        {status}
      </span>
    </span>
  )
}

interface ApiKeysTableProps {
  keys: Omit<ApiKey, 'encrypted_key'>[]
  onKeyAdded: () => void
  onKeyDeleted: () => void
}

export function ApiKeysTable({
  keys,
  onKeyAdded,
  onKeyDeleted,
}: ApiKeysTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Omit<
    ApiKey,
    'encrypted_key'
  > | null>(null)

  async function handleDelete(id: string) {
    const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
    if (res.ok) {
      onKeyDeleted()
    }
    setDeleteTarget(null)
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border-b border-white/5 px-6 py-4">
        <h2 className="font-display text-title-md text-on-surface">
          API Keys
        </h2>
        <AddKeyDialog onKeyAdded={onKeyAdded} existingProviders={keys.map((k) => k.provider)} />
      </div>

      {/* Table */}
      {keys.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-body-md text-on-surface-variant">
            No API keys configured yet. Add your first key to get started.
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-3 text-left font-mono text-label-sm uppercase text-on-surface-variant">
                Provider
              </th>
              <th className="px-6 py-3 text-left font-mono text-label-sm uppercase text-on-surface-variant">
                Key
              </th>
              <th className="px-6 py-3 text-left font-mono text-label-sm uppercase text-on-surface-variant">
                Status
              </th>
              <th className="px-6 py-3 text-right font-mono text-label-sm uppercase text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keys.map((apiKey) => {
              const provider = providerConfig[apiKey.provider]
              return (
                <tr
                  key={apiKey.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-body-md text-on-surface">
                      <span>{provider.icon}</span>
                      {provider.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-body-sm text-on-surface-variant opacity-60">
                      sk-...{apiKey.key_suffix}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDot status={apiKey.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(apiKey)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-sm text-error hover:bg-error/10 transition-colors"
                      aria-label={`Remove ${provider.label} key`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Delete confirmation dialog */}
      <DeleteKeyDialog
        apiKey={deleteTarget}
        onConfirm={(id) => handleDelete(id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
