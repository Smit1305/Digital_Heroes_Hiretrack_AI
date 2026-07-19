'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ActionResult } from '@/types/api'
import {
  candidateSignUpSchema,
  candidateProfileUpdateSchema,
  type CandidateSignUpInput,
  type CandidateProfileUpdateInput,
} from '@/validators/auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { headers } from 'next/headers'

const EMAIL_VERIFICATION_PREFIX = 'email-verification:'
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

import { getAppBaseUrl } from '@/lib/app-url'

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
  const verificationUrl = await getAppBaseUrl(`/auth/verify?token=${token}`)

  await sendEmail({
    to: email,
    subject: 'Verify your HireTrack AI candidate account',
    text: `Verify your candidate account by opening this link: ${verificationUrl}`,
    html: `
      <p>Welcome to HireTrack AI.</p>
      <p>Verify your email address to activate your candidate account:</p>
      <p><a href="${verificationUrl}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  })
}



export async function candidateSignUpAction(
  input: CandidateSignUpInput
): Promise<ActionResult<{ email: string }>> {
  const parsed = candidateSignUpSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    linkedinUrl,
    portfolioUrl,
    githubUrl,
    resumeUrl,
  } = parsed.data

  const normalizedEmail = email.toLowerCase()
  const rateLimitError = await checkAuthRateLimit(
    'auth:candidate:signup',
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
  const fullName = `${firstName} ${lastName}`

  // Create User (CANDIDATE) and CandidateProfile
  const hasEmailProvider = !!process.env.RESEND_API_KEY
  const user = await db.user.create({
    data: {
      name: fullName,
      email: normalizedEmail,
      passwordHash,
      role: 'CANDIDATE',
      isActive: true,
      emailVerified: hasEmailProvider ? null : new Date(),
      candidateProfile: {
        create: {
          firstName,
          lastName,
          phone: phone || null,
          linkedinUrl: linkedinUrl || null,
          portfolioUrl: portfolioUrl || null,
          githubUrl: githubUrl || null,
          resumeUrl: resumeUrl || null,
        },
      },
    },
  })

  // Log signup audit log
  await db.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'USER',
      entityId: user.id,
      action: 'CREATED',
      newValue: { email: normalizedEmail, name: fullName, role: 'CANDIDATE' },
    },
  })

  const verificationToken = await createEmailVerificationToken(normalizedEmail)
  await sendVerificationEmail(normalizedEmail, verificationToken)

  return { success: true, data: { email: normalizedEmail } }
}

export async function updateCandidateProfileAction(
  input: CandidateProfileUpdateInput
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CANDIDATE') {
    return { success: false, error: 'Unauthorized.' }
  }

  const parsed = candidateProfileUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    firstName,
    lastName,
    phone,
    linkedinUrl,
    portfolioUrl,
    githubUrl,
    resumeUrl,
  } = parsed.data

  const fullName = `${firstName} ${lastName}`

  await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: { name: fullName },
    }),
    db.candidateProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        firstName,
        lastName,
        phone: phone || null,
        linkedinUrl: linkedinUrl || null,
        portfolioUrl: portfolioUrl || null,
        githubUrl: githubUrl || null,
        resumeUrl: resumeUrl || null,
      },
      update: {
        firstName,
        lastName,
        phone: phone || null,
        linkedinUrl: linkedinUrl || null,
        portfolioUrl: portfolioUrl || null,
        githubUrl: githubUrl || null,
        resumeUrl: resumeUrl || null,
      },
    }),
  ])

  // Log profile update audit log
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      entityType: 'USER',
      entityId: session.user.id,
      action: 'UPDATED',
      newValue: { event: 'profile_updated', name: fullName },
    },
  })

  return { success: true, data: undefined }
}
