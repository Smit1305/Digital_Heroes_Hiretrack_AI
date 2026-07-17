import type { UserRole } from '@prisma/client'

export type { UserRole }

export interface SessionUser {
  id: string
  name: string | null
  email: string
  avatar: string | null
  role: UserRole
  organizationId: string | null
  permissions?: Permission[]
}

export interface AuthSession {
  user: SessionUser
  expires: string
}

// Permission map type for RBAC
export type Permission =
  | 'jobs:create'
  | 'jobs:read'
  | 'jobs:update'
  | 'jobs:delete'
  | 'jobs:archive'
  | 'candidates:create'
  | 'candidates:read'
  | 'candidates:update'
  | 'candidates:delete'
  | 'applications:create'
  | 'applications:read'
  | 'applications:update'
  | 'applications:move'
  | 'interviews:create'
  | 'interviews:read'
  | 'interviews:update'
  | 'interviews:delete'
  | 'interviews:feedback'
  | 'reports:read'
  | 'users:manage'
  | 'organization:manage'
  | 'analytics:read'

export type RolePermissions = Record<UserRole, Permission[]>
