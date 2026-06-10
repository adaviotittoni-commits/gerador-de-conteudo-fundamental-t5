import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ProjectCard } from '@/components/dashboard/project-card'
import type { ProjectWithOutputCount } from '@/hooks/use-projects'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const baseProject: ProjectWithOutputCount = {
  id: 'proj-1',
  user_id: 'user-1',
  input_text: 'Criar conteudo sobre inteligencia artificial para redes sociais',
  status: 'draft',
  model_config: {
    copy: { provider: 'openai', model: 'gpt-4o' },
    narrative: { provider: 'openai', model: 'gpt-4o' },
    hooks: { provider: 'openai', model: 'gpt-4o' },
    cta: { provider: 'openai', model: 'gpt-4o' },
    image: null,
  },
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
  output_count: 3,
}

describe('ProjectCard', () => {
  it('renders project title from briefing text', () => {
    render(<ProjectCard project={baseProject} onDelete={vi.fn()} />)

    // Title and body preview both show the text — check at least one exists
    const matches = screen.getAllByText(
      'Criar conteudo sobre inteligencia artificial para redes sociais',
    )
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('truncates long titles to 8 words', () => {
    const longProject: ProjectWithOutputCount = {
      ...baseProject,
      input_text:
        'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10',
    }

    render(<ProjectCard project={longProject} onDelete={vi.fn()} />)

    expect(
      screen.getByText('word1 word2 word3 word4 word5 word6 word7 word8...'),
    ).toBeInTheDocument()
  })

  it('displays status badge for draft', () => {
    render(<ProjectCard project={baseProject} onDelete={vi.fn()} />)

    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('displays status badge for completed', () => {
    const completedProject = { ...baseProject, status: 'completed' as const }
    render(<ProjectCard project={completedProject} onDelete={vi.fn()} />)

    expect(screen.getByText('Concluido')).toBeInTheDocument()
  })

  it('displays status badge for generating with animate-pulse', () => {
    const generatingProject = {
      ...baseProject,
      status: 'generating' as const,
    }
    render(<ProjectCard project={generatingProject} onDelete={vi.fn()} />)

    const badge = screen.getByText('Gerando')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('animate-pulse')
  })

  it('displays status badge for error', () => {
    const errorProject = { ...baseProject, status: 'error' as const }
    render(<ProjectCard project={errorProject} onDelete={vi.fn()} />)

    expect(screen.getByText('Erro')).toBeInTheDocument()
  })

  it('displays output count', () => {
    render(<ProjectCard project={baseProject} onDelete={vi.fn()} />)

    expect(screen.getByText('3 outputs')).toBeInTheDocument()
  })

  it('displays singular output label for count of 1', () => {
    const singleOutputProject = { ...baseProject, output_count: 1 }
    render(<ProjectCard project={singleOutputProject} onDelete={vi.fn()} />)

    expect(screen.getByText('1 output')).toBeInTheDocument()
  })

  it('links to the project detail page', () => {
    render(<ProjectCard project={baseProject} onDelete={vi.fn()} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard/projects/proj-1')
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<ProjectCard project={baseProject} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: /deletar/i })
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(baseProject)
  })

  it('renders the delete button', () => {
    render(<ProjectCard project={baseProject} onDelete={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: /deletar/i }),
    ).toBeInTheDocument()
  })
})
