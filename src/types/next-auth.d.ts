import type { UserRole } from '@prisma/client'
import type { DefaultJWT, DefaultSession } from 'next-auth'

/**
 * Augment NextAuth's built-in types so session.user and JWT token
 * carry our custom fields everywhere without casting.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      organizationId: string | null
      permissions?: string[]
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
    organizationId?: string | null
    permissions?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    role?: UserRole
    organizationId?: string | null
    permissions?: string[]
  }
}
