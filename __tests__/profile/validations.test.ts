import { describe, it, expect } from 'vitest'
import { profileSchema } from '@/lib/validations/profile'

describe('Profile Validation Schema', () => {
  it('should pass with valid full profile data', () => {
    const data = {
      full_name: 'John Creator',
      niche: 'Tech',
      target_audience: 'Developers aged 20-35',
      brand_colors: ['#ff0000', '#00ff00'],
      preferred_fonts: ['Inter', 'Roboto'],
      youtube_url: 'https://youtube.com/@john',
      instagram_url: 'https://instagram.com/john',
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should pass with only required fields', () => {
    const data = { full_name: 'Jo' }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should fail when full_name is too short', () => {
    const data = { full_name: 'J' }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 2')
    }
  })

  it('should fail when full_name is missing', () => {
    const data = { niche: 'Tech' }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should fail with invalid hex color', () => {
    const data = {
      full_name: 'John',
      brand_colors: ['not-a-color'],
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('hex color')
    }
  })

  it('should pass with valid hex colors', () => {
    const data = {
      full_name: 'John',
      brand_colors: ['#c0c1ff', '#ddb7ff', '#4cd7f6'],
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should fail with more than 10 brand colors', () => {
    const data = {
      full_name: 'John',
      brand_colors: Array.from({ length: 11 }, (_, i) =>
        `#${String(i).padStart(6, '0')}`,
      ),
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should fail with invalid youtube URL', () => {
    const data = {
      full_name: 'John',
      youtube_url: 'not-a-url',
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should pass with empty youtube URL', () => {
    const data = {
      full_name: 'John',
      youtube_url: '',
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should fail with invalid instagram URL', () => {
    const data = {
      full_name: 'John',
      instagram_url: 'not-a-url',
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should pass with empty instagram URL', () => {
    const data = {
      full_name: 'John',
      instagram_url: '',
    }

    const result = profileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
