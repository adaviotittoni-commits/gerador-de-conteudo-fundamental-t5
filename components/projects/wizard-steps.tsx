'use client'

import { Check } from 'lucide-react'

const STEPS = [
  { label: 'Briefing', key: 'briefing' },
  { label: 'Modelos', key: 'models' },
  { label: 'Confirmacao', key: 'confirmation' },
] as const

export type WizardStep = (typeof STEPS)[number]['key']

interface WizardStepsProps {
  currentStep: WizardStep
}

export function WizardSteps({ currentStep }: WizardStepsProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center w-full max-w-md mx-auto">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isDone || isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-outline-variant bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-label-sm whitespace-nowrap ${
                  isDone || isCurrent
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-6 h-0.5 flex-1 transition-colors ${
                  isDone ? 'bg-primary' : 'bg-outline-variant'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
