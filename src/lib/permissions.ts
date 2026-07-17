import type { Permission, RolePermissions } from '@/types/auth'
import type { UserRole } from '@prisma/client'

/**
 * Role-based permission map.
 * All permission checks MUST happen server-side — this file is also used in server actions.
 */
export const ROLE_PERMISSIONS: RolePermissions = {
  SUPER_ADMIN: [
    'jobs:create',
    'jobs:read',
    'jobs:update',
    'jobs:delete',
    'jobs:archive',
    'candidates:create',
    'candidates:read',
    'candidates:update',
    'candidates:delete',
    'applications:create',
    'applications:read',
    'applications:update',
    'applications:move',
    'interviews:create',
    'interviews:read',
    'interviews:update',
    'interviews:delete',
    'interviews:feedback',
    'reports:read',
    'users:manage',
    'organization:manage',
    'analytics:read',
  ],
  OWNER: [
    'jobs:create',
    'jobs:read',
    'jobs:update',
    'jobs:delete',
    'jobs:archive',
    'candidates:create',
    'candidates:read',
    'candidates:update',
    'candidates:delete',
    'applications:create',
    'applications:read',
    'applications:update',
    'applications:move',
    'interviews:create',
    'interviews:read',
    'interviews:update',
    'interviews:delete',
    'interviews:feedback',
    'reports:read',
    'users:manage',
    'organization:manage',
    'analytics:read',
  ],
  RECRUITER: [
    'jobs:create',
    'jobs:read',
    'jobs:update',
    'jobs:archive',
    'candidates:create',
    'candidates:read',
    'candidates:update',
    'applications:create',
    'applications:read',
    'applications:update',
    'applications:move',
    'interviews:create',
    'interviews:read',
    'interviews:update',
    'interviews:delete',
    'reports:read',
    'analytics:read',
    'organization:manage',
  ],
  HIRING_MANAGER: [
    'jobs:read',
    'jobs:update',
    'candidates:read',
    'applications:read',
    'applications:update',
    'applications:move',
    'interviews:read',
    'interviews:update',
    'interviews:feedback',
    'reports:read',
    'analytics:read',
  ],
  INTERVIEWER: [
    'jobs:read',
    'candidates:read',
    'applications:read',
    'interviews:read',
    'interviews:feedback',
  ],
  VIEWER: ['jobs:read', 'candidates:read', 'applications:read', 'interviews:read'],
  CANDIDATE: [],
}

/**
 * Check if a role has a specific permission, optionally checking a list of dynamic permissions.
 */
export function hasPermission(role: UserRole, permission: Permission, userPermissions?: string[]): boolean {
  if (userPermissions) {
    return userPermissions.includes(permission)
  }
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[], userPermissions?: string[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission, userPermissions))
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[], userPermissions?: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission, userPermissions))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Determine if a role is an admin-level role
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'SUPER_ADMIN'
}

/**
 * Role hierarchy for display purposes
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Organization Owner',
  RECRUITER: 'Recruiter',
  HIRING_MANAGER: 'Hiring Manager',
  INTERVIEWER: 'Interviewer',
  VIEWER: 'Viewer',
  CANDIDATE: 'Candidate',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Full access to all features and settings',
  OWNER: 'Full access to organization, team management, and billing settings',
  RECRUITER: 'Create jobs, manage candidates, schedule interviews',
  HIRING_MANAGER: 'Review applicants, leave feedback, approve decisions',
  INTERVIEWER: 'Submit interview notes and feedback',
  VIEWER: 'Read-only access to jobs and candidates',
  CANDIDATE: 'Access to job application status and profile portal',
}
