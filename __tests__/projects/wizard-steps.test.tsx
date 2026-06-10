import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { WizardSteps } from '@/components/projects/wizard-steps'

describe('WizardSteps', () => {
  it('renders all three step labels', () => {
    render(<WizardSteps currentStep="briefing" />)

    expect(screen.getByText('Briefing')).toBeInTheDocument()
    expect(screen.getByText('Modelos')).toBeInTheDocument()
    expect(screen.getByText('Confirmacao')).toBeInTheDocument()
  })

  it('renders step numbers', () => {
    render(<WizardSteps currentStep="briefing" />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows check icon for completed steps when on models', () => {
    render(<WizardSteps currentStep="models" />)

    // Step 1 (briefing) should be done — no "1" text, replaced by check icon
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    // Step 2 (models) is current — shows "2"
    expect(screen.getByText('2')).toBeInTheDocument()
    // Step 3 (confirmation) is pending — shows "3"
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows check icons for first two steps when on confirmation', () => {
    render(<WizardSteps currentStep="confirmation" />)

    // Steps 1 and 2 should be done
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(screen.queryByText('2')).not.toBeInTheDocument()
    // Step 3 is current
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
