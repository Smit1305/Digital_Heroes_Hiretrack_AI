/**
 * Integration tests for candidates server actions.
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
    candidate: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    note: { create: vi.fn(), findMany: vi.fn() },
    activityLog: { create: vi.fn(), findMany: vi.fn() },
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
  checkCandidateLimit: () => Promise.resolve({ allowed: true, current: 0, max: 100 }),
}))

import { requirePermission } from '@/lib/auth-utils'
import {
  addCandidateNoteAction,
  createCandidateAction,
  deleteCandidateAction,
  getCandidateAction,
  getCandidatesAction,
  updateCandidateAction,
  updateCandidateStatusAction,
} from '@/server/actions/candidates'

const mockCandidate = {
  id: 'cand-001',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: null,
  linkedin: null,
  portfolio: null,
  website: null,
  location: 'San Francisco',
  experience: 5,
  education: 'B.S. CS',
  skills: ['TypeScript', 'React'],
  notes: null,
  source: 'LinkedIn',
  status: 'ACTIVE',
  resumeUrl: null,
  organizationId: 'org-001',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.activityLog.create.mockResolvedValue({})
  mockDb.auditLog.create.mockResolvedValue({})
})

// ─── getCandidatesAction ──────────────────────────────────────────────────────

describe('getCandidatesAction', () => {
  it('returns paginated candidates', async () => {
    mockDb.candidate.count.mockResolvedValue(1)
    mockDb.candidate.findMany.mockResolvedValue([{ ...mockCandidate, applications: [] }])

    const result = await getCandidatesAction({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.data).toHaveLength(1)
    expect(result.data.pagination.total).toBe(1)
  })

  it('returns error when user has no org', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, organizationId: null })
    const result = await getCandidatesAction({})
    expect(result.success).toBe(false)
  })

  it('returns correct pagination metadata for multiple pages', async () => {
    mockDb.candidate.count.mockResolvedValue(36)
    mockDb.candidate.findMany.mockResolvedValue(Array(18).fill({ ...mockCandidate, applications: [] }))
    const result = await getCandidatesAction({ page: 1, pageSize: 18 })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.pagination.totalPages).toBe(2)
    expect(result.data.pagination.hasNextPage).toBe(true)
    expect(result.data.pagination.hasPrevPage).toBe(false)
  })

  it('returns error for invalid pageSize', async () => {
    const result = await getCandidatesAction({ pageSize: 999 as unknown as number })
    expect(result.success).toBe(false)
  })
})

// ─── getCandidateAction ───────────────────────────────────────────────────────

describe('getCandidateAction', () => {
  it('returns candidate when found', async () => {
    mockDb.candidate.findFirst.mockResolvedValue({ ...mockCandidate, applications: [] })
    const result = await getCandidateAction('cand-001')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('cand-001')
  })

  it('returns error when not found', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(null)
    const result = await getCandidateAction('missing')
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Candidate not found.')
  })
})

// ─── createCandidateAction ────────────────────────────────────────────────────

describe('createCandidateAction', () => {
  it('creates a candidate successfully', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(null)
    mockDb.candidate.create.mockResolvedValue({ ...mockCandidate, id: 'cand-new' })

    const result = await createCandidateAction({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      skills: [],
      status: 'ACTIVE'
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('cand-new')
    expect(mockDb.activityLog.create).toHaveBeenCalled()
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('rejects duplicate email within org', async () => {
    mockDb.candidate.findFirst.mockResolvedValue({ id: 'existing-001' })

    const result = await createCandidateAction({
      firstName: 'John',
      lastName: 'Doe',
      email: 'jane@example.com',
      skills: [],
      status: 'ACTIVE'
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('email already exists')
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it('returns fieldErrors for missing firstName', async () => {
    const result = await createCandidateAction({
      firstName: '', lastName: 'Doe', email: 'v@e.com',
      skills: [],
      status: 'ACTIVE'
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.firstName).toBeDefined()
  })

  it('returns fieldErrors for invalid email', async () => {
    const result = await createCandidateAction({
      firstName: 'J', lastName: 'D', email: 'bad',
      skills: [],
      status: 'ACTIVE'
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it('sanitises empty URL fields to null', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(null)
    mockDb.candidate.create.mockResolvedValue({ ...mockCandidate, linkedin: null })

    await createCandidateAction({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john2@example.com',
      linkedin: '',
      portfolio: '',
      skills: [],
      status: 'ACTIVE'
    })

    expect(mockDb.candidate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ linkedin: null, portfolio: null }),
      })
    )
  })
})

// ─── updateCandidateAction ────────────────────────────────────────────────────

describe('updateCandidateAction', () => {
  it('updates an existing candidate', async () => {
    // First call: candidate exists check; second call: email dup check returns null (no dup)
    mockDb.candidate.findFirst
      .mockResolvedValueOnce(mockCandidate)
      .mockResolvedValueOnce(null)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, firstName: 'Janet' })

    const result = await updateCandidateAction('cand-001', { firstName: 'Janet' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.firstName).toBe('Janet')
  })

  it('returns error when candidate not found', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(null)
    const result = await updateCandidateAction('missing', { firstName: 'X' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Candidate not found.')
  })

  it('rejects email change to a duplicate', async () => {
    // First call: candidate exists; second call: dup email found
    mockDb.candidate.findFirst
      .mockResolvedValueOnce(mockCandidate)
      .mockResolvedValueOnce({ id: 'other-001' })

    const result = await updateCandidateAction('cand-001', { email: 'taken@example.com' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it('logs activity and audit on update', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, location: 'NYC' })

    await updateCandidateAction('cand-001', { location: 'NYC' })
    expect(mockDb.activityLog.create).toHaveBeenCalled()
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })
})

// ─── deleteCandidateAction ────────────────────────────────────────────────────

describe('deleteCandidateAction', () => {
  it('soft-deletes a candidate', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, role: 'SUPER_ADMIN' })
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, deletedAt: new Date() })
    mockDb.activityLog.create.mockResolvedValue({})
    mockDb.auditLog.create.mockResolvedValue({})

    const result = await deleteCandidateAction('cand-001')
    expect(result.success).toBe(true)
    expect(mockDb.candidate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    )
  })

  it('returns error for non-existent candidate', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, role: 'SUPER_ADMIN' })
    mockDb.candidate.findFirst.mockResolvedValue(null)
    const result = await deleteCandidateAction('missing')
    expect(result.success).toBe(false)
  })

  it('writes activity and audit log on delete', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({ ...mockUser, role: 'SUPER_ADMIN' })
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, deletedAt: new Date() })
    mockDb.activityLog.create.mockResolvedValue({})
    mockDb.auditLog.create.mockResolvedValue({})

    await deleteCandidateAction('cand-001')
    expect(mockDb.activityLog.create).toHaveBeenCalled()
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })
})

// ─── updateCandidateStatusAction ──────────────────────────────────────────────

describe('updateCandidateStatusAction', () => {
  it('updates status to INACTIVE', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, status: 'INACTIVE' })

    const result = await updateCandidateStatusAction('cand-001', 'INACTIVE')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.status).toBe('INACTIVE')
  })

  it('updates status to BLACKLISTED', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, status: 'BLACKLISTED' })
    const result = await updateCandidateStatusAction('cand-001', 'BLACKLISTED')
    expect(result.success).toBe(true)
  })

  it('returns error when candidate not found', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(null)
    const result = await updateCandidateStatusAction('missing', 'ACTIVE')
    expect(result.success).toBe(false)
  })

  it('logs STATUS_CHANGED activity', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.candidate.update.mockResolvedValue({ ...mockCandidate, status: 'INACTIVE' })
    await updateCandidateStatusAction('cand-001', 'INACTIVE')
    expect(mockDb.activityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'STATUS_CHANGED' }) })
    )
  })
})

// ─── addCandidateNoteAction ───────────────────────────────────────────────────

describe('addCandidateNoteAction', () => {
  it('adds a note to a candidate', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    mockDb.note.create.mockResolvedValue({ id: 'note-001' })

    const result = await addCandidateNoteAction('cand-001', 'Great technical skills.')
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('note-001')
  })

  it('rejects empty note content', async () => {
    const result = await addCandidateNoteAction('cand-001', '   ')
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Note content is required.')
  })

  it('rejects note longer than 5000 characters', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(mockCandidate)
    const result = await addCandidateNoteAction('cand-001', 'A'.repeat(5001))
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('Note is too long.')
  })

  it('returns error when candidate not found', async () => {
    mockDb.candidate.findFirst.mockResolvedValue(null)
    const result = await addCandidateNoteAction('missing', 'Some note.')
    expect(result.success).toBe(false)
  })
})
