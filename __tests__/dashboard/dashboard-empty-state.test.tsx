import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('DashboardEmptyState', () => {
  it('renders the empty state headline', () => {
    render(<DashboardEmptyState />)

    expect(screen.getByText('Nenhum projeto ainda')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<DashboardEmptyState />)

    expect(
      screen.getByText(/crie seu primeiro projeto de conteudo/i),
    ).toBeInTheDocument()
  })

  it('renders CTA button that links to create project page', () => {
    render(<DashboardEmptyState />)

    const cta = screen.getByRole('link', { name: /criar primeiro projeto/i })
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAttribute('href', '/dashboard/projects/new')
  })

  it('applies glass-panel styling', () => {
    const { container } = render(<DashboardEmptyState />)

    const panel = container.firstElementChild
    expect(panel?.className).toContain('glass-panel')
  })
})
