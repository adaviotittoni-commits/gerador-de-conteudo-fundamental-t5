import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnthropicProvider } from '../../supabase/functions/_shared/providers/anthropic'
import type { ProviderError } from '../../supabase/functions/_shared/providers/types'

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider

  beforeEach(() => {
    provider = new AnthropicProvider('test-anthropic-key')
    vi.restoreAllMocks()
  })

  describe('supportsImage', () => {
    it('is false — Anthropic does not support image generation', () => {
      expect(provider.supportsImage).toBe(false)
    })

    it('does NOT have a generateImage method', () => {
      expect(
        (provider as unknown as Record<string, unknown>).generateImage,
      ).toBeUndefined()
    })
  })

  describe('generateText', () => {
    it('calls Anthropic messages API with correct headers and returns TextResult', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Hello from Anthropic' }],
        usage: { input_tokens: 10, output_tokens: 8 },
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      )

      const result = await provider.generateText('Say hello', {
        model: 'claude-haiku-4.1',
        maxTokens: 200,
        temperature: 0.5,
      })

      expect(result.text).toBe('Hello from Anthropic')
      expect(result.tokensUsed).toBe(18)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-anthropic-key',
            'anthropic-version': '2023-06-01',
          }),
        }),
      )
    })

    it('throws RATE_LIMITED on 429', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('rate limited', { status: 429 }),
      )

      try {
        await provider.generateText('test', { model: 'claude-haiku-4.1' })
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
        await provider.generateText('test', { model: 'claude-haiku-4.1' })
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
        await provider.generateText('test', { model: 'claude-haiku-4.1' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('TIMEOUT')
      }
    })

    it('throws PROVIDER_ERROR on 500', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('server error', { status: 500 }),
      )

      try {
        await provider.generateText('test', { model: 'claude-haiku-4.1' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('PROVIDER_ERROR')
      }
    })
  })
})
