import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProviderUsageCard } from '@/components/usage/provider-usage-card'

describe('ProviderUsageCard', () => {
  it('renders provider name and token count', () => {
    render(
      <ProviderUsageCard
        provider={{ provider: 'openai', total_tokens: 15000 }}
        maxTokens={15000}
      />,
    )

    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('15.0K')).toBeInTheDocument()
    expect(screen.getByText('tokens')).toBeInTheDocument()
  })

  it('formats millions correctly', () => {
    render(
      <ProviderUsageCard
        provider={{ provider: 'gemini', total_tokens: 2500000 }}
        maxTokens={2500000}
      />,
    )

    expect(screen.getByText('Gemini')).toBeInTheDocument()
    expect(screen.getByText('2.5M')).toBeInTheDocument()
  })

  it('formats small numbers without abbreviation', () => {
    render(
      <ProviderUsageCard
        provider={{ provider: 'anthropic', total_tokens: 500 }}
        maxTokens={1000}
      />,
    )

    expect(screen.getByText('Anthropic')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('handles unknown provider gracefully', () => {
    render(
      <ProviderUsageCard
        provider={{ provider: 'mistral', total_tokens: 100 }}
        maxTokens={100}
      />,
    )

    expect(screen.getByText('mistral')).toBeInTheDocument()
  })

  it('renders usage bar', () => {
    const { container } = render(
      <ProviderUsageCard
        provider={{ provider: 'openai', total_tokens: 500 }}
        maxTokens={1000}
      />,
    )

    const bar = container.querySelector('.bg-primary.h-1\\.5')
    expect(bar).toBeInTheDocument()
  })
})
