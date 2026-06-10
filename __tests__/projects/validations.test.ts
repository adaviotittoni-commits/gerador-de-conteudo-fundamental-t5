import { describe, it, expect } from 'vitest'
import { createProjectSchema } from '@/lib/validations/project'

const validModelSelection = {
  provider: 'openai' as const,
  model: 'gpt-4.1-mini',
  tier: 'mini' as const,
}

const validModelConfig = {
  copy: validModelSelection,
  narrative: validModelSelection,
  hooks: validModelSelection,
  cta: validModelSelection,
  image: null,
}

describe('createProjectSchema', () => {
  it('accepts valid project data', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'A detailed briefing about content creation',
      model_config: validModelConfig,
    })
    expect(result.success).toBe(true)
  })

  it('accepts project with image model selected', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'A detailed briefing about content creation',
      model_config: {
        ...validModelConfig,
        image: {
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          tier: 'mini',
        },
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects briefing shorter than 10 characters', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'short',
      model_config: validModelConfig,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('at least 10'))).toBe(true)
    }
  })

  it('rejects empty briefing', () => {
    const result = createProjectSchema.safeParse({
      input_text: '',
      model_config: validModelConfig,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing model_config', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'A valid briefing text here',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid provider in model_config', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'A valid briefing text here',
      model_config: {
        ...validModelConfig,
        copy: {
          provider: 'invalid-provider',
          model: 'some-model',
          tier: 'mini',
        },
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tier in model_config', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'A valid briefing text here',
      model_config: {
        ...validModelConfig,
        copy: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          tier: 'invalid-tier',
        },
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing input_text', () => {
    const result = createProjectSchema.safeParse({
      model_config: validModelConfig,
    })
    expect(result.success).toBe(false)
  })

  it('rejects briefing over 5000 characters', () => {
    const result = createProjectSchema.safeParse({
      input_text: 'a'.repeat(5001),
      model_config: validModelConfig,
    })
    expect(result.success).toBe(false)
  })
})
