import { vi, describe, it, expect, beforeEach } from 'vitest'
import { UserRole } from '@prisma/client'

const { mockUser, mockDb } = vi.hoisted(() => {
  const mockUser = {
    id: 'user-001',
    name: 'Test Administrator',
    email: 'admin@test.com',
    role: 'SUPER_ADMIN' as const,
    organizationId: 'org-001',
  }

  const mockDb = {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
    invitation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    role: {
      findFirst: vi.fn(),
    },
    team: {
      findFirst: vi.fn(),
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

vi.mock('@/lib/plan-limits', () => ({
  checkUserLimit: () => Promise.resolve({ allowed: true, current: 0, max: 10 }),
}))

import { requirePermission } from '@/lib/auth-utils'
import {
  inviteUserAction,
  revokeInvitationAction,
  updateUserRoleAction,
  suspendUserAction,
  removeUserAction,
} from '@/server/actions/users'

const mockTargetUser = {
  id: 'user-002',
  name: 'Target User',
  email: 'target@test.com',
  role: 'VIEWER' as UserRole,
  organizationId: 'org-001',
  teamId: null,
  customRoleId: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.auditLog.create.mockResolvedValue({})
  mockDb.organization.findUnique.mockResolvedValue({ name: 'Test Org' })
})

describe('inviteUserAction', () => {
  it('creates invitation successfully', async () => {
    mockDb.user.findFirst.mockResolvedValue(null)
    mockDb.invitation.findFirst.mockResolvedValue(null)
    mockDb.invitation.create.mockResolvedValue({ id: 'invite-001', token: 'token-001' })

    const result = await inviteUserAction({ email: 'new@test.com', role: 'INTERVIEWER' })
    expect(result.success).toBe(true)
    expect(mockDb.invitation.create).toHaveBeenCalled()
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if user is already a member', async () => {
    mockDb.user.findFirst.mockResolvedValue(mockTargetUser)

    const result = await inviteUserAction({ email: 'target@test.com', role: 'INTERVIEWER' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('already a member')
  })
})

describe('revokeInvitationAction', () => {
  it('revokes invite successfully', async () => {
    mockDb.invitation.findFirst.mockResolvedValue({ id: 'invite-001', email: 'test@email.com' })
    mockDb.invitation.delete.mockResolvedValue({})

    const result = await revokeInvitationAction('invite-001')
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })
})

describe('updateUserRoleAction', () => {
  it('updates role and team successfully', async () => {
    mockDb.user.findFirst.mockResolvedValue(mockTargetUser)
    mockDb.user.update.mockResolvedValue({})
    mockDb.role.findFirst.mockResolvedValue({ id: 'custom-role-1' })
    mockDb.team.findFirst.mockResolvedValue({ id: 'team-1' })

    const result = await updateUserRoleAction('user-002', 'RECRUITER', 'custom-role-1', 'team-1')
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if modifying own role', async () => {
    const result = await updateUserRoleAction('user-001', 'VIEWER')
    expect(result.success).toBe(false)
  })
})

describe('suspendUserAction', () => {
  it('suspends user successfully', async () => {
    mockDb.user.findFirst.mockResolvedValue({ ...mockTargetUser, isActive: true })
    mockDb.user.update.mockResolvedValue({})

    const result = await suspendUserAction('user-002', true)
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })
})

describe('removeUserAction', () => {
  it('removes user from organization successfully', async () => {
    mockDb.user.findFirst.mockResolvedValue(mockTargetUser)
    mockDb.user.update.mockResolvedValue({})

    const result = await removeUserAction('user-002')
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })
})
