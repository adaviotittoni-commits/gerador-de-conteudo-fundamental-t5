/**
 * Anthropic Provider Implementation
 *
 * Implements the AIProvider interface for Anthropic's Messages API.
 * Text generation only — image generation is NOT supported.
 */

import type {
  AIProvider,
  TextOptions,
  TextResult,
  ProviderError,
} from './types'

const API_URL = 'https://api.anthropic.com/v1/messages'
const API_VERSION = '2023-06-01'

function mapError(status: number, body: string): ProviderError {
  if (status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: 'Anthropic rate limit exceeded. Please try again later.',
      details: body,
    }
  }
  if (status === 401 || status === 403) {
    return {
      code: 'INVALID_KEY',
      message: 'Anthropic API key is invalid or lacks permissions.',
      details: body,
    }
  }
  return {
    code: 'PROVIDER_ERROR',
    message: `Anthropic API error (${status}).`,
    details: body,
  }
}

export class AnthropicProvider implements AIProvider {
  readonly supportsImage = false
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateText(prompt: string, options: TextOptions): Promise<TextResult> {
    let response: Response

    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': API_VERSION,
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: options.maxTokens ?? 1024,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature,
        }),
      })
    } catch (error) {
      throw {
        code: 'TIMEOUT',
        message: 'Request to Anthropic timed out.',
        details: error,
      } satisfies ProviderError
    }

    if (!response.ok) {
      const body = await response.text()
      throw mapError(response.status, body)
    }

    const data = await response.json()
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === 'text',
    )

    return {
      text: textBlock?.text ?? '',
      tokensUsed:
        (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    }
  }
}
