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
    scorecard: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    interview: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((promises) => Promise.all(promises)),
  }

  return { mockUser, mockDb }
})

vi.mock('@/lib/auth-utils', () => ({
  requirePermission: vi.fn().mockResolvedValue(mockUser),
  requireAuth: vi.fn().mockResolvedValue(mockUser),
}))

vi.mock('@/lib/db', () => ({ db: mockDb }))

import { requirePermission } from '@/lib/auth-utils'
import { submitScorecardAction, getScorecardAction } from '@/server/actions/interviews'

const mockInterview = {
  id: 'interview-001',
  candidateId: 'cand-001',
  applicationId: 'app-001',
  interviewerId: 'user-001',
  type: 'CODING',
  candidate: { firstName: 'John', lastName: 'Doe' },
  application: { jobId: 'job-001', job: { title: 'Engineer' } },
}

const mockScorecard = {
  id: 'scorecard-001',
  interviewId: 'interview-001',
  recommendation: 'STRONG_HIRE',
  summary: 'Excellent coding skills.',
  strengths: 'Algorithms, speed',
  weaknesses: 'Documentation',
  ratings: { 'Problem Solving': 5, 'Code Quality': 4 },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.interview.findFirst.mockResolvedValue(mockInterview)
  mockDb.scorecard.upsert.mockResolvedValue(mockScorecard)
  mockDb.interview.update.mockResolvedValue({})
  mockDb.notification.create.mockResolvedValue({})
  mockDb.activityLog.create.mockResolvedValue({})
})

describe('submitScorecardAction', () => {
  it('submits scorecard successfully and calculates overall rating', async () => {
    const input = {
      recommendation: 'STRONG_HIRE' as const,
      summary: 'Excellent candidate overall.',
      strengths: 'Fast algorithms implementation',
      weaknesses: 'A bit quiet',
      ratings: { 'Problem Solving': 5, 'Algorithms': 4, 'Code Quality': 5 },
    }

    const result = await submitScorecardAction('interview-001', input)
    
    expect(result.success).toBe(true)
    expect(mockDb.scorecard.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { interviewId: 'interview-001' },
      create: expect.objectContaining({
        recommendation: 'STRONG_HIRE',
        summary: 'Excellent candidate overall.',
      }),
    }))

    // Verification of rating math: (5 + 4 + 5) / 3 = 14/3 = 4.66 -> rounded to 5
    expect(mockDb.interview.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'interview-001' },
      data: expect.objectContaining({
        status: 'COMPLETED',
        rating: 5,
      }),
    }))
  })

  it('fails when schema validation fails', async () => {
    const input = {
      recommendation: 'STRONG_HIRE' as const,
      summary: 'A', // too short, validation fails
      strengths: 'Algorithms',
      weaknesses: 'None',
      ratings: {},
    }

    const result = await submitScorecardAction('interview-001', input)
    expect(result.success).toBe(false)
    expect(mockDb.scorecard.upsert).not.toHaveBeenCalled()
  })

  it('fails if interview is not found or does not belong to organization', async () => {
    mockDb.interview.findFirst.mockResolvedValueOnce(null)
    const input = {
      recommendation: 'HIRE' as const,
      summary: 'Good coder.',
      strengths: 'Skills',
      weaknesses: 'Formatting',
      ratings: { 'Problem Solving': 4 },
    }

    const result = await submitScorecardAction('interview-001', input)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Interview not found.')
  })
})

describe('getScorecardAction', () => {
  it('returns scorecard for correct interview', async () => {
    mockDb.scorecard.findUnique.mockResolvedValueOnce(mockScorecard)
    const result = await getScorecardAction('interview-001')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toEqual(mockScorecard)
  })
})
