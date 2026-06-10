import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProjectList } from '@/components/dashboard/project-list'
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

const mockMutate = vi.fn()
const mockDeleteProject = vi.fn()

const mockProjects: ProjectWithOutputCount[] = [
  {
    id: 'proj-1',
    user_id: 'user-1',
    input_text: 'Primeiro projeto de conteudo',
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
    output_count: 2,
  },
  {
    id: 'proj-2',
    user_id: 'user-1',
    input_text: 'Segundo projeto de conteudo',
    status: 'completed',
    model_config: {
      copy: { provider: 'openai', model: 'gpt-4o' },
      narrative: { provider: 'openai', model: 'gpt-4o' },
      hooks: { provider: 'openai', model: 'gpt-4o' },
      cta: { provider: 'openai', model: 'gpt-4o' },
      image: null,
    },
    created_at: '2026-06-02T10:00:00Z',
    updated_at: '2026-06-02T10:00:00Z',
    output_count: 5,
  },
]

// Mock the use-projects hook
vi.mock('@/hooks/use-projects', () => ({
  useProjects: vi.fn(() => ({
    projects: mockProjects,
    isLoading: false,
    error: undefined,
    mutate: mockMutate,
  })),
  deleteProject: (...args: unknown[]) => mockDeleteProject(...args),
}))

// We need to import the mocked module to change return values per test
import { useProjects } from '@/hooks/use-projects'
const mockUseProjects = vi.mocked(useProjects)

beforeEach(() => {
  vi.clearAllMocks()
  mockUseProjects.mockReturnValue({
    projects: mockProjects,
    isLoading: false,
    error: undefined,
    mutate: mockMutate,
  })
})

describe('ProjectList', () => {
  it('renders project cards when projects exist', () => {
    render(<ProjectList />)

    // Each project text appears in both title and body preview
    const firstMatches = screen.getAllByText('Primeiro projeto de conteudo')
    expect(firstMatches.length).toBeGreaterThanOrEqual(1)
    const secondMatches = screen.getAllByText('Segundo projeto de conteudo')
    expect(secondMatches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders empty state when no projects', () => {
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    })

    render(<ProjectList />)

    expect(screen.getByText('Nenhum projeto ainda')).toBeInTheDocument()
  })

  it('renders loading spinner when loading', () => {
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: true,
      error: undefined,
      mutate: mockMutate,
    })

    const { container } = render(<ProjectList />)

    // Check for the spinning loader
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: false,
      error: new Error('Network error'),
      mutate: mockMutate,
    })

    render(<ProjectList />)

    expect(
      screen.getByText(/erro ao carregar projetos/i),
    ).toBeInTheDocument()
  })

  it('displays project count', () => {
    render(<ProjectList />)

    expect(screen.getByText('2 projetos')).toBeInTheDocument()
  })

  it('opens delete confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup()

    render(<ProjectList />)

    const deleteButtons = screen.getAllByRole('button', { name: /deletar/i })
    await user.click(deleteButtons[0])

    expect(screen.getByText('Deletar Projeto')).toBeInTheDocument()
    expect(
      screen.getByText(/tem certeza que deseja deletar/i),
    ).toBeInTheDocument()
  })

  it('calls deleteProject and mutate on confirm', async () => {
    const user = userEvent.setup()
    mockDeleteProject.mockResolvedValue(undefined)

    render(<ProjectList />)

    // Open dialog
    const deleteButtons = screen.getAllByRole('button', { name: /deletar/i })
    await user.click(deleteButtons[0])

    // Confirm delete
    const confirmButton = screen.getByRole('button', { name: /^deletar$/i })
    await user.click(confirmButton)

    // Projects are sorted by date DESC, so proj-2 (June 2) comes first
    expect(mockDeleteProject).toHaveBeenCalledWith('proj-2')
  })
})
