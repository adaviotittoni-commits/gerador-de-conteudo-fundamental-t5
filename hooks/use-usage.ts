'use client'

import useSWR from 'swr'
import type { UsageResponse } from '@/app/api/usage/route'

export type UsagePeriod = '7d' | '30d' | 'all'

async function fetchUsage(url: string): Promise<UsageResponse> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch usage metrics')
  }

  return response.json()
}

interface UseUsageReturn {
  data: UsageResponse | undefined
  isLoading: boolean
  error: Error | undefined
}

export function useUsage(period: UsagePeriod): UseUsageReturn {
  const { data, error, isLoading } = useSWR<UsageResponse>(
    `/api/usage?period=${period}`,
    fetchUsage,
    {
      revalidateOnFocus: false,
    },
  )

  return {
    data,
    isLoading,
    error,
  }
}
