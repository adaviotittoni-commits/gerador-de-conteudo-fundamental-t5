'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/projects/wizard-steps'
import type { WizardStep } from '@/components/projects/wizard-steps'
import { BriefingInput } from '@/components/projects/briefing-input'
import { ModelSelector } from '@/components/projects/model-selector'
import { Button } from '@/components/ui/button'
import type { ModelConfig } from '@/lib/providers/types'
import { PROCESS_LABELS } from '@/lib/providers/config'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

const TEXT_PROCESSES = ['copy', 'narrative', 'hooks', 'cta'] as const

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('briefing')
  const [briefing, setBriefing] = useState('')
  const [modelConfig, setModelConfig] = useState<Partial<ModelConfig>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isBriefingValid = briefing.length >= 10
  const areTextModelsSelected = TEXT_PROCESSES.every(
    (p) => modelConfig[p]?.provider && modelConfig[p]?.model,
  )
  const isModelConfigValid = areTextModelsSelected

  function handleNext() {
    if (step === 'briefing' && isBriefingValid) {
      setStep('models')
    } else if (step === 'models' && isModelConfigValid) {
      setStep('confirmation')
    }
  }

  function handleBack() {
    if (step === 'models') setStep('briefing')
    if (step === 'confirmation') setStep('models')
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        input_text: briefing,
        model_config: {
          copy: modelConfig.copy,
          narrative: modelConfig.narrative,
          hooks: modelConfig.hooks,
          cta: modelConfig.cta,
          image: modelConfig.image ?? null,
        },
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create project')
      }

      const data = await res.json()
      router.push(`/projects/${data.project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-headline-sm text-on-surface">
          Novo Projeto
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Configure seu projeto de conteudo em poucos passos
        </p>
      </div>

      {/* Wizard steps indicator */}
      <WizardSteps currentStep={step} />

      {/* Step content */}
      <div className="glass-card rounded-2xl p-6">
        {step === 'briefing' && (
          <BriefingInput value={briefing} onChange={setBriefing} />
        )}

        {step === 'models' && (
          <ModelSelector modelConfig={modelConfig} onChange={setModelConfig} />
        )}

        {step === 'confirmation' && (
          <div className="space-y-6">
            <h2 className="text-title-md text-on-surface font-medium">
              Resumo do Projeto
            </h2>

            {/* Briefing summary */}
            <div className="space-y-2">
              <h3 className="text-label-md text-on-surface-variant">
                Briefing
              </h3>
              <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-body-sm text-on-surface">
                {briefing}
              </p>
            </div>

            {/* Model config summary */}
            <div className="space-y-2">
              <h3 className="text-label-md text-on-surface-variant">
                Modelos Selecionados
              </h3>
              <div className="space-y-2">
                {(['copy', 'narrative', 'hooks', 'cta', 'image'] as const).map(
                  (process) => {
                    const selection = modelConfig[process]
                    if (!selection) {
                      if (process === 'image') return null
                      return null
                    }
                    return (
                      <div
                        key={process}
                        className="flex items-center justify-between rounded-lg border border-outline-variant px-4 py-2"
                      >
                        <span className="text-label-md text-on-surface">
                          {PROCESS_LABELS[process]}
                        </span>
                        <span className="font-mono text-body-sm text-on-surface-variant">
                          {selection.model}
                          <span
                            className={`ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase ${
                              selection.tier === 'mini'
                                ? 'bg-tertiary/10 text-tertiary'
                                : 'bg-secondary/10 text-secondary'
                            }`}
                          >
                            {selection.tier}
                          </span>
                        </span>
                      </div>
                    )
                  },
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-body-sm text-error">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {step !== 'briefing' && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>

        <div>
          {step === 'confirmation' ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-gradient-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Projeto'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (step === 'briefing' && !isBriefingValid) ||
                (step === 'models' && !isModelConfigValid)
              }
            >
              Proximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
