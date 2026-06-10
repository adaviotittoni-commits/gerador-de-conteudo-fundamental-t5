import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UsageByType } from '@/components/usage/usage-by-type'

describe('UsageByType', () => {
  it('renders total outputs count', () => {
    render(
      <UsageByType
        outputsByType={[
          { type: 'copy', count: 5 },
          { type: 'narrative', count: 3 },
        ]}
        totalOutputs={8}
      />,
    )

    expect(screen.getByText('Total de Outputs')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders all five content types', () => {
    render(
      <UsageByType
        outputsByType={[
          { type: 'copy', count: 5 },
          { type: 'narrative', count: 3 },
          { type: 'hooks', count: 2 },
          { type: 'cta', count: 4 },
          { type: 'image', count: 1 },
        ]}
        totalOutputs={15}
      />,
    )

    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Narrativa')).toBeInTheDocument()
    expect(screen.getByText('Hooks')).toBeInTheDocument()
    expect(screen.getByText('CTA')).toBeInTheDocument()
    expect(screen.getByText('Imagem')).toBeInTheDocument()
  })

  it('shows zero for types with no outputs', () => {
    render(
      <UsageByType outputsByType={[]} totalOutputs={0} />,
    )

    // All five type cards should show 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(5)
  })

  it('renders counts for each type correctly', () => {
    render(
      <UsageByType
        outputsByType={[
          { type: 'copy', count: 10 },
          { type: 'image', count: 7 },
        ]}
        totalOutputs={17}
      />,
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
