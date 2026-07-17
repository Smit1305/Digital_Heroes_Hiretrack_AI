/**
 * Integration tests for interviews server actions.
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
    interview: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    application: { findFirst: vi.fn() },
    user: { findFirst: vi.fn(), findMany: vi.fn() },
    activityLog: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    notification: { create: vi.fn() },
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
  cancelInterviewAction,
  createInterviewAction,
  deleteInterviewAction,
  getInterviewsAction,
  markNoShowAction,
  submitFeedbackAction,
  updateInterviewAction,
} from '@/server/actions/interviews'

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24)

const mockInterview = {
  id: 'int-001',
  candidateId: 'cand-001',
  applicationId: 'app-001',
  interviewerId: 'user-002',
  scheduledAt: futureDate,
  duration: 60,
  type: 'VIDEO',
  status: 'SCHEDULED',
  candidate: { firstName: 'Jane', lastName: 'Doe' },
  application: { jobId: 'job-001', job: { title: 'Staff Developer' } },
  feedback: null,
  rating: null,
  notes: null,
  location: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.activityLog.create.mockResolvedValue({})
  mockDb.auditLog.create.mockResolvedValue({})
})

// ─── getInterviewsAction ──────────────────────────────────────────────────────

describe('getInterviewsAction', () => {
  it('returns paginated interviews', async () => {
    mockDb.interview.count.mockResolvedValue(1)
    mockDb.interview.findMany.mockResolvedValue([mockInterview])
    const result = await getInterviewsAction({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.data).toHaveLength(1)
    expect(result.data.pagination.total).toBe(1)
  })

  it('returns error when user has no org', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, organizationId: null })
    const result = await getInterviewsAction({})
    expect(result.success).toBe(false)
  })

  it('returns empty data when no interviews', async () => {
    mockDb.interview.count.mockResolvedValue(0)
    mockDb.interview.findMany.mockResolvedValue([])
    const result = await getInterviewsAction({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.data).toHaveLength(0)
  })
})

// ─── createInterviewAction ────────────────────────────────────────────────────

describe('createInterviewAction', () => {
  const validInput = {
    candidateId: 'clxxxxxxxxxxxxxxxxxxxxxxa',
    applicationId: 'clxxxxxxxxxxxxxxxxxxxxxxb',
    interviewerId: 'clxxxxxxxxxxxxxxxxxxxxxxc',
    scheduledAt: futureDate,
    duration: 60,
    type: 'VIDEO' as const,
  }

  it('creates an interview successfully', async () => {
    mockDb.application.findFirst.mockResolvedValue({
      id: 'clxxxxxxxxxxxxxxxxxxxxxxb',
      jobId: 'job-001',
      job: { title: 'Engineer' },
      candidate: { firstName: 'Jane', lastName: 'Doe' },
    })
    mockDb.user.findFirst.mockResolvedValue({ id: 'clxxxxxxxxxxxxxxxxxxxxxxc', name: 'Dr. Lee' })
    mockDb.interview.create.mockResolvedValue({ ...mockInterview, id: 'int-new' })

    const result = await createInterviewAction(validInput)
    expect(result.success).toBe(true)
    expect(mockDb.activityLog.create).toHaveBeenCalled()
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('returns error when application not found in org', async () => {
    mockDb.application.findFirst.mockResolvedValue(null)
    const result = await createInterviewAction(validInput)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Application not found.')
  })

  it('returns error when interviewer not in org', async () => {
    mockDb.application.findFirst.mockResolvedValue({
      id: 'clxxxxxxxxxxxxxxxxxxxxxxb',
      jobId: 'job-001',
      job: { title: 'Engineer' },
    })
    mockDb.user.findFirst.mockResolvedValue(null)
    const result = await createInterviewAction(validInput)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('Interviewer not found')
  })

  it('rejects scheduling in the past', async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60)
    const result = await createInterviewAction({ ...validInput, scheduledAt: pastDate })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.scheduledAt).toBeDefined()
  })

  it('returns fieldErrors for invalid candidateId format', async () => {
    const result = await createInterviewAction({ ...validInput, candidateId: 'not-a-cuid' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.candidateId).toBeDefined()
  })
})

// ─── updateInterviewAction ────────────────────────────────────────────────────

describe('updateInterviewAction', () => {
  it('updates an interview', async () => {
    mockDb.interview.findFirst.mockResolvedValue(mockInterview)
    mockDb.interview.update.mockResolvedValue({ ...mockInterview, notes: 'Focus on system design.' })
    const result = await updateInterviewAction('int-001', { notes: 'Focus on system design.' })
    expect(result.success).toBe(true)
  })

  it('returns error when interview not found', async () => {
    mockDb.interview.findFirst.mockResolvedValue(null)
    const result = await updateInterviewAction('missing', { notes: 'notes' })
    expect(result.success).toBe(false)
  })
})

// ─── cancelInterviewAction ────────────────────────────────────────────────────

describe('cancelInterviewAction', () => {
  it('cancels a scheduled interview', async () => {
    mockDb.interview.findFirst.mockResolvedValue({ ...mockInterview, status: 'SCHEDULED' })
    mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'CANCELLED' })

    const result = await cancelInterviewAction('int-001')
    expect(result.success).toBe(true)
    expect(mockDb.interview.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'CANCELLED' }) })
    )
  })

  it('returns error when interview already cancelled', async () => {
    mockDb.interview.findFirst.mockResolvedValue({ ...mockInterview, status: 'CANCELLED' })
    const result = await cancelInterviewAction('int-001')
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('already cancelled')
  })

  it('returns error when interview not found', async () => {
    mockDb.interview.findFirst.mockResolvedValue(null)
    const result = await cancelInterviewAction('missing')
    expect(result.success).toBe(false)
  })
})

// ─── markNoShowAction ─────────────────────────────────────────────────────────

describe('markNoShowAction', () => {
  it('marks a scheduled interview as no-show', async () => {
    mockDb.interview.findFirst.mockResolvedValue({ ...mockInterview, status: 'SCHEDULED' })
    mockDb.interview.update.mockResolvedValue({ ...mockInterview, status: 'NO_SHOW' })

    const result = await markNoShowAction('int-001')
    expect(result.success).toBe(true)
    expect(mockDb.interview.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'NO_SHOW' }) })
    )
  })

  it('rejects marking a completed interview as no-show', async () => {
    mockDb.interview.findFirst.mockResolvedValue({ ...mockInterview, status: 'COMPLETED' })
    const result = await markNoShowAction('int-001')
    expect(result.success).toBe(false)
  })

  it('returns error when not found', async () => {
    mockDb.interview.findFirst.mockResolvedValue(null)
    const result = await markNoShowAction('missing')
    expect(result.success).toBe(false)
  })
})

// ─── submitFeedbackAction ─────────────────────────────────────────────────────

describe('submitFeedbackAction', () => {
  it('submits feedback and marks interview completed', async () => {
    mockDb.interview.findFirst.mockResolvedValue({ ...mockInterview, status: 'SCHEDULED' })
    mockDb.interview.update.mockResolvedValue({
      ...mockInterview,
      status: 'COMPLETED',
      feedback: 'Excellent.',
      rating: 5,
    })

    const result = await submitFeedbackAction('int-001', 'Excellent candidate.', 5)
    expect(result.success).toBe(true)
    expect(mockDb.interview.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED', rating: 5 }) })
    )
  })

  it('rejects rating above 5', async () => {
    const result = await submitFeedbackAction('int-001', 'OK', 6)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('Rating must be between 1 and 5')
  })

  it('rejects rating below 1', async () => {
    const result = await submitFeedbackAction('int-001', 'OK', 0)
    expect(result.success).toBe(false)
  })

  it('rejects empty feedback', async () => {
    const result = await submitFeedbackAction('int-001', '   ', 4)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Feedback is required.')
  })

  it('returns error when interview not found', async () => {
    mockDb.interview.findFirst.mockResolvedValue(null)
    const result = await submitFeedbackAction('missing', 'OK', 4)
    expect(result.success).toBe(false)
  })
})

// ─── deleteInterviewAction ────────────────────────────────────────────────────

describe('deleteInterviewAction', () => {
  it('hard-deletes an interview (SUPER_ADMIN)', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, role: 'SUPER_ADMIN' })
    mockDb.interview.findFirst.mockResolvedValue(mockInterview)
    mockDb.interview.delete.mockResolvedValue(mockInterview)

    const result = await deleteInterviewAction('int-001')
    expect(result.success).toBe(true)
    expect(mockDb.interview.delete).toHaveBeenCalled()
  })

  it('returns error when interview not found', async () => {
    mockDb.interview.findFirst.mockResolvedValue(null)
    const result = await deleteInterviewAction('missing')
    expect(result.success).toBe(false)
  })
})
