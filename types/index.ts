export interface Profile {
  id: string
  full_name: string
  niche: string
  target_audience: string
  brand_colors: string[]
  preferred_fonts: string[]
  youtube_url: string | null
  instagram_url: string | null
  tone_of_voice: Record<string, unknown> | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  provider: 'openai' | 'gemini' | 'anthropic'
  encrypted_key: string
  key_suffix: string
  status: 'valid' | 'invalid' | 'unchecked'
  created_at: string
  updated_at: string
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

export interface ModelConfig {
  copy: { provider: string; model: string }
  narrative: { provider: string; model: string }
  hooks: { provider: string; model: string }
  cta: { provider: string; model: string }
  image: { provider: string; model: string } | null
}

export interface Output {
  id: string
  project_id: string
  user_id: string
  type: 'copy' | 'narrative' | 'hooks' | 'cta' | 'image'
  content: string | null
  file_url: string | null
  provider_used: string
  model_used: string
  tokens_used: number | null
  created_at: string
}
