import { z } from 'zod'

const hexColorRegex = /^#[0-9a-fA-F]{6}$/

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  niche: z
    .string()
    .max(200, 'Niche must be at most 200 characters')
    .optional(),
  target_audience: z
    .string()
    .max(500, 'Target audience must be at most 500 characters')
    .optional(),
  brand_colors: z
    .array(z.string().regex(hexColorRegex, 'Each color must be a valid hex color (e.g. #ff00aa)'))
    .max(10, 'Maximum 10 brand colors')
    .optional(),
  preferred_fonts: z
    .array(z.string().min(1).max(100))
    .max(5, 'Maximum 5 preferred fonts')
    .optional(),
  youtube_url: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
  instagram_url: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>
