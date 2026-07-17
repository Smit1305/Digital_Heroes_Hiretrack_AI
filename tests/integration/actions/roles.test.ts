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
    role: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    permission: {
      count: vi.fn(),
    },
    rolePermission: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockDb)),
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
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from '@/server/actions/roles'

const mockRole = {
  id: 'role-001',
  name: 'Lead Interviewer',
  description: 'Interviewer lead role',
  organizationId: 'org-001',
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requirePermission).mockResolvedValue(mockUser)
  mockDb.auditLog.create.mockResolvedValue({})
})

describe('createRoleAction', () => {
  it('creates custom role successfully', async () => {
    mockDb.role.findUnique.mockResolvedValue(null)
    mockDb.permission.count.mockResolvedValue(2)
    mockDb.role.create.mockResolvedValue(mockRole)
    mockDb.rolePermission.createMany.mockResolvedValue({})

    const result = await createRoleAction({
      name: 'Lead Interviewer',
      description: 'Lead',
      permissionIds: ['p1', 'p2'],
    })

    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if select no permissions', async () => {
    const result = await createRoleAction({
      name: 'Lead',
      description: 'Lead',
      permissionIds: [], // too short validation error
    })
    expect(result.success).toBe(false)
  })
})

describe('updateRoleAction', () => {
  it('updates custom role successfully', async () => {
    mockDb.role.findFirst.mockResolvedValue(mockRole)
    mockDb.permission.count.mockResolvedValue(2)
    mockDb.role.update.mockResolvedValue({})
    mockDb.rolePermission.deleteMany.mockResolvedValue({})
    mockDb.rolePermission.createMany.mockResolvedValue({})

    const result = await updateRoleAction('role-001', {
      name: 'Lead Interviewer',
      description: 'Updated description',
      permissionIds: ['p1', 'p2'],
    })

    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if role is system role', async () => {
    mockDb.role.findFirst.mockResolvedValue({ ...mockRole, isSystem: true })

    const result = await updateRoleAction('role-001', {
      name: 'System Role',
      description: 'Cannot update',
      permissionIds: ['p1'],
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toContain('System roles cannot be modified')
  })
})

describe('deleteRoleAction', () => {
  it('deletes custom role successfully', async () => {
    mockDb.role.findFirst.mockResolvedValue(mockRole)
    mockDb.role.delete.mockResolvedValue({})

    const result = await deleteRoleAction('role-001')
    expect(result.success).toBe(true)
    expect(mockDb.auditLog.create).toHaveBeenCalled()
  })

  it('fails if role is system role', async () => {
    mockDb.role.findFirst.mockResolvedValue({ ...mockRole, isSystem: true })

    const result = await deleteRoleAction('role-001')
    expect(result.success).toBe(false)
  })
})
