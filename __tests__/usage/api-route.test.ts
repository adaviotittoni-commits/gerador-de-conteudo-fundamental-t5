import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server supabase client
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockGte = vi.fn()

function createQueryChain(data: unknown[] | null, error: unknown | null) {
  const result = { data, error }
  const chain = {
    select: (...args: unknown[]) => {
      mockSelect(...args)
      return chain
    },
    eq: (...args: unknown[]) => {
      mockEq(...args)
      return chain
    },
    gte: (...args: unknown[]) => {
      mockGte(...args)
      return chain
    },
    then: (resolve: (value: typeof result) => void) => resolve(result),
  }

  // Make the chain thenable so `await` works
  Object.defineProperty(chain, 'then', {
    value: (
      resolve: (value: typeof result) => void,
      reject?: (reason: unknown) => void,
    ) => {
      return Promise.resolve(result).then(resolve, reject)
    },
    enumerable: false,
  })

  return chain
}

let currentOutputsData: unknown[] | null = []
let currentOutputsError: unknown | null = null

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => createQueryChain(currentOutputsData, currentOutputsError),
  }),
}))

let GET: (typeof import('@/app/api/usage/route'))['GET']

beforeEach(async () => {
  vi.clearAllMocks()
  currentOutputsData = []
  currentOutputsError = null
  const mod = await import('@/app/api/usage/route')
  GET = mod.GET
})

describe('Usage API Route', () => {
  describe('GET /api/usage', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new Request('http://localhost/api/usage?period=30d')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return aggregated usage data for authenticated user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      currentOutputsData = [
        { provider_used: 'openai', tokens_used: 500, type: 'copy' },
        { provider_used: 'openai', tokens_used: 300, type: 'narrative' },
        { provider_used: 'gemini', tokens_used: 200, type: 'hooks' },
      ]

      const request = new Request('http://localhost/api/usage?period=30d')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.tokensByProvider).toBeDefined()
      expect(json.outputsByType).toBeDefined()
      expect(json.totals).toBeDefined()
    })

    it('should return empty arrays for user with no outputs', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      currentOutputsData = []

      const request = new Request('http://localhost/api/usage?period=all')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.tokensByProvider).toEqual([])
      expect(json.outputsByType).toEqual([])
      expect(json.totals.total_tokens).toBe(0)
      expect(json.totals.total_outputs).toBe(0)
    })

    it('should accept period query parameter', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      currentOutputsData = []

      const request7d = new Request('http://localhost/api/usage?period=7d')
      const response7d = await GET(request7d)
      expect(response7d.status).toBe(200)

      const requestAll = new Request('http://localhost/api/usage?period=all')
      const responseAll = await GET(requestAll)
      expect(responseAll.status).toBe(200)
    })

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      currentOutputsError = { message: 'DB error' }
      currentOutputsData = null

      const request = new Request('http://localhost/api/usage?period=30d')
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to fetch usage metrics')
    })
  })
})
