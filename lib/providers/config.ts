import type {
  Provider,
  ProviderCapabilities,
  ProviderTierModels,
  ContentProcess,
} from '@/lib/providers/types'

export const MODEL_TIERS: Record<Provider, ProviderTierModels> = {
  openai: { mini: 'gpt-4.1-mini', premium: 'gpt-5.4' },
  gemini: { mini: 'gemini-2.5-flash', premium: 'gemini-2.5-pro' },
  anthropic: { mini: 'claude-haiku-4.1', premium: 'claude-sonnet-4.6' },
} as const

export const PROVIDER_CAPABILITIES: Record<Provider, ProviderCapabilities> = {
  openai: { text: true, image: true },
  gemini: { text: true, image: true },
  anthropic: { text: true, image: false },
} as const

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  anthropic: 'Anthropic',
} as const

export const PROCESS_LABELS: Record<ContentProcess, string> = {
  copy: 'Copy',
  narrative: 'Narrativa',
  hooks: 'Hooks',
  cta: 'CTA',
  image: 'Imagem',
} as const

/**
 * Returns the list of providers available for a given content process.
 * Anthropic is excluded from image generation since it does not support it.
 */
export function getProvidersForProcess(process: ContentProcess): Provider[] {
  return (['openai', 'gemini', 'anthropic'] as Provider[]).filter(
    (provider) => {
      if (process === 'image') {
        return PROVIDER_CAPABILITIES[provider].image
      }
      return PROVIDER_CAPABILITIES[provider].text
    },
  )
}
