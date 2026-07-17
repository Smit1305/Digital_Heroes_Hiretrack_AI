import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockUser, mockDb } = vi.hoisted(() => {
  const mockUser = {
    id: 'user-001',
    name: 'Test Analyst',
    email: 'analyst@test.com',
    role: 'RECRUITER' as const,
    organizationId: 'org-001',
  }

  const mockDb = {
    application: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    interview: {
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    candidate: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    job: {
      findMany: vi.fn(),
    },
    scorecard: {
      findMany: vi.fn(),
    },
    activityLog: {
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
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
  getAnalyticsKPIsAction,
  getDepartmentAnalyticsAction,
  getInterviewSuccessAction,
  getAnalyticsExportDataAction,
} from '@/server/actions/analytics'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
})

describe('getAnalyticsKPIsAction with custom date range', () => {
  it('queries database with custom start and end date bounds', async () => {
    mockDb.application.count.mockResolvedValue(5)
    mockDb.interview.count.mockResolvedValue(0)
    mockDb.application.findMany.mockResolvedValue([])
    mockDb.interview.aggregate.mockResolvedValue({ _avg: { rating: null } })
    mockDb.candidate.count.mockResolvedValue(10)

    const result = await getAnalyticsKPIsAction('30d', '2026-06-01', '2026-06-30')

    expect(result.success).toBe(true)
    // Check that db.application.count was called with date boundaries
    expect(mockDb.application.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          appliedAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    )
  })
})

describe('getDepartmentAnalyticsAction', () => {
  it('groups jobs and counts applications by department', async () => {
    mockDb.job.findMany.mockResolvedValue([
      {
        id: 'job-1',
        department: 'Engineering',
        status: 'OPEN',
        _count: { applications: 10 },
        applications: [{ id: 'app-1' }, { id: 'app-2' }], // 2 hires
      },
      {
        id: 'job-2',
        department: 'Engineering',
        status: 'CLOSED',
        _count: { applications: 5 },
        applications: [],
      },
      {
        id: 'job-3',
        department: 'Sales',
        status: 'OPEN',
        _count: { applications: 2 },
        applications: [],
      },
    ])

    const result = await getDepartmentAnalyticsAction('30d')
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data).toHaveLength(2)
    const eng = result.data.find((d) => d.department === 'Engineering')
    const sales = result.data.find((d) => d.department === 'Sales')

    expect(eng?.openJobsCount).toBe(1)
    expect(eng?.applicationCount).toBe(15)
    expect(eng?.hireCount).toBe(2)

    expect(sales?.openJobsCount).toBe(1)
    expect(sales?.applicationCount).toBe(2)
    expect(sales?.hireCount).toBe(0)
  })
})

describe('getInterviewSuccessAction', () => {
  it('groups scorecards by recommendation category', async () => {
    mockDb.scorecard.findMany.mockResolvedValue([
      { recommendation: 'Strong Hire' },
      { recommendation: 'Hire' },
      { recommendation: 'No Hire' },
      { recommendation: 'Strong Hire' },
    ])

    const result = await getInterviewSuccessAction('30d')
    expect(result.success).toBe(true)
    if (!result.success) return

    const strongHire = result.data.find((d) => d.recommendation === 'STRONG HIRE')
    const hire = result.data.find((d) => d.recommendation === 'HIRE')
    const noHire = result.data.find((d) => d.recommendation === 'NO HIRE')

    expect(strongHire?.count).toBe(2)
    expect(hire?.count).toBe(1)
    expect(noHire?.count).toBe(1)
  })
})

describe('getAnalyticsExportDataAction', () => {
  it('aggregates all data segments under custom dates', async () => {
    mockDb.application.count.mockResolvedValue(10)
    mockDb.application.findMany.mockResolvedValue([])
    mockDb.interview.aggregate.mockResolvedValue({ _avg: { rating: null } })
    mockDb.candidate.count.mockResolvedValue(2)
    mockDb.application.groupBy.mockResolvedValue([])
    mockDb.candidate.groupBy.mockResolvedValue([])
    mockDb.job.findMany.mockResolvedValue([])

    const result = await getAnalyticsExportDataAction('90d', '2026-01-01', '2026-03-31')
    expect(result.success).toBe(true)
  })
})
