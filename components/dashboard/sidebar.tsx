'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  History,
  Key,
  BarChart3,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projetos', icon: FolderKanban },
  { href: '/history', label: 'Historico', icon: History },
  { href: '/api-keys', label: 'API Keys', icon: Key },
  { href: '/usage', label: 'Metricas', icon: BarChart3 },
  { href: '/profile', label: 'Perfil', icon: UserCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-[280px] flex-col border-r border-white/5 bg-surface-container md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-white/5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <span className="font-display text-sm font-bold text-primary">S</span>
        </div>
        <span className="font-display text-lg font-semibold text-on-surface">
          Stitch AI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-label-md transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
