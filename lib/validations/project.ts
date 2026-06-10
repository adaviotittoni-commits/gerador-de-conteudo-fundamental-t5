import { z } from 'zod'

const modelSelectionSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'anthropic']),
  model: z.string().min(1, 'Model is required'),
  tier: z.enum(['mini', 'premium']),
})

export const createProjectSchema = z.object({
  input_text: z
    .string()
    .min(10, 'Briefing must be at least 10 characters')
    .max(5000, 'Briefing must be at most 5000 characters'),
  model_config: z.object({
    copy: modelSelectionSchema,
    narrative: modelSelectionSchema,
    hooks: modelSelectionSchema,
    cta: modelSelectionSchema,
    image: modelSelectionSchema.nullable(),
  }),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
