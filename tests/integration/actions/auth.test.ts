/**
 * Integration tests for auth server actions.
 * Uses vi.hoisted() for proper mock factory hoisting.
 */
import { vi } from 'vitest'

const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    organization: { findUnique: vi.fn(), create: vi.fn() },
    passwordReset: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    session: { deleteMany: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  }
  return { mockDb }
})

vi.mock('@/lib/db', () => ({ db: mockDb }))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$12$hashed'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('$2b$12$hashed'),
  compare: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ success: true, remaining: 9, resetAt: new Date() }),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock @/lib/email so signUpAction doesn't try to send real emails
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}))

// next-auth pulls in next/server which isn't resolvable in vitest jsdom
vi.mock('next-auth', () => ({
  default: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn().mockResolvedValue(null),
  AuthError: class AuthError extends Error {},
}))

vi.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: { json: vi.fn(), redirect: vi.fn(), next: vi.fn() },
}))

// next/headers is used by auth action (headers())
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue(new Map()),
  cookies: vi.fn().mockReturnValue({ get: vi.fn(), set: vi.fn() }),
}))

import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  forgotPasswordAction,
  resetPasswordAction,
  signUpAction,
  verifyEmailAction,
} from '@/server/actions/auth'

const mockUserRecord = {
  id: 'user-001',
  name: 'Jane Smith',
  email: 'jane@example.com',
  passwordHash: '$2b$12$hashed',
  role: 'RECRUITER',
  organizationId: 'org-001',
  emailVerified: new Date(),
  isActive: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(headers).mockResolvedValue(new Map() as any)
  vi.mocked(checkRateLimit).mockReturnValue({ success: true, remaining: 9, resetAt: new Date() })
  mockDb.auditLog.create.mockResolvedValue({})
  mockDb.verificationToken.deleteMany.mockResolvedValue({ count: 0 })
  mockDb.verificationToken.create.mockResolvedValue({ token: 'tok', identifier: 'x', expires: new Date() })
  mockDb.verificationToken.delete.mockResolvedValue({})
  mockDb.user.update.mockResolvedValue({})
  mockDb.$transaction.mockImplementation(async (ops: unknown) => {
    if (typeof ops === 'function') return ops(mockDb)
    if (Array.isArray(ops)) return Promise.all(ops)
    return ops
  })
})

// ─── signUpAction ─────────────────────────────────────────────────────────────

describe('signUpAction', () => {
  it('registers a new user successfully', async () => {
    mockDb.user.findUnique.mockResolvedValue(null)
    mockDb.organization.findUnique.mockResolvedValue(null)
    mockDb.organization.create.mockResolvedValue({ id: 'org-001' })
    mockDb.user.create.mockResolvedValue(mockUserRecord)

    const result = await signUpAction({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      organizationName: 'Acme Corp',
    })

    expect(result.success).toBe(true)
    expect(mockDb.user.create).toHaveBeenCalled()
  })

  it('rejects registration with existing email', async () => {
    mockDb.user.findUnique.mockResolvedValue(mockUserRecord)

    const result = await signUpAction({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    })

    expect(result.success).toBe(false)
    expect(mockDb.user.create).not.toHaveBeenCalled()
  })

  it('returns fieldErrors for weak password', async () => {
    const result = await signUpAction({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.password).toBeDefined()
  })

  it('returns fieldErrors for mismatched passwords', async () => {
    const result = await signUpAction({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Different1',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.confirmPassword).toBeDefined()
  })

  it('returns fieldErrors for name too short', async () => {
    const result = await signUpAction({
      name: 'J',
      email: 'j@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('blocks when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ success: false, remaining: 0, resetAt: new Date() })

    const result = await signUpAction({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    })
    expect(result.success).toBe(false)
  })
})

// ─── forgotPasswordAction ─────────────────────────────────────────────────────

describe('forgotPasswordAction', () => {
  it('always returns success (prevents email enumeration)', async () => {
    mockDb.user.findUnique.mockResolvedValue(null) // user does not exist
    const result = await forgotPasswordAction({ email: 'nobody@example.com' })
    expect(result.success).toBe(true)
  })

  it('creates a reset token for an existing active user', async () => {
    mockDb.user.findUnique.mockResolvedValue({ id: 'user-001', name: 'Jane', isActive: true })
    mockDb.passwordReset.updateMany.mockResolvedValue({ count: 0 })
    mockDb.passwordReset.create.mockResolvedValue({ token: 'reset-tok' })

    const result = await forgotPasswordAction({ email: 'jane@example.com' })
    expect(result.success).toBe(true)
    expect(mockDb.passwordReset.create).toHaveBeenCalled()
  })

  it('returns error for invalid email format', async () => {
    const result = await forgotPasswordAction({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})

// ─── resetPasswordAction ──────────────────────────────────────────────────────

describe('resetPasswordAction', () => {
  const validResetRecord = {
    id: 'reset-001',
    token: 'valid-reset-token',
    userId: 'user-001',
    used: false,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    user: { id: 'user-001', email: 'jane@example.com', isActive: true },
  }

  it('resets password with a valid token', async () => {
    mockDb.passwordReset.findUnique.mockResolvedValue(validResetRecord)
    mockDb.user.update.mockResolvedValue(mockUserRecord)
    mockDb.passwordReset.update.mockResolvedValue({})
    mockDb.session.deleteMany.mockResolvedValue({ count: 0 })

    const result = await resetPasswordAction({
      token: 'valid-reset-token',
      password: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    })
    expect(result.success).toBe(true)
  })

  it('returns error for invalid token', async () => {
    mockDb.passwordReset.findUnique.mockResolvedValue(null)
    const result = await resetPasswordAction({
      token: 'bad-token',
      password: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    })
    expect(result.success).toBe(false)
  })

  it('returns error for expired token', async () => {
    mockDb.passwordReset.findUnique.mockResolvedValue({
      ...validResetRecord,
      expires: new Date(Date.now() - 1000),
    })
    const result = await resetPasswordAction({
      token: 'expired',
      password: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    })
    expect(result.success).toBe(false)
  })

  it('returns error for already-used token', async () => {
    mockDb.passwordReset.findUnique.mockResolvedValue({ ...validResetRecord, used: true })
    const result = await resetPasswordAction({
      token: 'used',
      password: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    })
    expect(result.success).toBe(false)
  })

  it('returns fieldErrors for weak new password', async () => {
    const result = await resetPasswordAction({
      token: 'any',
      password: 'weak',
      confirmPassword: 'weak',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.password).toBeDefined()
  })

  it('returns fieldErrors for mismatched confirm password', async () => {
    const result = await resetPasswordAction({
      token: 'any',
      password: 'NewPassword1',
      confirmPassword: 'Different1',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.fieldErrors?.confirmPassword).toBeDefined()
  })
})

// ─── verifyEmailAction ────────────────────────────────────────────────────────

describe('verifyEmailAction', () => {
  it('verifies email with valid token', async () => {
    mockDb.verificationToken.findUnique.mockResolvedValue({
      token: 'verify-token-123',
      identifier: 'email-verification:jane@example.com',
      expires: new Date(Date.now() + 60 * 60 * 1000),
    })
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-001',
      emailVerified: null,
      organizationId: 'org-001',
    })
    mockDb.user.update.mockResolvedValue({ ...mockUserRecord, emailVerified: new Date() })
    mockDb.verificationToken.delete.mockResolvedValue({})

    const result = await verifyEmailAction({ token: 'verify-token-123' })
    expect(result.success).toBe(true)
  })

  it('returns error for invalid token', async () => {
    mockDb.verificationToken.findUnique.mockResolvedValue(null)
    const result = await verifyEmailAction({ token: 'bad-token' })
    expect(result.success).toBe(false)
  })

  it('returns error for expired token', async () => {
    mockDb.verificationToken.findUnique.mockResolvedValue({
      token: 'expired',
      identifier: 'email:jane@example.com',
      expires: new Date(Date.now() - 1000),
    })
    const result = await verifyEmailAction({ token: 'expired' })
    expect(result.success).toBe(false)
  })

  it('returns error for empty token', async () => {
    const result = await verifyEmailAction({ token: '' })
    expect(result.success).toBe(false)
  })
})
