'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'

type HealthStatus = 'checking' | 'connected' | 'error'

export function HealthCheck() {
  const { supabase } = useSupabase()
  const [status, setStatus] = useState<HealthStatus>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    async function checkHealth() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl) {
          setStatus('error')
          setErrorMessage('NEXT_PUBLIC_SUPABASE_URL not configured')
          return
        }

        const { error } = await supabase.auth.getSession()
        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        setStatus('connected')
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    checkHealth()
  }, [supabase])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            status === 'connected'
              ? 'bg-success shadow-[0_0_8px_rgba(52,211,153,0.4)]'
              : status === 'error'
                ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.4)]'
                : 'bg-warning animate-pulse'
          }`}
        />
        <span className="font-mono text-sm uppercase tracking-wider">
          {status === 'connected' && (
            <span className="text-success">Supabase Connected</span>
          )}
          {status === 'error' && (
            <span className="text-error">Supabase Error</span>
          )}
          {status === 'checking' && (
            <span className="text-warning">Checking...</span>
          )}
        </span>
      </div>
      {status === 'error' && errorMessage && (
        <p className="text-xs text-on-surface-variant text-center">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
