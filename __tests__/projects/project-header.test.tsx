import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProjectHeader } from '@/components/projects/project-header'

describe('ProjectHeader', () => {
  it('renders the project title', () => {
    render(<ProjectHeader title="My Campaign" status="draft" />)

    expect(screen.getByText('My Campaign')).toBeInTheDocument()
  })

  it('renders draft status badge', () => {
    render(<ProjectHeader title="Test" status="draft" />)

    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('renders generating status badge', () => {
    render(<ProjectHeader title="Test" status="generating" />)

    expect(screen.getByText('Gerando...')).toBeInTheDocument()
  })

  it('renders completed status badge', () => {
    render(<ProjectHeader title="Test" status="completed" />)

    expect(screen.getByText('Concluido')).toBeInTheDocument()
  })

  it('renders error status badge', () => {
    render(<ProjectHeader title="Test" status="error" />)

    expect(screen.getByText('Erro')).toBeInTheDocument()
  })
})
