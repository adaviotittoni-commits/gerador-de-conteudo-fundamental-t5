import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HistoryStats } from '@/components/history/history-stats'
import type { OutputStats } from '@/hooks/use-outputs'

const mockStats: OutputStats = {
  total: 42,
  copy: 10,
  narrative: 8,
  hooks: 12,
  cta: 7,
  image: 5,
}

describe('HistoryStats', () => {
  it('renders all stat labels', () => {
    render(<HistoryStats stats={mockStats} />)

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Narrativa')).toBeInTheDocument()
    expect(screen.getByText('Hooks')).toBeInTheDocument()
    expect(screen.getByText('CTA')).toBeInTheDocument()
    expect(screen.getByText('Imagem')).toBeInTheDocument()
  })

  it('renders stat values', () => {
    render(<HistoryStats stats={mockStats} />)

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(<HistoryStats stats={mockStats} isLoading />)

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(6)
  })
})
