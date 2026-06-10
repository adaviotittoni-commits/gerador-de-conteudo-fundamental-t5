import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthCheck } from '@/components/shared/health-check'

// Mock the supabase provider
vi.mock('@/components/providers/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    },
  }),
}))

// Mock environment variable
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')

describe('HealthCheck', () => {
  it('renders checking state initially', () => {
    render(<HealthCheck />)
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('shows connected status when supabase is reachable', async () => {
    render(<HealthCheck />)
    const connected = await screen.findByText('Supabase Connected')
    expect(connected).toBeInTheDocument()
  })
})
