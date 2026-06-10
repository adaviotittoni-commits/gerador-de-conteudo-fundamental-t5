import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock the supabase provider
vi.mock('@/components/providers/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  }),
}))

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<LoginForm />)
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument()
  })

  it('renders Google OAuth button', () => {
    render(<LoginForm />)
    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  it('renders sign up link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })
})
