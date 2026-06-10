'use client'

import { useState, useMemo } from 'react'
import { ProjectCard } from '@/components/dashboard/project-card'
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state'
import { useProjects, deleteProject } from '@/hooks/use-projects'
import type { ProjectWithOutputCount } from '@/hooks/use-projects'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type StatusFilter = 'all' | 'draft' | 'completed'
type SortOrder = 'recent' | 'oldest'

const PAGE_SIZE = 9

export function ProjectList() {
  const { projects, isLoading, error, mutate } = useProjects()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [deletingProject, setDeletingProject] =
    useState<ProjectWithOutputCount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [projects, statusFilter, sortOrder])

  const visibleProjects = filteredProjects.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProjects.length

  async function handleDelete() {
    if (!deletingProject) return

    setIsDeleting(true)
    try {
      await deleteProject(deletingProject.id)
      await mutate()
    } catch {
      // Error handling could be extended with a toast notification
    } finally {
      setIsDeleting(false)
      setDeletingProject(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-body-md text-error">
          Erro ao carregar projetos. Tente novamente.
        </p>
      </div>
    )
  }

  if (projects.length === 0) {
    return <DashboardEmptyState />
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as StatusFilter)
            setVisibleCount(PAGE_SIZE)
          }}
        >
          <SelectTrigger className="glass-card border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="completed">Concluido</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(val) => {
            setSortOrder(val as SortOrder)
            setVisibleCount(PAGE_SIZE)
          }}
        >
          <SelectTrigger className="glass-card border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recente</SelectItem>
            <SelectItem value="oldest">Mais antigo</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto font-mono text-label-sm text-on-surface-variant">
          {filteredProjects.length}{' '}
          {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
        </span>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-body-md text-on-surface-variant">
            Nenhum projeto encontrado com esse filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="rounded-lg px-6 py-2 font-mono text-label-md text-primary transition-colors hover:bg-primary/10"
          >
            Carregar mais
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      >
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-title-lg text-on-surface">
              Deletar Projeto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-sm text-on-surface-variant">
              Tem certeza que deseja deletar este projeto? Todos os outputs
              gerados tambem serao removidos. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeletingProject(null)}
              className="text-on-surface-variant"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error text-on-surface hover:bg-error/80"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
