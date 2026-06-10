import { z } from 'zod'

export const apiKeyProviders = ['openai', 'gemini', 'anthropic'] as const
export type ApiKeyProvider = (typeof apiKeyProviders)[number]

export const addApiKeySchema = z.object({
  provider: z.enum(apiKeyProviders, {
    message: 'Select a valid provider (openai, gemini, or anthropic)',
  }),
  key: z.string().min(10, 'API key must be at least 10 characters'),
})

export type AddApiKeyFormData = z.infer<typeof addApiKeySchema>
