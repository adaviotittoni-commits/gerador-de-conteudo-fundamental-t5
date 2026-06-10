'use client'

import Link from 'next/link'

export function DashboardEmptyState() {
  return (
    <div className="glass-panel rounded-2xl p-12 text-center">
      <span className="material-symbols-outlined text-5xl text-outline-variant">
        auto_awesome
      </span>

      <h2 className="mt-4 font-display text-headline-sm text-on-surface">
        Nenhum projeto ainda
      </h2>

      <p className="mx-auto mt-2 max-w-md text-body-md text-on-surface-variant">
        Crie seu primeiro projeto de conteudo e deixe a IA gerar copys,
        narrativas, hooks, CTAs e imagens para voce.
      </p>

      <Link
        href="/dashboard/projects/new"
        className="btn-gradient-primary mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-mono text-label-md"
      >
        Criar Primeiro Projeto
      </Link>
    </div>
  )
}
