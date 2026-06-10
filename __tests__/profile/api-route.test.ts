import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server supabase client
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return { eq: (...eqArgs: unknown[]) => { mockEq(...eqArgs); return { single: () => mockSingle() } } }
      },
      update: (...args: unknown[]) => {
        mockUpdate(...args)
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs)
            return {
              select: () => ({
                single: () => mockSingle(),
              }),
            }
          },
        }
      },
    }),
  }),
}))

// We need to dynamically import the route handlers after mocks are set up
let GET: (typeof import('@/app/api/profile/route'))['GET']
let PUT: (typeof import('@/app/api/profile/route'))['PUT']

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('@/app/api/profile/route')
  GET = mod.GET
  PUT = mod.PUT
})

describe('Profile API Route', () => {
  describe('GET /api/profile', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return profile for authenticated user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockSingle.mockResolvedValue({
        data: { id: 'user-123', full_name: 'Test User' },
        error: null,
      })

      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.profile.full_name).toBe('Test User')
    })

    it('should return 500 on database error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      })

      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to fetch profile')
    })
  })

  describe('PUT /api/profile', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: 'Test' }),
      })

      const response = await PUT(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 for invalid body', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const request = new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: 'J' }), // too short
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })

    it('should update profile with valid data', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockSingle.mockResolvedValue({
        data: { id: 'user-123', full_name: 'Updated Name' },
        error: null,
      })

      const request = new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Updated Name',
          niche: 'Tech',
          youtube_url: '',
          instagram_url: '',
        }),
      })

      const response = await PUT(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.message).toBe('Profile updated successfully')
    })

    it('should return 400 for non-JSON body', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const request = new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: 'not json',
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })
  })
})
