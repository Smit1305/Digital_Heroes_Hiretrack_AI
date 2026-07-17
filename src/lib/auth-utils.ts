import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import type { Permission } from '@/types/auth'
import type { UserRole } from '@prisma/client'

// Augmented session user type (matches next-auth.d.ts declaration)
export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: UserRole
  organizationId: string | null
  permissions?: string[]
}

/**
 * Get the current session on the server side.
 * Returns null if not authenticated.
 */
export async function getSession() {
  return auth()
}

/**
 * Get the current user or throw if unauthenticated.
 * Use this in Server Actions and Route Handlers.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth()
  if (!session?.user) {
    throw new Error('UNAUTHORIZED')
  }
  return session.user as SessionUser
}

/**
 * Require a specific permission. Throws if not authorized.
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuth()
  if (!hasPermission(user.role, permission, user.permissions)) {
    throw new Error('FORBIDDEN')
  }
  return user
}

/**
 * Require one of the given roles. Throws if not authorized.
 */
export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error('FORBIDDEN')
  }
  return user
}

/**
 * Verify the current user belongs to a given organization.
 * Throws if they do not — prevents cross-org data access.
 */
export async function requireOrganization(organizationId: string): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'SUPER_ADMIN' && user.organizationId !== organizationId) {
    throw new Error('FORBIDDEN')
  }
  return user
}
