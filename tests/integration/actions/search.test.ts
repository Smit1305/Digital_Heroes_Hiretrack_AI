import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockUser, mockDb } = vi.hoisted(() => {
  const mockUser = {
    id: 'user-001',
    name: 'Test Administrator',
    email: 'admin@test.com',
    role: 'SUPER_ADMIN' as const,
    organizationId: 'org-001',
  }

  const mockDb = {
    job: {
      findMany: vi.fn(),
    },
    candidate: {
      findMany: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
    },
  }

  return { mockUser, mockDb }
})

vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn().mockResolvedValue(mockUser),
  requirePermission: vi.fn().mockResolvedValue(mockUser),
}))

vi.mock('@/lib/db', () => ({ db: mockDb }))

import { requireAuth } from '@/lib/auth-utils'
import { searchGlobalAction } from '@/server/actions/search'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requireAuth).mockResolvedValue(mockUser)
})

describe('searchGlobalAction', () => {
  it('returns default settings when query is too short', async () => {
    const result = await searchGlobalAction('a')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.jobs).toHaveLength(0)
    expect(result.data.candidates).toHaveLength(0)
    expect(result.data.teams).toHaveLength(0)
    expect(result.data.settings).toHaveLength(4)
  })

  it('performs multi-entity queries when query is valid', async () => {
    mockDb.job.findMany.mockResolvedValue([{ id: 'job-1', title: 'React Engineer', status: 'OPEN' }])
    mockDb.candidate.findMany.mockResolvedValue([{ id: 'cand-1', firstName: 'John', lastName: 'Doe', email: 'john@doe.com' }])
    mockDb.team.findMany.mockResolvedValue([{ id: 'team-1', name: 'Engineering' }])

    const result = await searchGlobalAction('Engine')

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.jobs).toHaveLength(1)
    expect(result.data.candidates).toHaveLength(1)
    expect(result.data.teams).toHaveLength(1)

    // Check that org filters are applied
    expect(mockDb.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org-001',
        }),
      })
    )
    expect(mockDb.candidate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org-001',
        }),
      })
    )
  })

  it('fails if no organization id on user', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ ...mockUser, organizationId: null })

    const result = await searchGlobalAction('Engine')
    expect(result.success).toBe(false)
  })
})
