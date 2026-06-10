/**
 * Provider Factory
 *
 * Returns the correct AIProvider implementation based on provider name.
 * The API key is passed in — never stored or hardcoded.
 */

import type { AIProvider, ProviderName } from './types'
import { OpenAIProvider } from './openai'
import { GeminiProvider } from './gemini'
import { AnthropicProvider } from './anthropic'

/**
 * Create an AIProvider instance for the given provider name.
 *
 * @param name - Provider identifier ('openai' | 'gemini' | 'anthropic')
 * @param apiKey - Decrypted user API key for the provider
 * @returns AIProvider implementation
 * @throws Error if the provider name is unknown
 */
export function getProvider(name: ProviderName, apiKey: string): AIProvider {
  switch (name) {
    case 'openai':
      return new OpenAIProvider(apiKey)
    case 'gemini':
      return new GeminiProvider(apiKey)
    case 'anthropic':
      return new AnthropicProvider(apiKey)
    default: {
      const exhaustive: never = name
      throw new Error(`Unknown provider: ${exhaustive}`)
    }
  }
}
