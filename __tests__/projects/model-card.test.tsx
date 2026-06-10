import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ModelCard } from '@/components/projects/model-card'

describe('ModelCard', () => {
  it('renders provider name and model', () => {
    render(
      <ModelCard
        provider="openai"
        tier="mini"
        isSelected={false}
        isAvailable={true}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('gpt-4.1-mini')).toBeInTheDocument()
  })

  it('shows mini tier badge with correct styling', () => {
    render(
      <ModelCard
        provider="openai"
        tier="mini"
        isSelected={false}
        isAvailable={true}
        onSelect={vi.fn()}
      />,
    )

    const badge = screen.getByText('mini')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('text-tertiary')
  })

  it('shows premium tier badge with correct styling', () => {
    render(
      <ModelCard
        provider="openai"
        tier="premium"
        isSelected={false}
        isAvailable={true}
        onSelect={vi.fn()}
      />,
    )

    const badge = screen.getByText('premium')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('text-secondary')
  })

  it('shows unavailable message when provider has no key', () => {
    render(
      <ModelCard
        provider="anthropic"
        tier="mini"
        isSelected={false}
        isAvailable={false}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('Key nao cadastrada')).toBeInTheDocument()
  })

  it('disables button when not available', () => {
    render(
      <ModelCard
        provider="anthropic"
        tier="mini"
        isSelected={false}
        isAvailable={false}
        onSelect={vi.fn()}
      />,
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('calls onSelect when clicked and available', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ModelCard
        provider="openai"
        tier="mini"
        isSelected={false}
        isAvailable={true}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('does not call onSelect when clicked but unavailable', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ModelCard
        provider="anthropic"
        tier="mini"
        isSelected={false}
        isAvailable={false}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('applies selected styling when isSelected is true', () => {
    render(
      <ModelCard
        provider="openai"
        tier="mini"
        isSelected={true}
        isAvailable={true}
        onSelect={vi.fn()}
      />,
    )

    const button = screen.getByRole('button')
    expect(button.className).toContain('border-primary/30')
    expect(button.className).toContain('bg-primary/5')
  })
})
