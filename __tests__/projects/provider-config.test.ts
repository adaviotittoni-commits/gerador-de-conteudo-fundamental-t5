import { describe, it, expect } from 'vitest'
import {
  MODEL_TIERS,
  PROVIDER_CAPABILITIES,
  getProvidersForProcess,
} from '@/lib/providers/config'

describe('MODEL_TIERS', () => {
  it('has openai with mini and premium models', () => {
    expect(MODEL_TIERS.openai.mini).toBe('gpt-4.1-mini')
    expect(MODEL_TIERS.openai.premium).toBe('gpt-5.4')
  })

  it('has gemini with mini and premium models', () => {
    expect(MODEL_TIERS.gemini.mini).toBe('gemini-2.5-flash')
    expect(MODEL_TIERS.gemini.premium).toBe('gemini-2.5-pro')
  })

  it('has anthropic with mini and premium models', () => {
    expect(MODEL_TIERS.anthropic.mini).toBe('claude-haiku-4.1')
    expect(MODEL_TIERS.anthropic.premium).toBe('claude-sonnet-4.6')
  })
})

describe('PROVIDER_CAPABILITIES', () => {
  it('openai supports text and image', () => {
    expect(PROVIDER_CAPABILITIES.openai.text).toBe(true)
    expect(PROVIDER_CAPABILITIES.openai.image).toBe(true)
  })

  it('gemini supports text and image', () => {
    expect(PROVIDER_CAPABILITIES.gemini.text).toBe(true)
    expect(PROVIDER_CAPABILITIES.gemini.image).toBe(true)
  })

  it('anthropic supports text only', () => {
    expect(PROVIDER_CAPABILITIES.anthropic.text).toBe(true)
    expect(PROVIDER_CAPABILITIES.anthropic.image).toBe(false)
  })
})

describe('getProvidersForProcess', () => {
  it('returns all providers for text processes', () => {
    const textProcesses = ['copy', 'narrative', 'hooks', 'cta'] as const
    for (const process of textProcesses) {
      const providers = getProvidersForProcess(process)
      expect(providers).toContain('openai')
      expect(providers).toContain('gemini')
      expect(providers).toContain('anthropic')
      expect(providers).toHaveLength(3)
    }
  })

  it('excludes anthropic for image process', () => {
    const providers = getProvidersForProcess('image')
    expect(providers).toContain('openai')
    expect(providers).toContain('gemini')
    expect(providers).not.toContain('anthropic')
    expect(providers).toHaveLength(2)
  })
})
