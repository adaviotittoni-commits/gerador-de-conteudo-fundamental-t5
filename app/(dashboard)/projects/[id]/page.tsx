'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useProject } from '@/hooks/use-project'
import { useGeneration } from '@/hooks/use-generation'
import { ProjectHeader } from '@/components/projects/project-header'
import { GenerationTrigger } from '@/components/projects/generation-trigger'
import { OutputTabs, type OutputTabType } from '@/components/projects/output-tabs'
import { TextOutputCard } from '@/components/projects/text-output-card'
import { ImageOutputCard } from '@/components/projects/image-output-card'
import { Zap } from 'lucide-react'
import type { ModelConfig } from '@/types'

/**
 * Derive a short title from the project's input text.
 * Takes the first line or first 60 characters, whichever is shorter.
 */
function deriveTitle(inputText: string): string {
  const firstLine = inputText.split('\n')[0] ?? inputText
  if (firstLine.length <= 60) return firstLine
  return firstLine.slice(0, 57) + '...'
}

export default function ProjectResultsPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const { project, isLoading, isError, error, mutate } = useProject(projectId)
  const {
    statuses,
    isGenerating,
    generateAll,
    generateText,
    generateImage,
  } = useGeneration(projectId)

  const [activeTab, setActiveTab] = useState<OutputTabType>('copy')

  const handleGenerate = useCallback(async () => {
    if (!project) return

    await generateAll(
      project.model_config as ModelConfig,
      project.input_text,
    )

    // Revalidate project data to pick up new outputs
    await mutate()
  }, [project, generateAll, mutate])

  const handleRegenerateText = useCallback(
    async (type: 'copy' | 'narrative' | 'hooks' | 'cta') => {
      if (!project) return

      const config = (project.model_config as ModelConfig)[type]
      if (!config) return

      await generateText(type, config.provider, config.model)
      await mutate()
    },
    [project, generateText, mutate],
  )

  const handleRegenerateImage = useCallback(async () => {
    if (!project) return

    const config = (project.model_config as ModelConfig).image
    if (!config) return

    await generateImage(project.input_text, config.provider, config.model)
    await mutate()
  }, [project, generateImage, mutate])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Error state
  if (isError || !project) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">
          {error?.message ?? 'Projeto nao encontrado'}
        </p>
      </div>
    )
  }

  const outputs = project.outputs ?? []
  const filteredOutputs = outputs.filter((o) => o.type === activeTab)
  const hasOutputs = outputs.length > 0
  const title = deriveTitle(project.input_text)

  return (
    <div className="space-y-6">
      {/* Header + Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <ProjectHeader title={title} status={project.status} />
        <GenerationTrigger
          isGenerating={isGenerating}
          statuses={statuses}
          onGenerate={handleGenerate}
          hasOutputs={hasOutputs}
          className="shrink-0"
        />
      </div>

      {/* Tab Bar */}
      <OutputTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        outputs={outputs}
      />

      {/* Output Cards */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="space-y-4"
      >
        {filteredOutputs.length === 0 ? (
          /* Empty state */
          <div className="glass-card rounded-2xl p-12 text-center">
            <Zap className="mx-auto h-10 w-10 text-on-surface-variant/50 mb-4" />
            <p className="text-on-surface-variant text-sm">
              {hasOutputs
                ? `Nenhum output de ${activeTab} gerado ainda.`
                : 'Nenhum conteudo gerado ainda. Clique em "Gerar Conteudo" para comecar.'}
            </p>
          </div>
        ) : activeTab === 'image' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredOutputs.map((output) => (
              <ImageOutputCard
                key={output.id}
                imageUrl={output.file_url ?? ''}
                prompt={output.content ?? ''}
                provider={output.provider_used}
                model={output.model_used}
                createdAt={output.created_at}
                isRegenerating={statuses.image.status === 'generating'}
                onRegenerate={handleRegenerateImage}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOutputs.map((output) => (
              <TextOutputCard
                key={output.id}
                content={output.content ?? ''}
                type={activeTab as 'copy' | 'narrative' | 'hooks' | 'cta'}
                provider={output.provider_used}
                model={output.model_used}
                createdAt={output.created_at}
                isRegenerating={
                  statuses[activeTab as 'copy' | 'narrative' | 'hooks' | 'cta']
                    ?.status === 'generating'
                }
                onRegenerate={() =>
                  handleRegenerateText(
                    activeTab as 'copy' | 'narrative' | 'hooks' | 'cta',
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
