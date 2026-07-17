/**
 * Integration tests for jobs server actions.
 * Uses vi.hoisted() so mock factories can safely reference shared test data.
 */
import { vi } from 'vitest'
// ─── Hoisted shared data (available inside vi.mock factories) ─────────────────
const { mockUser, mockDb } = vi.hoisted(() => {
  const mockUser = {
    id: 'user-001',
    name: 'Test Recruiter',
    email: 'recruiter@test.com',
    role: 'RECRUITER' as const,
    organizationId: 'org-001',
  }

  const mockDb = {
    job: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: { findFirst: vi.fn() },
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

vi.mock('@/lib/plan-limits', () => ({
  checkJobLimit: () => Promise.resolve({ allowed: true, current: 0, max: 10 }),
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────
import { requirePermission } from '@/lib/auth-utils'
import {
    archiveJobAction,
    createJobAction,
    deleteJobAction,
    getJobAction,
    getJobsAction,
    updateJobAction,
} from '@/server/actions/jobs'

const mockJob = {
  id: 'job-001',
  title: 'Senior Engineer',
  description: 'An experienced engineer.',
  status: 'DRAFT',
  organizationId: 'org-001',
  department: 'Engineering',
  location: 'Remote',
  employmentType: 'FULL_TIME',
  isRemote: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  publishedAt: null,
  closedAt: null,
  createdById: 'user-001',
  hiringManagerId: null,
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: 'USD',
  requirements: null,
  benefits: null,
  experienceLevel: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.activityLog.create.mockResolvedValue({})
  mockDb.auditLog.create.mockResolvedValue({})
})

// ─── getJobsAction ────────────────────────────────────────────────────────────

describe('getJobsAction', () => {
  it('returns paginated jobs', async () => {
    mockDb.job.count.mockResolvedValue(1)
    mockDb.job.findMany.mockResolvedValue([mockJob])

    const result = await getJobsAction({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.data).toHaveLength(1)
    expect(result.data.pagination.total).toBe(1)
  })

  it('returns error when user has no org', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, organizationId: null })
    const result = await getJobsAction({})
    expect(result.success).toBe(false)
  })

  it('returns error for invalid filters (pageSize > 100)', async () => {
    const result = await getJobsAction({ pageSize: 999 as unknown as number })
    expect(result.success).toBe(false)
  })

  it('returns correct pagination metadata', async () => {
    mockDb.job.count.mockResolvedValue(36)
    mockDb.job.findMany.mockResolvedValue(Array(18).fill(mockJob))
    const result = await getJobsAction({ page: 1, pageSize: 18 })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.pagination.totalPages).toBe(2)
    expect(result.data.pagination.hasNextPage).toBe(true)
  })
})

// ─── getJobAction ─────────────────────────────────────────────────────────────

describe('getJobAction', () => {
  it('returns job when found', async () => {
    mockDb.job.findFirst.mockResolvedValue(mockJob)
    const result = await getJobAction('job-001')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('job-001')
  })

  it('returns error when job not found', async () => {
    mockDb.job.findFirst.mockResolvedValue(null)
    const result = await getJobAction('not-found')
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Job not found.')
  })
})

// ─── createJobAction ──────────────────────────────────────────────────────────

describe('createJobAction', () => {
  it('creates a job and returns it', async () => {
    mockDb.user.findFirst.mockResolvedValue(null)
    mockDb.job.create.mockResolvedValue({ ...mockJob, id: 'job-new' })

    const result = await createJobAction({
      title: 'Backend Engineer',
      description: 'We need a backend developer with 3+ years of experience.',
      employmentType: 'FULL_TIME',
      status: 'DRAFT',
      isRemote: false,
      salaryCurrency: 'USD',
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('job-new')
    expect(mockDb.activityLog.create).toHaveBeenCalled()
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('returns fieldErrors for title too short', async () => {
    const result = await createJobAction({
      title: 'A',
      description: 'Valid description here.',
      employmentType: 'FULL_TIME',
      status: 'DRAFT',
      isRemote: false,
      salaryCurrency: 'USD',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns fieldErrors for description too short', async () => {
    const result = await createJobAction({
      title: 'Valid Title',
      description: 'Short',
      employmentType: 'FULL_TIME',
      status: 'DRAFT',
      isRemote: false,
      salaryCurrency: 'USD',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.description).toBeDefined()
  })

  it('returns error when hiring manager not in org', async () => {
    mockDb.user.findFirst.mockResolvedValue(null)
    mockDb.job.create.mockResolvedValue(mockJob)

    const result = await createJobAction({
      title: 'Frontend Engineer',
      description: 'We need a great frontend developer with React expertise.',
      employmentType: 'FULL_TIME',
      status: 'DRAFT',
      isRemote: false,
      salaryCurrency: 'USD',
      hiringManagerId: 'clxxxxxxxxxxxxxxxxxxxxxxx',
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Invalid hiring manager.')
  })
})

// ─── updateJobAction ──────────────────────────────────────────────────────────

describe('updateJobAction', () => {
  it('updates a job', async () => {
    mockDb.job.findFirst.mockResolvedValue(mockJob)
    mockDb.job.update.mockResolvedValue({ ...mockJob, title: 'Updated Title' })

    const result = await updateJobAction('job-001', { title: 'Updated Title' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.title).toBe('Updated Title')
  })

  it('returns error for non-existent job', async () => {
    mockDb.job.findFirst.mockResolvedValue(null)
    const result = await updateJobAction('nonexistent', { title: 'Title' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Job not found.')
  })

  it('sets publishedAt when status changes from DRAFT to OPEN', async () => {
    mockDb.job.findFirst.mockResolvedValue({ ...mockJob, status: 'DRAFT' })
    mockDb.job.update.mockResolvedValue({ ...mockJob, status: 'OPEN', publishedAt: new Date() })

    await updateJobAction('job-001', { status: 'OPEN' })

    expect(mockDb.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ publishedAt: expect.any(Date) }),
      })
    )
  })
})

// ─── deleteJobAction ──────────────────────────────────────────────────────────

describe('deleteJobAction', () => {
  it('soft-deletes a job', async () => {
    mockDb.job.findFirst.mockResolvedValue({ ...mockJob, _count: { applications: 0 } })
    mockDb.job.update.mockResolvedValue({ ...mockJob, deletedAt: new Date() })

    const result = await deleteJobAction('job-001')
    expect(result.success).toBe(true)
    expect(mockDb.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    )
  })

  it('returns error for non-existent job', async () => {
    mockDb.job.findFirst.mockResolvedValue(null)
    const result = await deleteJobAction('nonexistent')
    expect(result.success).toBe(false)
  })
})

// ─── archiveJobAction ─────────────────────────────────────────────────────────

describe('archiveJobAction', () => {
  it('archives an open job', async () => {
    mockDb.job.findFirst.mockResolvedValue({ ...mockJob, status: 'OPEN' })
    mockDb.job.update.mockResolvedValue({ ...mockJob, status: 'ARCHIVED', closedAt: new Date() })

    const result = await archiveJobAction('job-001')
    expect(result.success).toBe(true)
    expect(mockDb.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ARCHIVED', closedAt: expect.any(Date) }),
      })
    )
  })

  it('returns error when already archived', async () => {
    mockDb.job.findFirst.mockResolvedValue({ ...mockJob, status: 'ARCHIVED' })
    const result = await archiveJobAction('job-001')
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Job is already archived.')
  })

  it('returns error for non-existent job', async () => {
    mockDb.job.findFirst.mockResolvedValue(null)
    const result = await archiveJobAction('nonexistent')
    expect(result.success).toBe(false)
  })
})
