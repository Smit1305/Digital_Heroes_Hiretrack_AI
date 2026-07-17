import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from '@/validators/auth'

// ─── signInSchema ─────────────────────────────────────────────────────────────

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })
})

// ─── signUpSchema ─────────────────────────────────────────────────────────────

describe('signUpSchema', () => {
  const valid = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    organizationName: 'Acme Corp',
  }

  it('accepts valid registration data', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts registration without organization', () => {
    const withoutOrg = {
      name: valid.name,
      email: valid.email,
      password: valid.password,
      confirmPassword: valid.confirmPassword,
    }
    expect(signUpSchema.safeParse(withoutOrg).success).toBe(true)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = signUpSchema.safeParse({ ...valid, name: 'J' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.name).toBeDefined()
  })

  it('rejects password without uppercase', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'password1',
      confirmPassword: 'password1',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })

  it('rejects password without number', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'Password',
      confirmPassword: 'Password',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'Pw1',
      confirmPassword: 'Pw1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: 'DifferentPassword1',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined()
  })

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({ ...valid, email: 'bad' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })
})

// ─── forgotPasswordSchema ─────────────────────────────────────────────────────

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'nope' })
    expect(result.success).toBe(false)
  })
})

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  const valid = {
    token: 'abc123token',
    password: 'NewPassword1',
    confirmPassword: 'NewPassword1',
  }

  it('accepts valid reset data', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty token', () => {
    const result = resetPasswordSchema.safeParse({ ...valid, token: '' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.token).toBeDefined()
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      confirmPassword: 'WrongPassword1',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined()
  })

  it('rejects weak password', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      password: 'weak',
      confirmPassword: 'weak',
    })
    expect(result.success).toBe(false)
  })
})

// ─── verifyEmailSchema ───────────────────────────────────────────────────────

describe('verifyEmailSchema', () => {
  it('accepts a token', () => {
    expect(verifyEmailSchema.safeParse({ token: 'verification-token' }).success).toBe(true)
  })

  it('rejects an empty token', () => {
    const result = verifyEmailSchema.safeParse({ token: '' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.token).toBeDefined()
  })
})
