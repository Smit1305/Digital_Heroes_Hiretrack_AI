import {
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
    isAdminRole,
    ROLE_LABELS,
    ROLE_PERMISSIONS,
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

// ─── Permission completeness ──────────────────────────────────────────────────

describe('ROLE_PERMISSIONS map', () => {
  it('defines permissions for all five roles', () => {
    const expectedRoles: UserRole[] = [
      'SUPER_ADMIN',
      'RECRUITER',
      'HIRING_MANAGER',
      'INTERVIEWER',
      'VIEWER',
    ]
    for (const role of expectedRoles) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined()
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true)
    }
  })

  it('SUPER_ADMIN has the most permissions', () => {
    const adminCount = ROLE_PERMISSIONS.SUPER_ADMIN.length
    const recruiterCount = ROLE_PERMISSIONS.RECRUITER.length
    expect(adminCount).toBeGreaterThan(recruiterCount)
  })

  it('VIEWER has the fewest permissions', () => {
    const roles: UserRole[] = ['RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER']
    const viewerCount = ROLE_PERMISSIONS.VIEWER.length
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(viewerCount)
    }
  })

  it('VIEWER only has read permissions', () => {
    const viewerPerms = ROLE_PERMISSIONS.VIEWER
    for (const perm of viewerPerms) {
      expect(perm).toMatch(/:read$/)
    }
  })

  it('SUPER_ADMIN has users:manage permission', () => {
    expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain('users:manage')
  })

  it('SUPER_ADMIN has organization:manage permission', () => {
    expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain('organization:manage')
  })

  it('no other role has users:manage', () => {
    const roles: UserRole[] = ['RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role]).not.toContain('users:manage')
    }
  })

  it('no other role has organization:manage', () => {
    const roles: UserRole[] = ['HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role]).not.toContain('organization:manage')
    }
  })
})

// ─── INTERVIEWER specific ─────────────────────────────────────────────────────

describe('INTERVIEWER permissions', () => {
  it('can submit feedback', () => {
    expect(hasPermission('INTERVIEWER', 'interviews:feedback')).toBe(true)
  })

  it('can read interviews', () => {
    expect(hasPermission('INTERVIEWER', 'interviews:read')).toBe(true)
  })

  it('cannot create or update interviews', () => {
    expect(hasPermission('INTERVIEWER', 'interviews:create')).toBe(false)
    expect(hasPermission('INTERVIEWER', 'interviews:update')).toBe(false)
  })

  it('cannot delete jobs or candidates', () => {
    expect(hasPermission('INTERVIEWER', 'jobs:delete')).toBe(false)
    expect(hasPermission('INTERVIEWER', 'candidates:delete')).toBe(false)
  })
})

// ─── HIRING_MANAGER specific ──────────────────────────────────────────────────

describe('HIRING_MANAGER permissions', () => {
  it('can move applications in pipeline', () => {
    expect(hasPermission('HIRING_MANAGER', 'applications:move')).toBe(true)
  })

  it('can leave interview feedback', () => {
    expect(hasPermission('HIRING_MANAGER', 'interviews:feedback')).toBe(true)
  })

  it('cannot create jobs', () => {
    expect(hasPermission('HIRING_MANAGER', 'jobs:create')).toBe(false)
  })

  it('cannot delete candidates', () => {
    expect(hasPermission('HIRING_MANAGER', 'candidates:delete')).toBe(false)
  })

  it('can access analytics', () => {
    expect(hasPermission('HIRING_MANAGER', 'analytics:read')).toBe(true)
  })
})

// ─── RECRUITER specific ───────────────────────────────────────────────────────

describe('RECRUITER permissions', () => {
  it('can archive jobs', () => {
    expect(hasPermission('RECRUITER', 'jobs:archive')).toBe(true)
  })

  it('cannot delete jobs', () => {
    expect(hasPermission('RECRUITER', 'jobs:delete')).toBe(false)
  })

  it('can create candidates', () => {
    expect(hasPermission('RECRUITER', 'candidates:create')).toBe(true)
  })

  it('can delete interviews', () => {
    expect(hasPermission('RECRUITER', 'interviews:delete')).toBe(true)
  })

  it('cannot delete candidates', () => {
    expect(hasPermission('RECRUITER', 'candidates:delete')).toBe(false)
  })
})

// ─── hasAllPermissions ─────────────────────────────────────────────────────────

describe('hasAllPermissions', () => {
  it('returns true when all permissions present', () => {
    expect(
      hasAllPermissions('SUPER_ADMIN', ['jobs:create', 'jobs:delete', 'users:manage'])
    ).toBe(true)
  })

  it('returns false when one permission is missing', () => {
    expect(hasAllPermissions('RECRUITER', ['jobs:create', 'jobs:delete'])).toBe(false)
  })

  it('returns true for empty permission array', () => {
    expect(hasAllPermissions('VIEWER', [])).toBe(true)
  })
})

// ─── hasAnyPermission ─────────────────────────────────────────────────────────

describe('hasAnyPermission', () => {
  it('returns true when at least one permission present', () => {
    expect(hasAnyPermission('VIEWER', ['jobs:delete', 'jobs:read'])).toBe(true)
  })

  it('returns false when none of the permissions are present', () => {
    expect(hasAnyPermission('VIEWER', ['jobs:create', 'jobs:delete', 'users:manage'])).toBe(false)
  })

  it('returns false for empty array', () => {
    expect(hasAnyPermission('SUPER_ADMIN', [])).toBe(false)
  })
})

// ─── isAdminRole ──────────────────────────────────────────────────────────────

describe('isAdminRole', () => {
  it('returns true only for SUPER_ADMIN', () => {
    expect(isAdminRole('SUPER_ADMIN')).toBe(true)
  })

  const nonAdminRoles: UserRole[] = ['RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']
  it.each(nonAdminRoles)('returns false for %s', (role) => {
    expect(isAdminRole(role)).toBe(false)
  })
})

// ─── ROLE_LABELS ──────────────────────────────────────────────────────────────

describe('ROLE_LABELS', () => {
  it('has a label for every role', () => {
    const roles: UserRole[] = ['SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']
    for (const role of roles) {
      expect(ROLE_LABELS[role]).toBeTruthy()
      expect(typeof ROLE_LABELS[role]).toBe('string')
    }
  })

  it('maps SUPER_ADMIN to "Super Admin"', () => {
    expect(ROLE_LABELS.SUPER_ADMIN).toBe('Super Admin')
  })
})
