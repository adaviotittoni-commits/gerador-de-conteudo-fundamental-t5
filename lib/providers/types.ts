export const PROVIDERS = ['openai', 'gemini', 'anthropic'] as const
export type Provider = (typeof PROVIDERS)[number]

export const TIERS = ['mini', 'premium'] as const
export type Tier = (typeof TIERS)[number]

export const PROCESSES = ['copy', 'narrative', 'hooks', 'cta', 'image'] as const
export type ContentProcess = (typeof PROCESSES)[number]

export interface ModelSelection {
  provider: Provider
  model: string
  tier: Tier
}

export interface ModelConfig {
  copy: ModelSelection
  narrative: ModelSelection
  hooks: ModelSelection
  cta: ModelSelection
  image: ModelSelection | null
}

export interface ProviderCapabilities {
  text: boolean
  image: boolean
}

export interface ProviderTierModels {
  mini: string
  premium: string
}

export interface ContentProject {
  id: string
  user_id: string
  input_text: string
  status: 'draft' | 'generating' | 'completed' | 'error'
  model_config: ModelConfig
  created_at: string
  updated_at: string
}
