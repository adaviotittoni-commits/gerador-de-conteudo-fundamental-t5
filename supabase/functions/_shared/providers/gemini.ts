/**
 * Gemini Provider Implementation
 *
 * Implements the AIProvider interface for Google's Gemini API.
 * Supports both text and image generation via the generateContent endpoint.
 */

import type {
  AIProvider,
  TextOptions,
  TextResult,
  ImageOptions,
  ImageResult,
  ProviderError,
} from './types'

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

function mapError(status: number, body: string): ProviderError {
  if (status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: 'Gemini rate limit exceeded. Please try again later.',
      details: body,
    }
  }
  if (status === 401 || status === 403) {
    return {
      code: 'INVALID_KEY',
      message: 'Gemini API key is invalid or lacks permissions.',
      details: body,
    }
  }
  return {
    code: 'PROVIDER_ERROR',
    message: `Gemini API error (${status}).`,
    details: body,
  }
}

export class GeminiProvider implements AIProvider {
  readonly supportsImage = true
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateText(prompt: string, options: TextOptions): Promise<TextResult> {
    const url = `${BASE_URL}/${options.model}:generateContent?key=${this.apiKey}`

    let response: Response

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: options.maxTokens,
            temperature: options.temperature,
          },
        }),
      })
    } catch (error) {
      throw {
        code: 'TIMEOUT',
        message: 'Request to Gemini timed out.',
        details: error,
      } satisfies ProviderError
    }

    if (!response.ok) {
      const body = await response.text()
      throw mapError(response.status, body)
    }

    const data = await response.json()
    const candidate = data.candidates?.[0]
    const text = candidate?.content?.parts?.[0]?.text ?? ''
    const tokensUsed =
      (data.usageMetadata?.promptTokenCount ?? 0) +
      (data.usageMetadata?.candidatesTokenCount ?? 0)

    return { text, tokensUsed }
  }

  async generateImage(prompt: string, options: ImageOptions): Promise<ImageResult> {
    const url = `${BASE_URL}/${options.model}:generateContent?key=${this.apiKey}`

    let response: Response

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageDimension: options.size ?? '1024x1024',
          },
        }),
      })
    } catch (error) {
      throw {
        code: 'TIMEOUT',
        message: 'Request to Gemini image generation timed out.',
        details: error,
      } satisfies ProviderError
    }

    if (!response.ok) {
      const body = await response.text()
      throw mapError(response.status, body)
    }

    const data = await response.json()
    const candidate = data.candidates?.[0]
    const inlineData = candidate?.content?.parts?.[0]?.inlineData

    if (!inlineData) {
      throw {
        code: 'PROVIDER_ERROR',
        message: 'Gemini did not return image data.',
        details: data,
      } satisfies ProviderError
    }

    const binary = atob(inlineData.data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    return {
      imageData: bytes,
      mimeType: inlineData.mimeType ?? 'image/png',
    }
  }
}
