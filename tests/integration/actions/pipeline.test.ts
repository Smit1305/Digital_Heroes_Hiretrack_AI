/**
 * Integration tests for pipeline server actions.
 * Uses vi.hoisted() for proper mock factory hoisting.
 */
import { vi } from 'vitest'

const { mockUser, mockDb } = vi.hoisted(() => {
  const mockUser = {
    id: 'user-001',
    name: 'Test Recruiter',
    email: 'recruiter@test.com',
    role: 'RECRUITER' as const,
    organizationId: 'org-001',
  }
  const mockDb = {
    application: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    job: { findMany: vi.fn() },
    activityLog: { create: vi.fn() },
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
    getPipelineAction,
    getPipelineJobsAction,
    moveApplicationAction,
    rejectApplicationAction,
} from '@/server/actions/pipeline'

const mockApplication = {
  id: 'app-001',
  candidateId: 'cand-001',
  jobId: 'job-001',
  stage: 'APPLIED' as const,
  stageOrder: 0,
  score: null,
  appliedAt: new Date(),
  hiredAt: null,
  rejectedAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  candidate: { id: 'cand-001', firstName: 'Jane', lastName: 'Smith', email: 'j@x.com', resumeUrl: null },
  job: { id: 'job-001', title: 'Engineer', department: 'Eng', location: 'Remote' },
  interviews: [],
  notes: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.activityLog.create.mockResolvedValue({})
  mockDb.auditLog.create.mockResolvedValue({})
})

// ─── getPipelineAction ────────────────────────────────────────────────────────

describe('getPipelineAction', () => {
  it('always returns exactly 9 columns', async () => {
    mockDb.application.findMany.mockResolvedValue([])
    const result = await getPipelineAction()
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveLength(9)
  })

  it('places applications in the correct column', async () => {
    mockDb.application.findMany.mockResolvedValue([
      { ...mockApplication, stage: 'SCREENING' },
    ])
    const result = await getPipelineAction()
    expect(result.success).toBe(true)
    if (!result.success) return
    const screening = result.data.find((c) => c.id === 'SCREENING')
    const applied = result.data.find((c) => c.id === 'APPLIED')
    expect(screening?.applications).toHaveLength(1)
    expect(applied?.applications).toHaveLength(0)
  })

  it('returns error when user has no org', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, organizationId: null })
    const result = await getPipelineAction()
    expect(result.success).toBe(false)
  })

  it('passes jobId filter to DB query', async () => {
    mockDb.application.findMany.mockResolvedValue([])
    await getPipelineAction('job-001')
    expect(mockDb.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ jobId: 'job-001' }) })
    )
  })

  it('all columns are present even with no applications', async () => {
    mockDb.application.findMany.mockResolvedValue([])
    const result = await getPipelineAction()
    if (!result.success) return
    const stageIds = result.data.map((c) => c.id)
    expect(stageIds).toContain('APPLIED')
    expect(stageIds).toContain('HIRED')
    expect(stageIds).toContain('REJECTED')
  })
})

// ─── moveApplicationAction ────────────────────────────────────────────────────

describe('moveApplicationAction', () => {
  it('moves application to new stage', async () => {
    mockDb.application.findFirst.mockResolvedValue(mockApplication)
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'SCREENING' })

    const result = await moveApplicationAction('app-001', 'SCREENING')
    expect(result.success).toBe(true)
    expect(mockDb.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stage: 'SCREENING' }) })
    )
  })

  it('returns no-op when stage is unchanged and no new order given', async () => {
    mockDb.application.findFirst.mockResolvedValue(mockApplication) // stage: APPLIED
    const result = await moveApplicationAction('app-001', 'APPLIED')
    expect(result.success).toBe(true)
    expect(mockDb.application.update).not.toHaveBeenCalled()
  })

  it('sets hiredAt when moved to HIRED', async () => {
    mockDb.application.findFirst.mockResolvedValue(mockApplication)
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'HIRED', hiredAt: new Date() })

    await moveApplicationAction('app-001', 'HIRED')
    expect(mockDb.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ hiredAt: expect.any(Date) }) })
    )
  })

  it('sets rejectedAt when moved to REJECTED', async () => {
    mockDb.application.findFirst.mockResolvedValue(mockApplication)
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'REJECTED' })

    await moveApplicationAction('app-001', 'REJECTED')
    expect(mockDb.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rejectedAt: expect.any(Date) }) })
    )
  })

  it('clears hiredAt when moving back from HIRED', async () => {
    mockDb.application.findFirst.mockResolvedValue({ ...mockApplication, stage: 'HIRED', hiredAt: new Date() })
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'OFFER', hiredAt: null })

    await moveApplicationAction('app-001', 'OFFER')
    expect(mockDb.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ hiredAt: null }) })
    )
  })

  it('clears rejectedAt when moving back from REJECTED', async () => {
    mockDb.application.findFirst.mockResolvedValue({
      ...mockApplication,
      stage: 'REJECTED',
      rejectedAt: new Date(),
    })
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'INTERVIEW' })

    await moveApplicationAction('app-001', 'INTERVIEW')
    expect(mockDb.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rejectedAt: null }) })
    )
  })

  it('returns error when application not found', async () => {
    mockDb.application.findFirst.mockResolvedValue(null)
    const result = await moveApplicationAction('missing', 'SCREENING')
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Application not found.')
  })

  it('writes STAGE_CHANGED ActivityLog and AuditLog', async () => {
    mockDb.application.findFirst.mockResolvedValue(mockApplication)
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'SCREENING' })

    await moveApplicationAction('app-001', 'SCREENING')
    expect(mockDb.activityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'STAGE_CHANGED' }) })
    )
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })
})

// ─── rejectApplicationAction ──────────────────────────────────────────────────

describe('rejectApplicationAction', () => {
  it('moves application to REJECTED', async () => {
    mockDb.application.findFirst.mockResolvedValue(mockApplication)
    mockDb.application.update.mockResolvedValue({ ...mockApplication, stage: 'REJECTED' })

    const result = await rejectApplicationAction('app-001')
    expect(result.success).toBe(true)
    expect(mockDb.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stage: 'REJECTED' }) })
    )
  })
})

// ─── getPipelineJobsAction ────────────────────────────────────────────────────

describe('getPipelineJobsAction', () => {
  it('returns open/paused jobs with applications', async () => {
    mockDb.job.findMany.mockResolvedValue([{ id: 'job-001', title: 'Engineer', department: 'Eng' }])
    const result = await getPipelineJobsAction()
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveLength(1)
  })

  it('returns empty array when no qualifying jobs', async () => {
    mockDb.job.findMany.mockResolvedValue([])
    const result = await getPipelineJobsAction()
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveLength(0)
  })
})
