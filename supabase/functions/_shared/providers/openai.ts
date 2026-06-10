/**
 * OpenAI Provider Implementation
 *
 * Implements the AIProvider interface for OpenAI's API.
 * Supports both text (chat completions) and image generation.
 */

import type {
  AIProvider,
  TextOptions,
  TextResult,
  ImageOptions,
  ImageResult,
  ProviderError,
} from './types'

const TEXT_URL = 'https://api.openai.com/v1/chat/completions'
const IMAGE_URL = 'https://api.openai.com/v1/images/generations'

function mapError(status: number, body: string): ProviderError {
  if (status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: 'OpenAI rate limit exceeded. Please try again later.',
      details: body,
    }
  }
  if (status === 401 || status === 403) {
    return {
      code: 'INVALID_KEY',
      message: 'OpenAI API key is invalid or lacks permissions.',
      details: body,
    }
  }
  return {
    code: 'PROVIDER_ERROR',
    message: `OpenAI API error (${status}).`,
    details: body,
  }
}

export class OpenAIProvider implements AIProvider {
  readonly supportsImage = true
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateText(prompt: string, options: TextOptions): Promise<TextResult> {
    let response: Response

    try {
      response = await fetch(TEXT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens,
          temperature: options.temperature,
        }),
      })
    } catch (error) {
      throw {
        code: 'TIMEOUT',
        message: 'Request to OpenAI timed out.',
        details: error,
      } satisfies ProviderError
    }

    if (!response.ok) {
      const body = await response.text()
      throw mapError(response.status, body)
    }

    const data = await response.json()
    const choice = data.choices?.[0]

    return {
      text: choice?.message?.content ?? '',
      tokensUsed: data.usage?.total_tokens ?? 0,
    }
  }

  async generateImage(prompt: string, options: ImageOptions): Promise<ImageResult> {
    let response: Response

    try {
      response = await fetch(IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model,
          prompt,
          size: options.size ?? '1024x1024',
          response_format: 'b64_json',
          n: 1,
        }),
      })
    } catch (error) {
      throw {
        code: 'TIMEOUT',
        message: 'Request to OpenAI image generation timed out.',
        details: error,
      } satisfies ProviderError
    }

    if (!response.ok) {
      const body = await response.text()
      throw mapError(response.status, body)
    }

    const data = await response.json()
    const b64 = data.data?.[0]?.b64_json ?? ''
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    return {
      imageData: bytes,
      mimeType: 'image/png',
    }
  }
}
