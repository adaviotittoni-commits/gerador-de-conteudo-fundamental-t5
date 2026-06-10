import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OutputTabs } from '@/components/projects/output-tabs'
import type { Output } from '@/types'

function makeOutput(type: Output['type'], id = '1'): Output {
  return {
    id,
    project_id: 'p1',
    user_id: 'u1',
    type,
    content: 'test content',
    file_url: null,
    provider_used: 'openai',
    model_used: 'gpt-4.1-mini',
    tokens_used: 100,
    created_at: '2026-06-10T00:00:00Z',
  }
}

describe('OutputTabs', () => {
  it('renders all five tab labels', () => {
    render(
      <OutputTabs
        activeTab="copy"
        onTabChange={() => {}}
        outputs={[]}
      />,
    )

    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Narrativa')).toBeInTheDocument()
    expect(screen.getByText('Hooks')).toBeInTheDocument()
    expect(screen.getByText('CTA')).toBeInTheDocument()
    expect(screen.getByText('Imagem')).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected', () => {
    render(
      <OutputTabs
        activeTab="narrative"
        onTabChange={() => {}}
        outputs={[]}
      />,
    )

    const narrativeTab = screen.getByRole('tab', { name: 'Narrativa' })
    expect(narrativeTab).toHaveAttribute('aria-selected', 'true')

    const copyTab = screen.getByRole('tab', { name: 'Copy' })
    expect(copyTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange when a tab is clicked', () => {
    const onChange = vi.fn()
    render(
      <OutputTabs
        activeTab="copy"
        onTabChange={onChange}
        outputs={[]}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Hooks' }))
    expect(onChange).toHaveBeenCalledWith('hooks')
  })

  it('shows output count badges', () => {
    const outputs = [
      makeOutput('copy', '1'),
      makeOutput('copy', '2'),
      makeOutput('narrative', '3'),
    ]

    render(
      <OutputTabs
        activeTab="copy"
        onTabChange={() => {}}
        outputs={outputs}
      />,
    )

    // Copy tab should show count 2
    expect(screen.getByText('2')).toBeInTheDocument()
    // Narrative tab should show count 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
