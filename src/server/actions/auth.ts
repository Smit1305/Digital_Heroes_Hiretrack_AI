'use server'

import { signIn, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import type { UserRole } from '@prisma/client'
import type { ActionResult } from '@/types/api'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyEmailSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type SignUpInput,
  type VerifyEmailInput,
} from '@/validators/auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'

const EMAIL_VERIFICATION_PREFIX = 'email-verification:'
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

function getAppUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000'
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function getRateLimitKey(scope: string, identifier: string): Promise<string> {
  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ipAddress = forwardedFor ?? headerStore.get('x-real-ip') ?? 'unknown'
  return `${scope}:${identifier}:${ipAddress}`
}

async function checkAuthRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number
): Promise<ActionResult<never> | null> {
  const rateLimit = checkRateLimit(await getRateLimitKey(scope, identifier), { limit, windowMs })

  if (rateLimit.success) return null

  const seconds = Math.max(1, Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000))
  return {
    success: false,
    error: `Too many attempts. Please try again in ${seconds} seconds.`,
  }
}

async function createEmailVerificationToken(email: string): Promise<string> {
  const identifier = `${EMAIL_VERIFICATION_PREFIX}${email}`
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS)

  await db.$transaction([
    db.verificationToken.deleteMany({ where: { identifier } }),
    db.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    }),
  ])

  return token
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = getAppUrl(`/auth/verify?token=${token}`)

  await sendEmail({
    to: email,
    subject: 'Verify your HireTrack AI email',
    text: `Verify your HireTrack AI account by opening this link: ${verificationUrl}`,
    html: `
      <p>Welcome to HireTrack AI.</p>
      <p>Verify your email address to activate your account:</p>
      <p><a href="${verificationUrl}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  })
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUpAction(
  input: SignUpInput
): Promise<ActionResult<{ email: string }>> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { name, email, password, organizationName } = parsed.data
  const normalizedEmail = email.toLowerCase()
  const rateLimitError = await checkAuthRateLimit(
    'auth:signup',
    normalizedEmail,
    5,
    60 * 60 * 1000
  )
  if (rateLimitError) return rateLimitError

  // Check for existing user
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists.',
      fieldErrors: { email: ['An account with this email already exists.'] },
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  // Create org if name provided, otherwise create user without org
  let organizationId: string | null = null

  if (organizationName?.trim()) {
    const slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Ensure unique slug
    const slugExists = await db.organization.findUnique({ where: { slug }, select: { id: true } })
    const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug

    const org = await db.organization.create({
      data: {
        name: organizationName.trim(),
        slug: finalSlug,
        plan: 'FREE',
      },
    })
    organizationId = org.id
  }

  const hasEmailProvider = !!process.env.RESEND_API_KEY
  const user = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: organizationId ? 'RECRUITER' : 'VIEWER',
      organizationId,
      isActive: true,
      emailVerified: hasEmailProvider ? null : new Date(),
    },
  })

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: user.id,
      organizationId,
      entityType: 'USER',
      entityId: user.id,
      action: 'CREATED',
      newValue: { email: normalizedEmail, name },
    },
  })

  const verificationToken = await createEmailVerificationToken(normalizedEmail)
  await sendVerificationEmail(normalizedEmail, verificationToken)

  return { success: true, data: { email: normalizedEmail } }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInAction(email: string, password: string): Promise<ActionResult<void>> {
  const normalizedEmail = email.toLowerCase()
  const rateLimitError = await checkAuthRateLimit(
    'auth:signin',
    normalizedEmail,
    10,
    15 * 60 * 1000
  )
  if (rateLimitError) return rateLimitError

  try {
    await signIn('credentials', {
      email: normalizedEmail,
      password,
      redirect: false,
    })
    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password.' }
        case 'CallbackRouteError':
          return { success: false, error: 'Invalid email or password.' }
        default:
          return { success: false, error: 'Something went wrong. Please try again.' }
      }
    }
    // Re-throw redirect errors from Next.js
    throw error
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/auth/login' })
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<ActionResult<void>> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const email = parsed.data.email.toLowerCase()
  const rateLimitError = await checkAuthRateLimit(
    'auth:forgot-password',
    email,
    5,
    60 * 60 * 1000
  )
  if (rateLimitError) return rateLimitError

  // Always return success to prevent email enumeration
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, isActive: true },
  })

  if (user && user.isActive) {
    // Invalidate existing tokens
    await db.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.passwordReset.create({
      data: { userId: user.id, token, expires },
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        entityType: 'USER',
        entityId: user.id,
        action: 'UPDATED',
        newValue: { event: 'password_reset_requested' },
      },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Reset your HireTrack AI password',
      text: `Reset your HireTrack AI password by opening this link: ${resetUrl}`,
      html: `
        <p>You requested a password reset for your HireTrack AI account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    })
  }

  return { success: true, data: undefined }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<ActionResult<void>> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { token, password } = parsed.data
  const rateLimitError = await checkAuthRateLimit(
    'auth:reset-password',
    token,
    5,
    60 * 60 * 1000
  )
  if (rateLimitError) return rateLimitError

  const resetRecord = await db.passwordReset.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, isActive: true } } },
  })

  if (!resetRecord || resetRecord.used || resetRecord.expires < new Date()) {
    return {
      success: false,
      error: 'This reset link is invalid or has expired. Please request a new one.',
    }
  }

  if (!resetRecord.user.isActive) {
    return { success: false, error: 'This account has been deactivated.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.$transaction([
    db.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    db.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
    // Invalidate all sessions by deleting them
    db.session.deleteMany({ where: { userId: resetRecord.userId } }),
  ])

  await db.auditLog.create({
    data: {
      actorId: resetRecord.userId,
      entityType: 'USER',
      entityId: resetRecord.userId,
      action: 'UPDATED',
      newValue: { event: 'password_reset' },
    },
  })

  return { success: true, data: undefined }
}

// ─── Verify Email ────────────────────────────────────────────────────────────

export async function verifyEmailAction(
  input: VerifyEmailInput
): Promise<ActionResult<{ email: string; role: UserRole }>> {
  const parsed = verifyEmailSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid verification link.' }
  }

  const { token } = parsed.data
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  })

  if (
    !verificationToken ||
    !verificationToken.identifier.startsWith(EMAIL_VERIFICATION_PREFIX) ||
    verificationToken.expires < new Date()
  ) {
    return {
      success: false,
      error: 'This verification link is invalid or has expired.',
    }
  }

  const email = verificationToken.identifier.slice(EMAIL_VERIFICATION_PREFIX.length)
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true, organizationId: true, role: true },
  })

  if (!user) {
    return {
      success: false,
      error: 'This verification link is invalid or has expired.',
    }
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: user.emailVerified ?? new Date() },
    }),
    db.verificationToken.delete({
      where: { token },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: user.organizationId,
        entityType: 'USER',
        entityId: user.id,
        action: 'UPDATED',
        newValue: { event: 'email_verified' },
      },
    }),
  ])

  return { success: true, data: { email, role: user.role } }
}
