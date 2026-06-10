import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-project-id' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}))

// Mock hooks
const mockMutate = vi.fn()
const mockGenerateAll = vi.fn()
const mockGenerateText = vi.fn()
const mockGenerateImage = vi.fn()

vi.mock('@/hooks/use-project', () => ({
  useProject: vi.fn(),
}))

vi.mock('@/hooks/use-generation', () => ({
  useGeneration: () => ({
    statuses: {
      copy: { type: 'copy', status: 'idle' },
      narrative: { type: 'narrative', status: 'idle' },
      hooks: { type: 'hooks', status: 'idle' },
      cta: { type: 'cta', status: 'idle' },
      image: { type: 'image', status: 'idle' },
    },
    isGenerating: false,
    generateAll: mockGenerateAll,
    generateText: mockGenerateText,
    generateImage: mockGenerateImage,
    resetStatuses: vi.fn(),
  }),
}))

import ProjectResultsPage from '@/app/(dashboard)/projects/[id]/page'
import { useProject } from '@/hooks/use-project'

const mockedUseProject = vi.mocked(useProject)

const mockProject = {
  id: 'test-project-id',
  user_id: 'user-1',
  input_text: 'A great marketing campaign for summer products',
  status: 'completed' as const,
  model_config: {
    copy: { provider: 'openai', model: 'gpt-4.1-mini', tier: 'mini' },
    narrative: { provider: 'openai', model: 'gpt-4.1-mini', tier: 'mini' },
    hooks: { provider: 'gemini', model: 'gemini-2.5-flash', tier: 'mini' },
    cta: { provider: 'openai', model: 'gpt-4.1-mini', tier: 'mini' },
    image: null,
  },
  created_at: '2026-06-10T00:00:00Z',
  updated_at: '2026-06-10T00:00:00Z',
  outputs: [
    {
      id: 'o1',
      project_id: 'test-project-id',
      user_id: 'user-1',
      type: 'copy' as const,
      content: 'Summer sale copy text',
      file_url: null,
      provider_used: 'openai',
      model_used: 'gpt-4.1-mini',
      tokens_used: 50,
      created_at: '2026-06-10T01:00:00Z',
    },
  ],
}

describe('ProjectResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while project is fetching', () => {
    mockedUseProject.mockReturnValue({
      project: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
      mutate: mockMutate,
    })

    const { container } = render(<ProjectResultsPage />)

    // Should show a spinner
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error state when project is not found', () => {
    mockedUseProject.mockReturnValue({
      project: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Not found'),
      mutate: mockMutate,
    })

    render(<ProjectResultsPage />)

    expect(screen.getByText('Not found')).toBeInTheDocument()
  })

  it('renders project header and content when loaded', () => {
    mockedUseProject.mockReturnValue({
      project: mockProject,
      isLoading: false,
      isError: false,
      error: undefined,
      mutate: mockMutate,
    })

    render(<ProjectResultsPage />)

    // Title derived from input text
    expect(
      screen.getByText('A great marketing campaign for summer products'),
    ).toBeInTheDocument()

    // Status badge
    expect(screen.getByText('Concluido')).toBeInTheDocument()

    // Tab bar exists
    expect(screen.getByRole('tablist')).toBeInTheDocument()

    // Output content is shown (copy tab is default)
    expect(screen.getByText('Summer sale copy text')).toBeInTheDocument()
  })

  it('shows empty state for tabs with no outputs', () => {
    mockedUseProject.mockReturnValue({
      project: { ...mockProject, outputs: [] },
      isLoading: false,
      isError: false,
      error: undefined,
      mutate: mockMutate,
    })

    render(<ProjectResultsPage />)

    expect(
      screen.getByText(/Nenhum conteudo gerado ainda/),
    ).toBeInTheDocument()
  })

  it('renders "Regenerar Tudo" when project has outputs', () => {
    mockedUseProject.mockReturnValue({
      project: mockProject,
      isLoading: false,
      isError: false,
      error: undefined,
      mutate: mockMutate,
    })

    render(<ProjectResultsPage />)

    expect(screen.getByText('Regenerar Tudo')).toBeInTheDocument()
  })

  it('renders "Gerar Conteudo" when project has no outputs', () => {
    mockedUseProject.mockReturnValue({
      project: { ...mockProject, outputs: [], status: 'draft' as const },
      isLoading: false,
      isError: false,
      error: undefined,
      mutate: mockMutate,
    })

    render(<ProjectResultsPage />)

    expect(screen.getByText('Gerar Conteudo')).toBeInTheDocument()
  })
})
