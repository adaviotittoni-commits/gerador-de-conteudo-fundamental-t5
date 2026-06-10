'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { ContentProject } from '@/types'

export interface ProjectWithOutputCount extends ContentProject {
  output_count: number
}

interface ProjectsResponse {
  projects: ProjectWithOutputCount[]
  isLoading: boolean
  error: Error | undefined
  mutate: ReturnType<typeof useSWR<ProjectWithOutputCount[]>>['mutate']
}

async function fetchProjects(): Promise<ProjectWithOutputCount[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('content_projects')
    .select('*, content_outputs(count)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  return (data ?? []).map((project) => {
    const outputCount =
      Array.isArray(project.content_outputs) && project.content_outputs.length > 0
        ? (project.content_outputs[0] as { count: number }).count
        : 0

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content_outputs, ...rest } = project
    return {
      ...rest,
      output_count: outputCount,
    } as ProjectWithOutputCount
  })
}

export function useProjects(): ProjectsResponse {
  const { data, error, isLoading, mutate } = useSWR<ProjectWithOutputCount[]>(
    'projects',
    fetchProjects,
    {
      revalidateOnFocus: false,
    },
  )

  return {
    projects: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to delete project')
  }
}
