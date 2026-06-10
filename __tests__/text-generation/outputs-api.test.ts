import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock result holder — the final query result
const mockQueryResult = vi.fn()
const mockGetUser = vi.fn()

/**
 * Create a chainable mock that returns itself for any method call,
 * and acts as a thenable that resolves to mockQueryResult().
 */
function createChainableMock() {
  const chain: Record<string, unknown> = {}

  const handler = {
    get(_target: Record<string, unknown>, prop: string) {
      if (prop === 'then') {
        // Make the chain thenable — resolves to the mock result
        return (resolve: (v: unknown) => void) => {
          const result = mockQueryResult()
          resolve(result)
        }
      }
      // Return a function that returns the proxy (chainable)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return (..._args: unknown[]) => new Proxy(chain, handler)
    },
  }

  return new Proxy(chain, handler)
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => createChainableMock(),
  }),
}))

let GET: (typeof import('@/app/api/outputs/route'))['GET']

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('@/app/api/outputs/route')
  GET = mod.GET
})

describe('Outputs API Route', () => {
  describe('GET /api/outputs', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new Request('http://localhost/api/outputs')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return outputs for authenticated user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const sampleOutputs = [
        {
          id: 'output-1',
          project_id: 'proj-1',
          user_id: 'user-123',
          type: 'copy',
          content: 'Generated copy text',
          provider_used: 'openai',
          model_used: 'gpt-4o',
          tokens_used: 150,
          created_at: '2026-06-10T10:00:00Z',
        },
      ]

      mockQueryResult.mockReturnValue({
        data: sampleOutputs,
        error: null,
      })

      const request = new Request('http://localhost/api/outputs')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.outputs).toHaveLength(1)
      expect(json.outputs[0].type).toBe('copy')
    })

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockQueryResult.mockReturnValue({
        data: null,
        error: { message: 'DB error' },
      })

      const request = new Request('http://localhost/api/outputs')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to fetch outputs')
    })

    it('should return empty array when no outputs exist', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockQueryResult.mockReturnValue({
        data: [],
        error: null,
      })

      const request = new Request('http://localhost/api/outputs')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.outputs).toEqual([])
    })
  })
})
