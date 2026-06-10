'use client'

import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Output } from '@/types'

export type HistoryTabType = 'all' | Output['type']

const TAB_CONFIG: { type: HistoryTabType; label: string }[] = [
  { type: 'all', label: 'Todos' },
  { type: 'copy', label: 'Copy' },
  { type: 'narrative', label: 'Narrativa' },
  { type: 'hooks', label: 'Hooks' },
  { type: 'cta', label: 'CTA' },
  { type: 'image', label: 'Imagem' },
]

interface Project {
  id: string
  input_text: string
}

interface HistoryFiltersProps {
  activeTab: HistoryTabType
  onTabChange: (tab: HistoryTabType) => void
  projects: Project[]
  selectedProjectId: string | null
  onProjectChange: (projectId: string | null) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  className?: string
}

/**
 * Filter bar for the history page.
 *
 * Tab bar for type (design system: flex p-1 bg-surface-container rounded-xl),
 * project select, and date range inputs.
 */
export function HistoryFilters({
  activeTab,
  onTabChange,
  projects,
  selectedProjectId,
  onProjectChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className,
}: HistoryFiltersProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Type Tab Bar */}
      <div
        className="flex flex-wrap p-1 bg-surface-container rounded-xl border border-white/5"
        role="tablist"
        aria-label="Filter by output type"
      >
        {TAB_CONFIG.map(({ type, label }) => {
          const isActive = activeTab === type

          return (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(type)}
              className={cn(
                'flex-1 min-w-[60px] px-3 py-2 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Secondary filters: project + date range */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Project filter */}
        <Select
          value={selectedProjectId ?? 'all'}
          onValueChange={(val) => onProjectChange(val === 'all' ? null : val)}
        >
          <SelectTrigger className="glass-card border-white/10 w-[200px]">
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.input_text.length > 40
                  ? `${project.input_text.slice(0, 40)}...`
                  : project.input_text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <label htmlFor="date-from" className="sr-only">
            Data inicial
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="glass-card rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-on-surface"
            aria-label="Data inicial"
          />
          <span className="text-on-surface-variant text-sm">ate</span>
          <label htmlFor="date-to" className="sr-only">
            Data final
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="glass-card rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-on-surface"
            aria-label="Data final"
          />
        </div>
      </div>
    </div>
  )
}
