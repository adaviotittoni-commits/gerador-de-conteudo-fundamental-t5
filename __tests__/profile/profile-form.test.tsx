import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileForm } from '@/components/profile/profile-form'
import type { Profile } from '@/types'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/profile',
}))

// Mock supabase provider
vi.mock('@/components/providers/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      storage: {
        from: () => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/avatar.png' } }),
        }),
      },
      from: () => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    },
  }),
}))

const mockProfile: Profile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  full_name: 'Test User',
  niche: 'Tech',
  target_audience: 'Developers',
  brand_colors: ['#c0c1ff'],
  preferred_fonts: ['Inter'],
  youtube_url: 'https://youtube.com/@test',
  instagram_url: 'https://instagram.com/test',
  tone_of_voice: null,
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('ProfileForm', () => {
  it('should render all form fields', () => {
    render(<ProfileForm profile={mockProfile} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/niche/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/youtube/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument()
  })

  it('should populate fields with profile data', () => {
    render(<ProfileForm profile={mockProfile} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Test User')
    expect(screen.getByLabelText(/niche/i)).toHaveValue('Tech')
    expect(screen.getByLabelText(/youtube/i)).toHaveValue(
      'https://youtube.com/@test',
    )
  })

  it('should show save button', () => {
    render(<ProfileForm profile={mockProfile} />)

    expect(
      screen.getByRole('button', { name: /save profile/i }),
    ).toBeInTheDocument()
  })

  it('should show welcome banner for new users', () => {
    const emptyProfile = { ...mockProfile, full_name: '' }
    render(<ProfileForm profile={emptyProfile} isNewUser />)

    expect(screen.getByText(/welcome to stitch ai/i)).toBeInTheDocument()
  })

  it('should not show welcome banner for existing users', () => {
    render(<ProfileForm profile={mockProfile} />)

    expect(
      screen.queryByText(/welcome to stitch ai/i),
    ).not.toBeInTheDocument()
  })

  it('should render avatar upload component', () => {
    render(<ProfileForm profile={mockProfile} />)

    expect(
      screen.getByRole('button', { name: /change avatar/i }),
    ).toBeInTheDocument()
  })

  it('should show add color button', () => {
    render(<ProfileForm profile={mockProfile} />)

    expect(
      screen.getByRole('button', { name: /add color/i }),
    ).toBeInTheDocument()
  })
})
