import { vi, describe, it, expect, beforeEach } from 'vitest'

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
      findFirst: vi.fn(),
    },
    candidate: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    application: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    offer: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    note: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  }
  return { mockUser, mockDb }
})

vi.mock('@/lib/auth-utils', () => ({
  requirePermission: vi.fn().mockResolvedValue(mockUser),
  requireAuth: vi.fn().mockResolvedValue(mockUser),
}))

vi.mock('@/lib/db', () => ({ db: mockDb }))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

import { requirePermission } from '@/lib/auth-utils'
import { sendEmail } from '@/lib/email'
import {
  publicApplyAction,
  createOfferAction,
  getOfferAction,
  updateOfferStatusAction,
} from '@/server/actions/applications'

const mockJob = {
  id: 'job-001',
  title: 'Staff Developer',
  organizationId: 'org-001',
  organization: {
    name: 'Test Org',
    slug: 'test-org',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  vi.mocked(sendEmail).mockResolvedValue(undefined)
  mockDb.$transaction.mockImplementation(async (ops: unknown) => {
    if (typeof ops === 'function') return ops(mockDb)
    if (Array.isArray(ops)) return Promise.all(ops)
    return ops
  })
})

describe('publicApplyAction', () => {
  it('applies to a job successfully for a new candidate', async () => {
    mockDb.job.findFirst.mockResolvedValue(mockJob)
    mockDb.candidate.findFirst.mockResolvedValue(null)
    mockDb.candidate.create.mockResolvedValue({ id: 'cand-001' })
    mockDb.application.findFirst.mockResolvedValue(null)
    mockDb.application.create.mockResolvedValue({ id: 'app-001' })

    const result = await publicApplyAction('job-001', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: '',
      coverLetter: 'Interested in this staff role.',
      resumeUrl: 'uploads/resume.pdf',
      resumeFileName: 'resume.pdf',
    })

    expect(result.success).toBe(true)
    expect(mockDb.candidate.create).toHaveBeenCalled()
    expect(mockDb.application.create).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalled()
  })

  it('rejects duplicate applications', async () => {
    mockDb.job.findFirst.mockResolvedValue(mockJob)
    mockDb.candidate.findFirst.mockResolvedValue({ id: 'cand-001' })
    mockDb.application.findFirst.mockResolvedValue({ id: 'app-existing' })

    const result = await publicApplyAction('job-001', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '',
      linkedin: '',
      portfolio: '',
      coverLetter: '',
      resumeUrl: 'uploads/resume.pdf',
      resumeFileName: 'resume.pdf',
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('already applied')
  })
})

describe('createOfferAction', () => {
  it('creates an offer successfully and shifts application stage to OFFER', async () => {
    const mockApp = {
      id: 'app-001',
      candidateId: 'cand-001',
      jobId: 'job-001',
      job: { title: 'Staff Developer' },
      candidate: { firstName: 'Jane', lastName: 'Doe' },
    }
    mockDb.application.findFirst.mockResolvedValue(mockApp)
    mockDb.offer.upsert.mockResolvedValue({ id: 'offer-001' })

    const result = await createOfferAction('app-001', {
      salary: 120000,
      currency: 'USD',
      startDate: new Date('2026-09-01'),
      notes: 'Sign-on bonus $5,000.',
    })

    expect(result.success).toBe(true)
    expect(mockDb.offer.upsert).toHaveBeenCalled()
    expect(mockDb.application.update).toHaveBeenCalledWith({
      where: { id: 'app-001' },
      data: { stage: 'OFFER' },
    })
  })
})

describe('updateOfferStatusAction', () => {
  const mockOffer = {
    id: 'offer-001',
    status: 'PENDING',
    application: {
      id: 'app-001',
      candidateId: 'cand-001',
      jobId: 'job-001',
      job: { title: 'Staff Developer', organizationId: 'org-001', organization: { name: 'Test Org' } },
      candidate: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
    },
  }

  it('updates stage to HIRED when offer is accepted', async () => {
    mockDb.offer.findUnique.mockResolvedValue(mockOffer)

    const result = await updateOfferStatusAction('app-001', 'ACCEPTED')

    expect(result.success).toBe(true)
    expect(mockDb.offer.update).toHaveBeenCalledWith({
      where: { applicationId: 'app-001' },
      data: { status: 'ACCEPTED' },
    })
    expect(mockDb.application.update).toHaveBeenCalledWith({
      where: { id: 'app-001' },
      data: expect.objectContaining({
        stage: 'HIRED',
      }),
    })
  })

  it('updates stage to REJECTED when offer is declined', async () => {
    mockDb.offer.findUnique.mockResolvedValue(mockOffer)

    const result = await updateOfferStatusAction('app-001', 'REJECTED_BY_CANDIDATE')

    expect(result.success).toBe(true)
    expect(mockDb.offer.update).toHaveBeenCalledWith({
      where: { applicationId: 'app-001' },
      data: { status: 'REJECTED_BY_CANDIDATE' },
    })
    expect(mockDb.application.update).toHaveBeenCalledWith({
      where: { id: 'app-001' },
      data: expect.objectContaining({
        stage: 'REJECTED',
      }),
    })
  })
})
