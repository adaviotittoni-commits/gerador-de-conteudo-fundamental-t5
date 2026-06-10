import { describe, it, expect } from 'vitest'
import { addApiKeySchema } from '@/lib/validations/api-keys'

describe('addApiKeySchema', () => {
  it('accepts valid openai key', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'openai',
      key: 'sk-1234567890abcdef',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid gemini key', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'gemini',
      key: 'AIzaSyAbcdefghijk',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid anthropic key', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'anthropic',
      key: 'sk-ant-1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid provider', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'invalid-provider',
      key: 'sk-1234567890abcdef',
    })
    expect(result.success).toBe(false)
  })

  it('rejects key shorter than 10 characters', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'openai',
      key: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 10')
    }
  })

  it('rejects empty key', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'openai',
      key: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing provider', () => {
    const result = addApiKeySchema.safeParse({
      key: 'sk-1234567890abcdef',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing key', () => {
    const result = addApiKeySchema.safeParse({
      provider: 'openai',
    })
    expect(result.success).toBe(false)
  })
})
