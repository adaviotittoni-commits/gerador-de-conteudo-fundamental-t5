import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TextOutputCard } from '@/components/projects/text-output-card'

const defaultProps = {
  content: 'This is generated copy text for testing purposes.',
  type: 'copy' as const,
  provider: 'openai',
  model: 'gpt-4.1-mini',
  createdAt: '2026-06-10T12:00:00Z',
}

describe('TextOutputCard', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders content text', () => {
    render(<TextOutputCard {...defaultProps} />)

    expect(
      screen.getByText('This is generated copy text for testing purposes.'),
    ).toBeInTheDocument()
  })

  it('renders type label', () => {
    render(<TextOutputCard {...defaultProps} />)

    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('renders AI chip with provider/model', () => {
    render(<TextOutputCard {...defaultProps} />)

    expect(screen.getByText('openai/gpt-4.1-mini')).toBeInTheDocument()
  })

  it('renders character and word counts', () => {
    render(<TextOutputCard {...defaultProps} />)

    const charCount = defaultProps.content.length
    const wordCount = defaultProps.content.trim().split(/\s+/).filter(Boolean).length

    expect(screen.getByText(`${charCount} chars`)).toBeInTheDocument()
    expect(screen.getByText(`${wordCount} words`)).toBeInTheDocument()
  })

  it('copies content to clipboard when copy button is clicked', async () => {
    render(<TextOutputCard {...defaultProps} />)

    const copyButton = screen.getByLabelText('Copy to clipboard')
    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      defaultProps.content,
    )
  })

  it('renders regenerate button when onRegenerate is provided', () => {
    const onRegenerate = vi.fn()
    render(<TextOutputCard {...defaultProps} onRegenerate={onRegenerate} />)

    expect(screen.getByLabelText('Regenerate')).toBeInTheDocument()
  })

  it('does not render regenerate button when onRegenerate is not provided', () => {
    render(<TextOutputCard {...defaultProps} />)

    expect(screen.queryByLabelText('Regenerate')).not.toBeInTheDocument()
  })

  it('calls onRegenerate when regenerate button is clicked', () => {
    const onRegenerate = vi.fn()
    render(<TextOutputCard {...defaultProps} onRegenerate={onRegenerate} />)

    fireEvent.click(screen.getByLabelText('Regenerate'))
    expect(onRegenerate).toHaveBeenCalledOnce()
  })

  it('shows progress line when isRegenerating is true', () => {
    const { container } = render(
      <TextOutputCard {...defaultProps} isRegenerating onRegenerate={() => {}} />,
    )

    expect(container.querySelector('.progress-line')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<TextOutputCard {...defaultProps} />)

    // The date should be formatted in pt-BR
    // 10 de jun. de 2026
    expect(screen.getByText(/jun/i)).toBeInTheDocument()
  })
})
