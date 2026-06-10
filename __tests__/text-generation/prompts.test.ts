import { describe, it, expect } from 'vitest'
import { getPrompt } from '../../supabase/functions/_shared/prompts'

describe('getPrompt', () => {
  const sampleInput = 'Launch of a new organic skincare line targeting millennials'

  describe('type-specific prompts', () => {
    it('generates a copy prompt with copywriting instructions', () => {
      const prompt = getPrompt('copy', sampleInput)
      expect(prompt).toContain('copywriter')
      expect(prompt).toContain('persuasive copy')
      expect(prompt).toContain(sampleInput)
      expect(prompt).toContain('variations')
    })

    it('generates a narrative prompt with storytelling instructions', () => {
      const prompt = getPrompt('narrative', sampleInput)
      expect(prompt).toContain('storyteller')
      expect(prompt).toContain('story arc')
      expect(prompt).toContain(sampleInput)
      expect(prompt).toContain('narrative')
    })

    it('generates a hooks prompt with attention-grabbing instructions', () => {
      const prompt = getPrompt('hooks', sampleInput)
      expect(prompt).toContain('hook')
      expect(prompt).toContain('attention')
      expect(prompt).toContain('3 seconds')
      expect(prompt).toContain(sampleInput)
    })

    it('generates a cta prompt with CTA optimization instructions', () => {
      const prompt = getPrompt('cta', sampleInput)
      expect(prompt).toContain('calls-to-action')
      expect(prompt).toContain('conversion')
      expect(prompt).toContain(sampleInput)
    })

    it('each type generates a different prompt', () => {
      const types = ['copy', 'narrative', 'hooks', 'cta'] as const
      const prompts = types.map((t) => getPrompt(t, sampleInput))

      // All prompts should be unique
      const uniquePrompts = new Set(prompts)
      expect(uniquePrompts.size).toBe(4)
    })
  })

  describe('tone of voice integration', () => {
    it('includes tone of voice style when provided', () => {
      const tone = { style: 'casual and playful' }
      const prompt = getPrompt('copy', sampleInput, tone)
      expect(prompt).toContain('Tone of Voice')
      expect(prompt).toContain('casual and playful')
    })

    it('includes tone adjectives when provided', () => {
      const tone = { adjectives: ['bold', 'authentic', 'witty'] }
      const prompt = getPrompt('narrative', sampleInput, tone)
      expect(prompt).toContain('bold')
      expect(prompt).toContain('authentic')
      expect(prompt).toContain('witty')
    })

    it('includes tone examples when provided', () => {
      const tone = { examples: ['Hey gorgeous, ready to glow?', 'Your skin called, it wants the good stuff.'] }
      const prompt = getPrompt('hooks', sampleInput, tone)
      expect(prompt).toContain('Hey gorgeous, ready to glow?')
      expect(prompt).toContain('Your skin called')
    })

    it('includes all tone fields when fully provided', () => {
      const tone = {
        style: 'professional yet approachable',
        adjectives: ['smart', 'trustworthy'],
        examples: ['We believe in science-backed beauty.'],
      }
      const prompt = getPrompt('cta', sampleInput, tone)
      expect(prompt).toContain('professional yet approachable')
      expect(prompt).toContain('smart')
      expect(prompt).toContain('trustworthy')
      expect(prompt).toContain('science-backed beauty')
    })

    it('does not include tone block when tone is null', () => {
      const prompt = getPrompt('copy', sampleInput, null)
      expect(prompt).not.toContain('Tone of Voice')
    })

    it('does not include tone block when tone is undefined', () => {
      const prompt = getPrompt('copy', sampleInput)
      expect(prompt).not.toContain('Tone of Voice')
    })

    it('does not include tone block when tone is empty object', () => {
      const prompt = getPrompt('copy', sampleInput, {})
      expect(prompt).not.toContain('Tone of Voice')
    })
  })

  describe('error handling', () => {
    it('throws for unknown generation type', () => {
      // @ts-expect-error testing invalid type
      expect(() => getPrompt('unknown', sampleInput)).toThrow('Unknown generation type')
    })
  })
})
