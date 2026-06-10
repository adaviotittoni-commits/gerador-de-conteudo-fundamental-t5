'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Output, ModelConfig } from '@/types'

export type GenerationType = 'copy' | 'narrative' | 'hooks' | 'cta' | 'image'

export interface GenerationStatus {
  type: GenerationType
  status: 'idle' | 'generating' | 'completed' | 'error'
  error?: string
}

interface TextGenerationResult {
  output: Output
  warning?: string
}

interface ImageGenerationResult {
  output: Output
  warning?: string
}

/**
 * Hook to invoke Supabase Edge Functions for content generation.
 *
 * Manages per-type generation status and supports both full pipeline
 * invocation (all types at once) and individual regeneration.
 */
export function useGeneration(projectId: string) {
  const [statuses, setStatuses] = useState<Record<GenerationType, GenerationStatus>>({
    copy: { type: 'copy', status: 'idle' },
    narrative: { type: 'narrative', status: 'idle' },
    hooks: { type: 'hooks', status: 'idle' },
    cta: { type: 'cta', status: 'idle' },
    image: { type: 'image', status: 'idle' },
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const updateStatus = useCallback(
    (type: GenerationType, status: GenerationStatus['status'], error?: string) => {
      setStatuses((prev) => ({
        ...prev,
        [type]: { type, status, error },
      }))
    },
    [],
  )

  /**
   * Generate a single text output by invoking the generate-text Edge Function.
   */
  const generateText = useCallback(
    async (
      type: 'copy' | 'narrative' | 'hooks' | 'cta',
      provider: string,
      model: string,
    ): Promise<Output | null> => {
      updateStatus(type, 'generating')

      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke<TextGenerationResult>(
        'generate-text',
        {
          body: { project_id: projectId, type, provider, model },
        },
      )

      if (error || !data?.output) {
        const message =
          (error as Error | undefined)?.message ??
          'Failed to generate text'
        updateStatus(type, 'error', message)
        return null
      }

      updateStatus(type, 'completed')
      return data.output
    },
    [projectId, updateStatus],
  )

  /**
   * Generate a single image output by invoking the generate-image Edge Function.
   */
  const generateImage = useCallback(
    async (
      prompt: string,
      provider: string,
      model: string,
    ): Promise<Output | null> => {
      updateStatus('image', 'generating')

      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke<ImageGenerationResult>(
        'generate-image',
        {
          body: { project_id: projectId, prompt, provider, model },
        },
      )

      if (error || !data?.output) {
        const message =
          (error as Error | undefined)?.message ??
          'Failed to generate image'
        updateStatus('image', 'error', message)
        return null
      }

      updateStatus('image', 'completed')
      return data.output
    },
    [projectId, updateStatus],
  )

  /**
   * Run the full generation pipeline: generate all configured text types
   * and optionally generate an image.
   *
   * Text types run in parallel. Image runs after texts complete.
   */
  const generateAll = useCallback(
    async (
      modelConfig: ModelConfig,
      inputText: string,
    ): Promise<void> => {
      setIsGenerating(true)

      const textTypes = ['copy', 'narrative', 'hooks', 'cta'] as const

      // Generate all text types in parallel
      const textPromises = textTypes.map((type) => {
        const config = modelConfig[type]
        if (!config) return Promise.resolve(null)
        return generateText(type, config.provider, config.model)
      })

      await Promise.allSettled(textPromises)

      // Generate image if configured
      if (modelConfig.image) {
        await generateImage(
          inputText,
          modelConfig.image.provider,
          modelConfig.image.model,
        )
      }

      setIsGenerating(false)
    },
    [generateText, generateImage],
  )

  /**
   * Reset all statuses to idle.
   */
  const resetStatuses = useCallback(() => {
    setStatuses({
      copy: { type: 'copy', status: 'idle' },
      narrative: { type: 'narrative', status: 'idle' },
      hooks: { type: 'hooks', status: 'idle' },
      cta: { type: 'cta', status: 'idle' },
      image: { type: 'image', status: 'idle' },
    })
    setIsGenerating(false)
  }, [])

  return {
    statuses,
    isGenerating,
    generateText,
    generateImage,
    generateAll,
    resetStatuses,
  }
}
