import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OutputPreview } from '@/components/history/output-preview'
import type { Output } from '@/types'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

function makeTextOutput(overrides: Partial<Output> = {}): Output {
  return {
    id: 'out-1',
    project_id: 'proj-1',
    user_id: 'user-1',
    type: 'copy',
    content: 'This is a sample copy output for testing the preview component.',
    file_url: null,
    provider_used: 'openai',
    model_used: 'gpt-4.1-mini',
    tokens_used: 100,
    created_at: '2026-06-10T14:30:00Z',
    ...overrides,
  }
}

function makeImageOutput(overrides: Partial<Output> = {}): Output {
  return {
    id: 'out-2',
    project_id: 'proj-1',
    user_id: 'user-1',
    type: 'image',
    content: 'A beautiful landscape',
    file_url: 'https://example.com/image.png',
    provider_used: 'gemini',
    model_used: 'imagen-3',
    tokens_used: null,
    created_at: '2026-06-10T15:00:00Z',
    ...overrides,
  }
}

describe('OutputPreview', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders type label for text output', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('renders type label for image output', () => {
    render(<OutputPreview output={makeImageOutput()} />)

    expect(screen.getByText('Imagem')).toBeInTheDocument()
  })

  it('renders AI chip with provider/model', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    expect(screen.getByText('openai/gpt-4.1-mini')).toBeInTheDocument()
  })

  it('renders truncated text content', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    const content = screen.getByText(
      'This is a sample copy output for testing the preview component.',
    )
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('line-clamp-2')
  })

  it('expands text content when expand button is clicked', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    const expandButton = screen.getByLabelText('Expandir')
    fireEvent.click(expandButton)

    const content = screen.getByText(
      'This is a sample copy output for testing the preview component.',
    )
    expect(content).not.toHaveClass('line-clamp-2')
  })

  it('shows copy button for text outputs', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    expect(screen.getByLabelText('Copiar')).toBeInTheDocument()
  })

  it('shows download button for image outputs', () => {
    render(<OutputPreview output={makeImageOutput()} />)

    expect(screen.getByLabelText('Download')).toBeInTheDocument()
  })

  it('shows Ver Projeto link', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    const link = screen.getByLabelText('Ver Projeto')
    expect(link).toHaveAttribute('href', '/dashboard/projects/proj-1')
  })

  it('copies content when copy button is clicked', () => {
    render(<OutputPreview output={makeTextOutput()} />)

    fireEvent.click(screen.getByLabelText('Copiar'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'This is a sample copy output for testing the preview component.',
    )
  })

  it('renders image thumbnail for image outputs', () => {
    render(<OutputPreview output={makeImageOutput()} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/image.png')
  })
})
