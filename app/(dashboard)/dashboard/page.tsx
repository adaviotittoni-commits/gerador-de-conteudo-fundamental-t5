'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ProjectList } from '@/components/dashboard/project-list'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface">
            Meus Projetos
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Gerencie seus projetos de conteudo
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="btn-gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-label-md"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Link>
      </div>

      {/* Project List with filters, pagination, empty state */}
      <ProjectList />
    </div>
  )
}
