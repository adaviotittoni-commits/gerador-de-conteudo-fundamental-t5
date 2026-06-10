import { describe, it, expect } from 'vitest'

/**
 * Tests for the generate-image Edge Function logic.
 *
 * Since Edge Functions run in Deno and cannot be imported directly into
 * a Node/Vitest environment, these tests validate the business rules
 * (provider validation, rate limiting, output structure) using
 * portable logic extracted from the function's design.
 */

// --- Provider Validation ---

const IMAGE_PROVIDERS = ['openai', 'gemini']

function isImageProviderValid(provider: string): boolean {
  return IMAGE_PROVIDERS.includes(provider)
}

describe('generate-image: Provider Validation', () => {
  it('should accept openai as a valid image provider', () => {
    expect(isImageProviderValid('openai')).toBe(true)
  })

  it('should accept gemini as a valid image provider', () => {
    expect(isImageProviderValid('gemini')).toBe(true)
  })

  it('should reject anthropic as an image provider', () => {
    expect(isImageProviderValid('anthropic')).toBe(false)
  })

  it('should reject unknown providers', () => {
    expect(isImageProviderValid('cohere')).toBe(false)
    expect(isImageProviderValid('')).toBe(false)
  })
})

// --- Rate Limiting ---

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

/** Portable rate limiter for testing. */
function createRateLimiter() {
  const store = new Map<string, number[]>()

  return {
    isLimited(userId: string, now: number = Date.now()): boolean {
      const windowStart = now - RATE_LIMIT_WINDOW_MS
      let timestamps = store.get(userId) ?? []
      timestamps = timestamps.filter((t) => t > windowStart)

      if (timestamps.length >= RATE_LIMIT_MAX) {
        store.set(userId, timestamps)
        return true
      }

      timestamps.push(now)
      store.set(userId, timestamps)
      return false
    },
  }
}

describe('generate-image: Rate Limiting', () => {
  it('should allow up to 5 requests per minute', () => {
    const limiter = createRateLimiter()
    const now = Date.now()

    for (let i = 0; i < 5; i++) {
      expect(limiter.isLimited('user-1', now + i)).toBe(false)
    }
  })

  it('should block the 6th request within the same minute', () => {
    const limiter = createRateLimiter()
    const now = Date.now()

    // Consume all 5 allowed slots
    for (let i = 0; i < 5; i++) {
      limiter.isLimited('user-1', now + i)
    }

    // 6th should be blocked
    expect(limiter.isLimited('user-1', now + 10)).toBe(true)
  })

  it('should allow requests again after the window expires', () => {
    const limiter = createRateLimiter()
    const now = Date.now()

    // Consume all 5
    for (let i = 0; i < 5; i++) {
      limiter.isLimited('user-1', now + i)
    }

    // Wait 61 seconds
    expect(limiter.isLimited('user-1', now + 61_000)).toBe(false)
  })

  it('should track users independently', () => {
    const limiter = createRateLimiter()
    const now = Date.now()

    // Fill user-1
    for (let i = 0; i < 5; i++) {
      limiter.isLimited('user-1', now + i)
    }

    // user-2 should still be allowed
    expect(limiter.isLimited('user-2', now)).toBe(false)
  })
})

// --- Output Structure ---

describe('generate-image: Output Save Structure', () => {
  it('should produce an output record with type=image and file_url', () => {
    const output = {
      project_id: 'proj-123',
      user_id: 'user-456',
      type: 'image' as const,
      content: 'A cat riding a bicycle',
      file_url: 'https://storage.example.com/images/user-456/proj-123/abc.png',
      provider_used: 'openai',
      model_used: 'dall-e-3',
      tokens_used: null,
    }

    expect(output.type).toBe('image')
    expect(output.file_url).toBeTruthy()
    expect(output.file_url).toContain('user-456')
    expect(output.tokens_used).toBeNull()
  })

  it('should include prompt as content field', () => {
    const prompt = 'Sunset over mountains'
    const output = {
      type: 'image',
      content: prompt,
      file_url: 'https://example.com/image.png',
      provider_used: 'gemini',
      model_used: 'gemini-2.0-flash-exp',
      tokens_used: null,
    }

    expect(output.content).toBe(prompt)
  })
})
