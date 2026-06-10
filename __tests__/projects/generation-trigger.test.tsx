import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GenerationTrigger } from '@/components/projects/generation-trigger'
import type { GenerationStatus, GenerationType } from '@/hooks/use-generation'

function idleStatuses(): Record<GenerationType, GenerationStatus> {
  return {
    copy: { type: 'copy', status: 'idle' },
    narrative: { type: 'narrative', status: 'idle' },
    hooks: { type: 'hooks', status: 'idle' },
    cta: { type: 'cta', status: 'idle' },
    image: { type: 'image', status: 'idle' },
  }
}

describe('GenerationTrigger', () => {
  it('renders "Gerar Conteudo" button when no outputs', () => {
    render(
      <GenerationTrigger
        isGenerating={false}
        statuses={idleStatuses()}
        onGenerate={() => {}}
        hasOutputs={false}
      />,
    )

    expect(screen.getByText('Gerar Conteudo')).toBeInTheDocument()
  })

  it('renders "Regenerar Tudo" when project has outputs', () => {
    render(
      <GenerationTrigger
        isGenerating={false}
        statuses={idleStatuses()}
        onGenerate={() => {}}
        hasOutputs={true}
      />,
    )

    expect(screen.getByText('Regenerar Tudo')).toBeInTheDocument()
  })

  it('renders "Gerando..." when generating', () => {
    render(
      <GenerationTrigger
        isGenerating={true}
        statuses={idleStatuses()}
        onGenerate={() => {}}
      />,
    )

    expect(screen.getByText('Gerando...')).toBeInTheDocument()
  })

  it('disables button while generating', () => {
    render(
      <GenerationTrigger
        isGenerating={true}
        statuses={idleStatuses()}
        onGenerate={() => {}}
      />,
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onGenerate when button is clicked', () => {
    const onGenerate = vi.fn()
    render(
      <GenerationTrigger
        isGenerating={false}
        statuses={idleStatuses()}
        onGenerate={onGenerate}
      />,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onGenerate).toHaveBeenCalledOnce()
  })

  it('shows per-type status indicators when generating', () => {
    const statuses = {
      ...idleStatuses(),
      copy: { type: 'copy' as const, status: 'generating' as const },
      narrative: { type: 'narrative' as const, status: 'completed' as const },
    }

    render(
      <GenerationTrigger
        isGenerating={true}
        statuses={statuses}
        onGenerate={() => {}}
      />,
    )

    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Narrativa')).toBeInTheDocument()
  })

  it('shows progress line while generating', () => {
    const { container } = render(
      <GenerationTrigger
        isGenerating={true}
        statuses={idleStatuses()}
        onGenerate={() => {}}
      />,
    )

    expect(container.querySelector('.progress-line')).toBeInTheDocument()
  })
})
