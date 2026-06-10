import { HealthCheck } from '@/components/shared/health-check'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full space-y-6 text-center">
        <h1 className="font-display text-3xl font-bold text-primary">
          Stitch AI
        </h1>
        <p className="text-on-surface-variant text-sm font-mono uppercase tracking-wider">
          Content Suite
        </p>
        <HealthCheck />
      </div>
    </main>
  )
}
