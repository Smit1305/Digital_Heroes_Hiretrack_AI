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
    team: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    job: {
      findMany: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  }

  return { mockUser, mockDb }
})

vi.mock('@/lib/auth-utils', () => ({
  requirePermission: vi.fn().mockResolvedValue(mockUser),
  requireAuth: vi.fn().mockResolvedValue(mockUser),
}))

vi.mock('@/lib/db', () => ({ db: mockDb }))

import { requirePermission } from '@/lib/auth-utils'
import {
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
  getTeamAnalyticsAction,
} from '@/server/actions/teams'

const mockTeam = {
  id: 'team-001',
  name: 'Engineering',
  description: 'Technical teams',
  organizationId: 'org-001',
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.auditLog.create.mockResolvedValue({})
})

describe('createTeamAction', () => {
  it('creates team successfully', async () => {
    mockDb.team.findUnique.mockResolvedValue(null)
    mockDb.team.create.mockResolvedValue(mockTeam)

    const result = await createTeamAction({ name: 'Engineering', description: 'Tech' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('team-001')
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if name already exists', async () => {
    mockDb.team.findUnique.mockResolvedValue(mockTeam)

    const result = await createTeamAction({ name: 'Engineering', description: 'Tech' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('already exists')
  })
})

describe('updateTeamAction', () => {
  it('updates team successfully', async () => {
    mockDb.team.findFirst.mockResolvedValue(mockTeam)
    mockDb.team.update.mockResolvedValue({ ...mockTeam, description: 'Updated Tech' })

    const result = await updateTeamAction('team-001', { name: 'Engineering', description: 'Updated Tech' })
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if team is not found', async () => {
    mockDb.team.findFirst.mockResolvedValue(null)

    const result = await updateTeamAction('invalid-id', { name: 'Engineering', description: 'Updated' })
    expect(result.success).toBe(false)
  })
})

describe('deleteTeamAction', () => {
  it('deletes team successfully', async () => {
    mockDb.team.findFirst.mockResolvedValue(mockTeam)
    mockDb.team.delete.mockResolvedValue(mockTeam)

    const result = await deleteTeamAction('team-001')
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if team is not found', async () => {
    mockDb.team.findFirst.mockResolvedValue(null)

    const result = await deleteTeamAction('invalid-id')
    expect(result.success).toBe(false)
  })
})

describe('getTeamAnalyticsAction', () => {
  it('returns team analytics data', async () => {
    mockDb.team.findFirst.mockResolvedValue(mockTeam)
    mockDb.job.findMany.mockResolvedValue([
      {
        id: 'job-001',
        title: 'Developer',
        status: 'OPEN',
        applications: [{ id: 'app-001', stage: 'HIRED' }],
      },
    ])

    const result = await getTeamAnalyticsAction('team-001')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.activeJobsCount).toBe(1)
    expect(result.data.totalCandidatesCount).toBe(1)
    expect(result.data.hiredCandidatesCount).toBe(1)
  })
})
