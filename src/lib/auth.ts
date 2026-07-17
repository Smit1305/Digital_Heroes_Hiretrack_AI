import { db } from '@/lib/db'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'
import { signInSchema } from '@/validators/auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import { ROLE_PERMISSIONS } from '@/lib/permissions'

const prismaAdapter = PrismaAdapter(db)
const customAdapter = {
  ...prismaAdapter,
  createUser: async (data: any) => {
    const { image, ...rest } = data
    const user = await db.user.create({
      data: {
        ...rest,
        avatar: image,
      },
    })
    return {
      ...user,
      image: user.avatar,
    } as any
  },
  getUser: async (id: string) => {
    const user = await prismaAdapter.getUser!(id)
    if (!user) return null
    return {
      ...user,
      image: (user as any).avatar,
    }
  },
  getUserByEmail: async (email: string) => {
    const user = await prismaAdapter.getUserByEmail!(email)
    if (!user) return null
    return {
      ...user,
      image: (user as any).avatar,
    }
  },
  getUserByAccount: async (provider_providerAccountId: { provider: string; providerAccountId: string }) => {
    const user = await prismaAdapter.getUserByAccount!(provider_providerAccountId)
    if (!user) return null
    return {
      ...user,
      image: (user as any).avatar,
    }
  },
  updateUser: async (data: any) => {
    const { image, ...rest } = data
    const user = await db.user.update({
      where: { id: data.id },
      data: {
        ...rest,
        avatar: image,
      },
    })
    return {
      ...user,
      image: user.avatar,
    } as any
  },
  getSessionAndUser: async (sessionToken: string) => {
    const result = await prismaAdapter.getSessionAndUser!(sessionToken)
    if (!result) return null
    return {
      session: result.session,
      user: {
        ...result.user,
        image: (result.user as any).avatar,
      },
    }
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customAdapter as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const normalizedEmail = email.toLowerCase()
        const rateLimitKey = `auth:credentials:${normalizedEmail}`
        const rateLimit = checkRateLimit(rateLimitKey, {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        })

        if (!rateLimit.success) return null

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            passwordHash: true,
            avatar: true,
            role: true,
            organizationId: true,
            isActive: true,
          },
        })

        if (!user || !user.passwordHash) return null
        if (!user.isActive) return null
        if (!user.emailVerified) return null

        const isValidPassword = await bcrypt.compare(password, user.passwordHash)
        if (!isValidPassword) return null
        clearRateLimit(rateLimitKey)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          organizationId: user.organizationId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: UserRole }).role
        token.organizationId = (user as { organizationId?: string }).organizationId
        
        // Initial permission load
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            customRole: {
              select: {
                permissions: {
                  select: {
                    permission: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        })
        
        if (dbUser?.customRole) {
          token.permissions = dbUser.customRole.permissions.map(p => p.permission.name)
        } else {
          token.permissions = ROLE_PERMISSIONS[(user as { role: UserRole }).role] || []
        }
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.name = session.name
        token.role = session.role
        token.organizationId = session.organizationId
        token.permissions = session.permissions
      }

      // Refresh user data from DB periodically
      if (token.id && trigger !== 'update') {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            organizationId: true,
            isActive: true,
            name: true,
            avatar: true,
            customRole: {
              select: {
                permissions: {
                  select: {
                    permission: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.organizationId = dbUser.organizationId
          token.name = dbUser.name
          token.picture = dbUser.avatar
          if (dbUser.customRole) {
            token.permissions = dbUser.customRole.permissions.map(p => p.permission.name)
          } else {
            token.permissions = ROLE_PERMISSIONS[dbUser.role] || []
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.organizationId = token.organizationId as string | null
        session.user.name = token.name as string | null
        session.user.image = token.picture as string | null
        session.user.permissions = token.permissions as string[] | undefined
      }
      return session
    },
    async signIn({ user, account }) {
      // Block sign in if user account doesn't exist for OAuth
      if (account?.provider !== 'credentials' && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          select: { isActive: true },
        })
        if (existingUser && !existingUser.isActive) {
          return false
        }
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      // Create audit log for new user
      if (user.id) {
        await db.auditLog.create({
          data: {
            actorId: user.id,
            entityType: 'USER',
            entityId: user.id,
            action: 'CREATED',
            newValue: { email: user.email, name: user.name },
          },
        })
      }
    },
    async signIn({ user }) {
      if (user.id) {
        const dbUser = await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
          select: { organizationId: true },
        }).catch(() => null) // Non-critical

        if (dbUser) {
          await db.auditLog.create({
            data: {
              actorId: user.id,
              organizationId: dbUser.organizationId,
              entityType: 'USER',
              entityId: user.id,
              action: 'UPDATED',
              newValue: { event: 'signed_in' },
            },
          }).catch(() => null)
        }
      }
    },
  },
})
