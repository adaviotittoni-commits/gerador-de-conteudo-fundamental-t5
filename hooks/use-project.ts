'use client'

import useSWR from 'swr'
import type { ContentProject, Output } from '@/types'

export interface ProjectWithOutputs extends ContentProject {
  outputs: Output[]
}

interface ProjectResponse {
  project: ProjectWithOutputs
}

async function fetchProject(url: string): Promise<ProjectWithOutputs> {
  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(body.error ?? `Failed to fetch project (${res.status})`)
  }

  const data: ProjectResponse = await res.json()
  return data.project
}

/**
 * SWR hook to fetch a single project with all its outputs.
 *
 * Polls every 5 seconds while the project status is 'generating'
 * so the UI updates as outputs arrive.
 */
export function useProject(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/projects/${id}` : null,
    fetchProject,
    {
      refreshInterval: (latestData) =>
        latestData?.status === 'generating' ? 5000 : 0,
      revalidateOnFocus: true,
    },
  )

  return {
    project: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
