import { describe, it, expect } from 'vitest'
import { getProvider } from '../../supabase/functions/_shared/providers/factory'
import { OpenAIProvider } from '../../supabase/functions/_shared/providers/openai'
import { GeminiProvider } from '../../supabase/functions/_shared/providers/gemini'
import { AnthropicProvider } from '../../supabase/functions/_shared/providers/anthropic'

describe('Provider Factory', () => {
  it('returns OpenAIProvider for "openai"', () => {
    const provider = getProvider('openai', 'test-key')
    expect(provider).toBeInstanceOf(OpenAIProvider)
    expect(provider.supportsImage).toBe(true)
  })

  it('returns GeminiProvider for "gemini"', () => {
    const provider = getProvider('gemini', 'test-key')
    expect(provider).toBeInstanceOf(GeminiProvider)
    expect(provider.supportsImage).toBe(true)
  })

  it('returns AnthropicProvider for "anthropic"', () => {
    const provider = getProvider('anthropic', 'test-key')
    expect(provider).toBeInstanceOf(AnthropicProvider)
    expect(provider.supportsImage).toBe(false)
  })

  it('throws error for unknown provider', () => {
    // @ts-expect-error testing invalid input
    expect(() => getProvider('unknown', 'test-key')).toThrow(
      'Unknown provider: unknown',
    )
  })

  it('passes the API key to the provider (never hardcoded)', () => {
    const provider = getProvider('openai', 'my-secret-key')
    // Provider is instantiated with the key; we verify it is an instance
    // (the key is private; we test its usage via generateText mock tests)
    expect(provider).toBeInstanceOf(OpenAIProvider)
  })
})
