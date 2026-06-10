import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RegisterForm } from '@/components/auth/register-form'

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
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  }),
}))

describe('RegisterForm', () => {
  it('renders email, password and confirm password inputs', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders create account button', () => {
    render(<RegisterForm />)
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('renders Google OAuth button', () => {
    render(<RegisterForm />)
    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument()
  })

  it('renders sign in link', () => {
    render(<RegisterForm />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
