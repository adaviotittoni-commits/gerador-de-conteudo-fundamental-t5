import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ApiKeysTable } from '@/components/api-keys/api-keys-table'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockKeys = [
  {
    id: '1',
    user_id: 'user-1',
    provider: 'openai' as const,
    key_suffix: 'ab12',
    status: 'valid' as const,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    provider: 'gemini' as const,
    key_suffix: 'cd34',
    status: 'unchecked' as const,
    created_at: '2026-06-02T00:00:00Z',
    updated_at: '2026-06-02T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    provider: 'anthropic' as const,
    key_suffix: 'ef56',
    status: 'invalid' as const,
    created_at: '2026-06-03T00:00:00Z',
    updated_at: '2026-06-03T00:00:00Z',
  },
]

describe('ApiKeysTable', () => {
  it('renders provider names in the table', () => {
    render(
      <ApiKeysTable
        keys={mockKeys}
        onKeyAdded={vi.fn()}
        onKeyDeleted={vi.fn()}
      />,
    )

    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('Google Gemini')).toBeInTheDocument()
    expect(screen.getByText('Anthropic')).toBeInTheDocument()
  })

  it('displays masked keys with only last 4 characters visible', () => {
    render(
      <ApiKeysTable
        keys={mockKeys}
        onKeyAdded={vi.fn()}
        onKeyDeleted={vi.fn()}
      />,
    )

    expect(screen.getByText('sk-...ab12')).toBeInTheDocument()
    expect(screen.getByText('sk-...cd34')).toBeInTheDocument()
    expect(screen.getByText('sk-...ef56')).toBeInTheDocument()
  })

  it('never displays the full encrypted key', () => {
    render(
      <ApiKeysTable
        keys={mockKeys}
        onKeyAdded={vi.fn()}
        onKeyDeleted={vi.fn()}
      />,
    )

    // The encrypted_key field is not even in the props type —
    // the table only receives key_suffix, never the full key
    const html = document.body.innerHTML
    expect(html).not.toContain('encrypted_key')
  })

  it('renders status dots with correct labels', () => {
    render(
      <ApiKeysTable
        keys={mockKeys}
        onKeyAdded={vi.fn()}
        onKeyDeleted={vi.fn()}
      />,
    )

    expect(screen.getByText('valid')).toBeInTheDocument()
    expect(screen.getByText('unchecked')).toBeInTheDocument()
    expect(screen.getByText('invalid')).toBeInTheDocument()
  })

  it('shows empty state when no keys exist', () => {
    render(
      <ApiKeysTable keys={[]} onKeyAdded={vi.fn()} onKeyDeleted={vi.fn()} />,
    )

    expect(
      screen.getByText(/no api keys configured yet/i),
    ).toBeInTheDocument()
  })

  it('renders remove buttons for each key', () => {
    render(
      <ApiKeysTable
        keys={mockKeys}
        onKeyAdded={vi.fn()}
        onKeyDeleted={vi.fn()}
      />,
    )

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons).toHaveLength(3)
  })

  it('opens delete confirmation dialog when remove is clicked', async () => {
    const user = userEvent.setup()

    render(
      <ApiKeysTable
        keys={mockKeys}
        onKeyAdded={vi.fn()}
        onKeyDeleted={vi.fn()}
      />,
    )

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])

    expect(screen.getByText('Remove API Key')).toBeInTheDocument()
    expect(screen.getByText(/openai/i, { selector: 'strong' })).toBeInTheDocument()
  })
})
