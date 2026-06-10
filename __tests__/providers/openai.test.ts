import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIProvider } from '../../supabase/functions/_shared/providers/openai'
import type { ProviderError } from '../../supabase/functions/_shared/providers/types'

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider

  beforeEach(() => {
    provider = new OpenAIProvider('test-openai-key')
    vi.restoreAllMocks()
  })

  describe('generateText', () => {
    it('calls OpenAI chat completions API and returns TextResult', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hello from OpenAI' } }],
        usage: { total_tokens: 42 },
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      )

      const result = await provider.generateText('Say hello', {
        model: 'gpt-4.1-mini',
        maxTokens: 100,
        temperature: 0.7,
      })

      expect(result.text).toBe('Hello from OpenAI')
      expect(result.tokensUsed).toBe(42)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-openai-key',
          }),
        }),
      )
    })

    it('throws RATE_LIMITED on 429', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('rate limited', { status: 429 }),
      )

      try {
        await provider.generateText('test', { model: 'gpt-4.1-mini' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('RATE_LIMITED')
      }
    })

    it('throws INVALID_KEY on 401', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('unauthorized', { status: 401 }),
      )

      try {
        await provider.generateText('test', { model: 'gpt-4.1-mini' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('INVALID_KEY')
      }
    })

    it('throws INVALID_KEY on 403', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('forbidden', { status: 403 }),
      )

      try {
        await provider.generateText('test', { model: 'gpt-4.1-mini' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('INVALID_KEY')
      }
    })

    it('throws TIMEOUT when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('network error'),
      )

      try {
        await provider.generateText('test', { model: 'gpt-4.1-mini' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('TIMEOUT')
      }
    })

    it('throws PROVIDER_ERROR on other status codes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('server error', { status: 500 }),
      )

      try {
        await provider.generateText('test', { model: 'gpt-4.1-mini' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('PROVIDER_ERROR')
      }
    })
  })

  describe('generateImage', () => {
    it('calls OpenAI image generation API and returns ImageResult', async () => {
      const fakeB64 = btoa('fake-image-data')
      const mockResponse = {
        data: [{ b64_json: fakeB64 }],
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      )

      const result = await provider.generateImage('A cat', {
        model: 'dall-e-3',
        size: '512x512',
      })

      expect(result.mimeType).toBe('image/png')
      expect(result.imageData).toBeInstanceOf(Uint8Array)
      expect(result.imageData.length).toBeGreaterThan(0)
    })
  })

  it('has supportsImage set to true', () => {
    expect(provider.supportsImage).toBe(true)
  })
})
