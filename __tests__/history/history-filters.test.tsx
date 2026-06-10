import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HistoryFilters } from '@/components/history/history-filters'

const defaultProps = {
  activeTab: 'all' as const,
  onTabChange: vi.fn(),
  projects: [
    { id: 'p1', input_text: 'My First Project' },
    { id: 'p2', input_text: 'Another Project' },
  ],
  selectedProjectId: null,
  onProjectChange: vi.fn(),
  dateFrom: '',
  dateTo: '',
  onDateFromChange: vi.fn(),
  onDateToChange: vi.fn(),
}

describe('HistoryFilters', () => {
  it('renders all type tab labels', () => {
    render(<HistoryFilters {...defaultProps} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Narrativa')).toBeInTheDocument()
    expect(screen.getByText('Hooks')).toBeInTheDocument()
    expect(screen.getByText('CTA')).toBeInTheDocument()
    expect(screen.getByText('Imagem')).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected', () => {
    render(<HistoryFilters {...defaultProps} activeTab="copy" />)

    const copyTab = screen.getByRole('tab', { name: 'Copy' })
    expect(copyTab).toHaveAttribute('aria-selected', 'true')

    const todosTab = screen.getByRole('tab', { name: 'Todos' })
    expect(todosTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange when a type tab is clicked', () => {
    const onTabChange = vi.fn()
    render(<HistoryFilters {...defaultProps} onTabChange={onTabChange} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Hooks' }))
    expect(onTabChange).toHaveBeenCalledWith('hooks')
  })

  it('renders date range inputs', () => {
    render(<HistoryFilters {...defaultProps} />)

    expect(screen.getByLabelText('Data inicial')).toBeInTheDocument()
    expect(screen.getByLabelText('Data final')).toBeInTheDocument()
  })

  it('calls onDateFromChange when date input changes', () => {
    const onDateFromChange = vi.fn()
    render(<HistoryFilters {...defaultProps} onDateFromChange={onDateFromChange} />)

    fireEvent.change(screen.getByLabelText('Data inicial'), {
      target: { value: '2026-06-01' },
    })
    expect(onDateFromChange).toHaveBeenCalledWith('2026-06-01')
  })
})
