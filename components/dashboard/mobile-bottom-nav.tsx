'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projetos', icon: FolderKanban },
  { href: '/dashboard/usage', label: 'Metricas', icon: BarChart3 },
  { href: '/dashboard/profile', label: 'Perfil', icon: UserCircle },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-surface/90 px-2 py-2 backdrop-blur-xl md:hidden">
      {mobileNavItems.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
