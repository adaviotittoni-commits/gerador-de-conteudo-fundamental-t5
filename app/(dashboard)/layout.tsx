'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />

      {/* Main content area — offset for sidebar and header */}
      <main className="pt-16 pb-20 md:pl-[280px] md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
