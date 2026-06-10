import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { UsagePeriodFilter } from '@/components/usage/usage-period-filter'

describe('UsagePeriodFilter', () => {
  it('renders all three period options', () => {
    render(<UsagePeriodFilter period="30d" onChange={vi.fn()} />)

    expect(screen.getByText('7 dias')).toBeInTheDocument()
    expect(screen.getByText('30 dias')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('highlights the active period', () => {
    render(<UsagePeriodFilter period="7d" onChange={vi.fn()} />)

    const activeButton = screen.getByText('7 dias')
    expect(activeButton.className).toContain('text-primary')
  })

  it('calls onChange when a different period is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<UsagePeriodFilter period="30d" onChange={onChange} />)

    await user.click(screen.getByText('7 dias'))
    expect(onChange).toHaveBeenCalledWith('7d')

    await user.click(screen.getByText('Total'))
    expect(onChange).toHaveBeenCalledWith('all')
  })
})
