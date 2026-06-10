'use client'

import useSWR from 'swr'
import type { Output } from '@/types'

export interface OutputFilters {
  type?: Output['type'] | null
  project_id?: string | null
  search?: string | null
  date_from?: string | null
  date_to?: string | null
  limit?: number
  offset?: number
}

export interface OutputsResponse {
  outputs: Output[]
  total: number
  limit: number
  offset: number
}

export interface OutputStats {
  total: number
  copy: number
  narrative: number
  hooks: number
  cta: number
  image: number
}

function buildUrl(filters: OutputFilters): string {
  const params = new URLSearchParams()

  if (filters.type) params.set('type', filters.type)
  if (filters.project_id) params.set('project_id', filters.project_id)
  if (filters.search) params.set('search', filters.search)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.offset) params.set('offset', String(filters.offset))

  const qs = params.toString()
  return `/api/outputs${qs ? `?${qs}` : ''}`
}

async function fetchOutputs(url: string): Promise<OutputsResponse> {
  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(body.error ?? `Failed to fetch outputs (${res.status})`)
  }

  return res.json()
}

/**
 * SWR hook for fetching paginated + filtered outputs.
 */
export function useOutputs(filters: OutputFilters = {}) {
  const url = buildUrl(filters)

  const { data, error, isLoading, mutate } = useSWR<OutputsResponse>(
    url,
    fetchOutputs,
    { revalidateOnFocus: false },
  )

  return {
    outputs: data?.outputs ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? 20,
    offset: data?.offset ?? 0,
    isLoading,
    error,
    mutate,
  }
}

/**
 * SWR hook for fetching output stats (counts per type).
 * Fetches all outputs without pagination to compute totals.
 */
export function useOutputStats() {
  const url = '/api/outputs?limit=100&offset=0'

  const { data, isLoading, error } = useSWR<OutputsResponse>(
    `${url}&_stats`,
    () => fetchOutputs(url),
    { revalidateOnFocus: false },
  )

  const stats: OutputStats = {
    total: data?.total ?? 0,
    copy: 0,
    narrative: 0,
    hooks: 0,
    cta: 0,
    image: 0,
  }

  if (data?.outputs) {
    for (const output of data.outputs) {
      if (output.type in stats) {
        stats[output.type as keyof Omit<OutputStats, 'total'>]++
      }
    }
    // Use total from API (which is the exact count), not just the fetched page
    stats.total = data.total
  }

  return { stats, isLoading, error }
}
