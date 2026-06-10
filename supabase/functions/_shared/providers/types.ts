/**
 * Provider Abstraction Layer — Types
 *
 * Deno-compatible interfaces for AI provider implementations.
 * These types are used by Edge Functions; the frontend has its own
 * types at lib/providers/types.ts.
 */

export interface TextOptions {
  model: string
  maxTokens?: number
  temperature?: number
}

export interface TextResult {
  text: string
  tokensUsed: number
}

export interface ImageOptions {
  model: string
  size?: string
}

export interface ImageResult {
  imageData: Uint8Array
  mimeType: string
}

export interface ProviderError {
  code: 'RATE_LIMITED' | 'INVALID_KEY' | 'TIMEOUT' | 'PROVIDER_ERROR'
  message: string
  details?: unknown
}

/**
 * Unified interface for all AI providers.
 * Providers that do not support image generation omit generateImage
 * and set supportsImage to false.
 */
export interface AIProvider {
  generateText(prompt: string, options: TextOptions): Promise<TextResult>
  generateImage?(prompt: string, options: ImageOptions): Promise<ImageResult>
  supportsImage: boolean
}

export type ProviderName = 'openai' | 'gemini' | 'anthropic'
