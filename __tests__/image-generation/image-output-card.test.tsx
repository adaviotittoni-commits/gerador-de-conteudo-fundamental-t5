import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImageOutputCard } from '@/components/projects/image-output-card'

describe('ImageOutputCard', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/test-image.png',
    prompt: 'A futuristic city at sunset',
    provider: 'openai',
    model: 'dall-e-3',
    createdAt: '2026-06-10T10:00:00Z',
  }

  it('should render the image with correct src and alt', () => {
    render(<ImageOutputCard {...defaultProps} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', defaultProps.imageUrl)
    expect(img).toHaveAttribute('alt', defaultProps.prompt)
  })

  it('should display the "Imagem" label', () => {
    render(<ImageOutputCard {...defaultProps} />)

    expect(screen.getByText('Imagem')).toBeInTheDocument()
  })

  it('should display the provider and model in the AI chip', () => {
    render(<ImageOutputCard {...defaultProps} />)

    expect(screen.getByText('openai/dall-e-3')).toBeInTheDocument()
  })

  it('should render the download button with accessible label', () => {
    render(<ImageOutputCard {...defaultProps} />)

    const downloadBtn = screen.getByRole('button', { name: /download image/i })
    expect(downloadBtn).toBeInTheDocument()
  })

  it('should display the prompt text in the hover overlay', () => {
    render(<ImageOutputCard {...defaultProps} />)

    expect(screen.getByText(defaultProps.prompt)).toBeInTheDocument()
  })

  it('should apply hover zoom class to the image', () => {
    render(<ImageOutputCard {...defaultProps} />)

    const img = screen.getByRole('img')
    expect(img.className).toContain('group-hover:scale-110')
    expect(img.className).toContain('transition-transform')
    expect(img.className).toContain('duration-500')
  })

  it('should apply glass-card and border-l-secondary classes', () => {
    const { container } = render(<ImageOutputCard {...defaultProps} />)

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('glass-card')
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('border-l-secondary')
  })

  it('should accept an additional className prop', () => {
    const { container } = render(
      <ImageOutputCard {...defaultProps} className="mt-4" />,
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('mt-4')
  })
})
