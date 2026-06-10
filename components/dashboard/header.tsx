'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useState } from 'react'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-surface/80 px-4 backdrop-blur-xl md:pl-[296px]">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface md:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer for desktop (sidebar occupies left space) */}
      <div className="hidden md:block" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-label-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isSigningOut ? 'Saindo...' : 'Sair'}
          </span>
        </button>
      </div>
    </header>
  )
}
