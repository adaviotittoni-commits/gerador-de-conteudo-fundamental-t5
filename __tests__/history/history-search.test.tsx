import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HistorySearch } from '@/components/history/history-search'

describe('HistorySearch', () => {
  it('renders the search input', () => {
    render(<HistorySearch value="" onChange={() => {}} />)

    expect(screen.getByLabelText('Buscar nos outputs')).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<HistorySearch value="" onChange={() => {}} />)

    expect(screen.getByPlaceholderText('Buscar nos outputs...')).toBeInTheDocument()
  })

  it('displays the current value', () => {
    render(<HistorySearch value="test query" onChange={() => {}} />)

    const input = screen.getByLabelText('Buscar nos outputs') as HTMLInputElement
    expect(input.value).toBe('test query')
  })

  it('calls onChange when user types', () => {
    const onChange = vi.fn()
    render(<HistorySearch value="" onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Buscar nos outputs'), {
      target: { value: 'new search' },
    })
    expect(onChange).toHaveBeenCalledWith('new search')
  })
})
