/**
 * Provider Abstraction Layer — Config
 *
 * Model tier configuration for Edge Functions (Deno runtime).
 * Mirrors lib/providers/config.ts MODEL_TIERS for use in Edge Functions.
 */

import type { ProviderName } from './types'

export const MODEL_TIERS: Record<
  ProviderName,
  { mini: string; premium: string }
> = {
  openai: { mini: 'gpt-4.1-mini', premium: 'gpt-5.4' },
  gemini: { mini: 'gemini-2.5-flash', premium: 'gemini-2.5-pro' },
  anthropic: { mini: 'claude-haiku-4.1', premium: 'claude-sonnet-4.6' },
} as const
