import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HistoryList } from '@/components/history/history-list'
import type { Output } from '@/types'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

function makeOutput(type: Output['type'], id: string): Output {
  return {
    id,
    project_id: 'proj-1',
    user_id: 'user-1',
    type,
    content: `Sample ${type} content`,
    file_url: type === 'image' ? 'https://example.com/img.png' : null,
    provider_used: 'openai',
    model_used: 'gpt-4.1-mini',
    tokens_used: 100,
    created_at: '2026-06-10T10:00:00Z',
  }
}

describe('HistoryList', () => {
  it('renders loading spinner when loading with no outputs', () => {
    const { container } = render(
      <HistoryList
        outputs={[]}
        total={0}
        isLoading={true}
        hasMore={false}
        onLoadMore={() => {}}
      />,
    )

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders empty state when no outputs and not loading', () => {
    render(
      <HistoryList
        outputs={[]}
        total={0}
        isLoading={false}
        hasMore={false}
        onLoadMore={() => {}}
      />,
    )

    expect(screen.getByText('Nenhum output encontrado.')).toBeInTheDocument()
  })

  it('renders output count', () => {
    const outputs = [makeOutput('copy', '1'), makeOutput('narrative', '2')]

    render(
      <HistoryList
        outputs={outputs}
        total={2}
        isLoading={false}
        hasMore={false}
        onLoadMore={() => {}}
      />,
    )

    expect(screen.getByText('2 resultados')).toBeInTheDocument()
  })

  it('renders singular count for 1 result', () => {
    const outputs = [makeOutput('copy', '1')]

    render(
      <HistoryList
        outputs={outputs}
        total={1}
        isLoading={false}
        hasMore={false}
        onLoadMore={() => {}}
      />,
    )

    expect(screen.getByText('1 resultado')).toBeInTheDocument()
  })

  it('renders load more button when hasMore is true', () => {
    const outputs = [makeOutput('copy', '1')]

    render(
      <HistoryList
        outputs={outputs}
        total={10}
        isLoading={false}
        hasMore={true}
        onLoadMore={() => {}}
      />,
    )

    expect(screen.getByText('Carregar mais')).toBeInTheDocument()
  })

  it('calls onLoadMore when load more button is clicked', () => {
    const onLoadMore = vi.fn()
    const outputs = [makeOutput('copy', '1')]

    render(
      <HistoryList
        outputs={outputs}
        total={10}
        isLoading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
      />,
    )

    fireEvent.click(screen.getByText('Carregar mais'))
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('does not render load more when hasMore is false', () => {
    const outputs = [makeOutput('copy', '1')]

    render(
      <HistoryList
        outputs={outputs}
        total={1}
        isLoading={false}
        hasMore={false}
        onLoadMore={() => {}}
      />,
    )

    expect(screen.queryByText('Carregar mais')).not.toBeInTheDocument()
  })
})
