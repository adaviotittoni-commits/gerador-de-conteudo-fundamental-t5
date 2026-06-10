'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { HistoryStats } from '@/components/history/history-stats'
import { HistoryFilters } from '@/components/history/history-filters'
import { HistorySearch } from '@/components/history/history-search'
import { HistoryList } from '@/components/history/history-list'
import { useOutputs, useOutputStats } from '@/hooks/use-outputs'
import { useProjects } from '@/hooks/use-projects'
import type { HistoryTabType } from '@/components/history/history-filters'

const PAGE_SIZE = 20

export default function HistoryPage() {
  // Filter state
  const [activeTab, setActiveTab] = useState<HistoryTabType>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Reset pagination when filters change
  useEffect(() => {
    setPageSize(PAGE_SIZE)
  }, [activeTab, selectedProjectId, dateFrom, dateTo, debouncedSearch])

  // Fetch outputs with filters
  const { outputs, total, isLoading } = useOutputs({
    type: activeTab === 'all' ? null : activeTab,
    project_id: selectedProjectId,
    search: debouncedSearch || null,
    date_from: dateFrom || null,
    date_to: dateTo || null,
    limit: pageSize,
    offset: 0,
  })

  // Fetch stats
  const { stats, isLoading: statsLoading } = useOutputStats()

  // Fetch projects for filter dropdown
  const { projects } = useProjects()

  const projectList = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        input_text: p.input_text,
      })),
    [projects],
  )

  const hasMore = outputs.length < total

  const handleLoadMore = useCallback(() => {
    setPageSize((prev) => prev + PAGE_SIZE)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-headline-lg text-on-surface">
          Historico
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Todos os outputs gerados nos seus projetos
        </p>
      </div>

      {/* Stats */}
      <HistoryStats stats={stats} isLoading={statsLoading} />

      {/* Search */}
      <HistorySearch value={search} onChange={setSearch} />

      {/* Filters */}
      <HistoryFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projects={projectList}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {/* Output list */}
      <HistoryList
        outputs={outputs}
        total={total}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
