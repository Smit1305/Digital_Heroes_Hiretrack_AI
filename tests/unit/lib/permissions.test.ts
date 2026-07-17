import {
    getRolePermissions,
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
    isAdminRole,
    ROLE_PERMISSIONS,
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

describe('hasPermission', () => {
  it('SUPER_ADMIN has all permissions', () => {
    const allPerms = ROLE_PERMISSIONS.SUPER_ADMIN
    for (const perm of allPerms) {
      expect(hasPermission('SUPER_ADMIN', perm)).toBe(true)
    }
  })

  it('VIEWER can only read', () => {
    expect(hasPermission('VIEWER', 'jobs:read')).toBe(true)
    expect(hasPermission('VIEWER', 'jobs:create')).toBe(false)
    expect(hasPermission('VIEWER', 'jobs:delete')).toBe(false)
    expect(hasPermission('VIEWER', 'candidates:create')).toBe(false)
    expect(hasPermission('VIEWER', 'users:manage')).toBe(false)
  })

  it('RECRUITER can create and manage candidates', () => {
    expect(hasPermission('RECRUITER', 'candidates:create')).toBe(true)
    expect(hasPermission('RECRUITER', 'candidates:update')).toBe(true)
    expect(hasPermission('RECRUITER', 'jobs:create')).toBe(true)
    expect(hasPermission('RECRUITER', 'users:manage')).toBe(false)
  })

  it('HIRING_MANAGER can read and move applications but not create jobs', () => {
    expect(hasPermission('HIRING_MANAGER', 'applications:move')).toBe(true)
    expect(hasPermission('HIRING_MANAGER', 'jobs:create')).toBe(false)
    expect(hasPermission('HIRING_MANAGER', 'users:manage')).toBe(false)
  })

  it('INTERVIEWER can submit feedback but not create jobs', () => {
    expect(hasPermission('INTERVIEWER', 'interviews:feedback')).toBe(true)
    expect(hasPermission('INTERVIEWER', 'jobs:create')).toBe(false)
    expect(hasPermission('INTERVIEWER', 'candidates:create')).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(hasPermission('UNKNOWN_ROLE' as UserRole, 'jobs:read')).toBe(false)
  })
})

describe('hasAllPermissions', () => {
  it('returns true when role has all specified permissions', () => {
    expect(hasAllPermissions('RECRUITER', ['jobs:create', 'candidates:create'])).toBe(true)
  })

  it('returns false when role is missing any permission', () => {
    expect(hasAllPermissions('RECRUITER', ['jobs:create', 'users:manage'])).toBe(false)
  })

  it('returns true for empty array', () => {
    expect(hasAllPermissions('VIEWER', [])).toBe(true)
  })
})

describe('hasAnyPermission', () => {
  it('returns true when role has at least one permission', () => {
    expect(hasAnyPermission('VIEWER', ['jobs:create', 'jobs:read'])).toBe(true)
  })

  it('returns false when role has none of the permissions', () => {
    expect(hasAnyPermission('VIEWER', ['jobs:create', 'candidates:create'])).toBe(false)
  })
})

describe('getRolePermissions', () => {
  it('returns correct permissions list for a role', () => {
    const perms = getRolePermissions('VIEWER')
    expect(perms).toContain('jobs:read')
    expect(perms).not.toContain('jobs:create')
  })

  it('returns empty array for unknown role', () => {
    expect(getRolePermissions('UNKNOWN' as UserRole)).toEqual([])
  })
})

describe('isAdminRole', () => {
  it('returns true for SUPER_ADMIN', () => {
    expect(isAdminRole('SUPER_ADMIN')).toBe(true)
  })

  it('returns false for all other roles', () => {
    const roles: UserRole[] = ['RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']
    for (const role of roles) {
      expect(isAdminRole(role)).toBe(false)
    }
  })
})

describe('hasPermission with custom userPermissions', () => {
  it('uses custom permissions when provided', () => {
    // VIEWER normally can't create jobs, but custom permissions override
    expect(hasPermission('VIEWER', 'jobs:create', ['jobs:create', 'jobs:read'])).toBe(true)
  })

  it('denies when custom permissions list does not include the permission', () => {
    expect(hasPermission('SUPER_ADMIN', 'users:manage', ['jobs:read'])).toBe(false)
  })

  it('falls back to role-based when userPermissions is undefined', () => {
    expect(hasPermission('SUPER_ADMIN', 'users:manage', undefined)).toBe(true)
  })
})

