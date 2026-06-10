import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeminiProvider } from '../../supabase/functions/_shared/providers/gemini'
import type { ProviderError } from '../../supabase/functions/_shared/providers/types'

describe('GeminiProvider', () => {
  let provider: GeminiProvider

  beforeEach(() => {
    provider = new GeminiProvider('test-gemini-key')
    vi.restoreAllMocks()
  })

  describe('generateText', () => {
    it('calls Gemini generateContent API and returns TextResult', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'Hello from Gemini' }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      )

      const result = await provider.generateText('Say hello', {
        model: 'gemini-2.5-flash',
        maxTokens: 100,
      })

      expect(result.text).toBe('Hello from Gemini')
      expect(result.tokensUsed).toBe(15)

      expect(fetch).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=test-gemini-key',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('throws RATE_LIMITED on 429', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('rate limited', { status: 429 }),
      )

      try {
        await provider.generateText('test', { model: 'gemini-2.5-flash' })
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
        await provider.generateText('test', { model: 'gemini-2.5-flash' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('INVALID_KEY')
      }
    })

    it('throws TIMEOUT when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('timeout'),
      )

      try {
        await provider.generateText('test', { model: 'gemini-2.5-flash' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('TIMEOUT')
      }
    })
  })

  describe('generateImage', () => {
    it('calls Gemini with image output config and returns ImageResult', async () => {
      const fakeB64 = btoa('fake-gemini-image')
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { data: fakeB64, mimeType: 'image/png' } },
              ],
            },
          },
        ],
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      )

      const result = await provider.generateImage('A dog', {
        model: 'gemini-2.5-pro',
      })

      expect(result.mimeType).toBe('image/png')
      expect(result.imageData).toBeInstanceOf(Uint8Array)
      expect(result.imageData.length).toBeGreaterThan(0)
    })

    it('throws PROVIDER_ERROR when no image data returned', async () => {
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'no image' }] } }],
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      )

      try {
        await provider.generateImage('A dog', { model: 'gemini-2.5-pro' })
        expect.fail('should have thrown')
      } catch (error) {
        const err = error as ProviderError
        expect(err.code).toBe('PROVIDER_ERROR')
        expect(err.message).toContain('did not return image data')
      }
    })
  })

  it('has supportsImage set to true', () => {
    expect(provider.supportsImage).toBe(true)
  })
})
