import { candidateFiltersSchema, createCandidateSchema, updateCandidateSchema } from '@/validators/candidate'

// ─── createCandidateSchema ────────────────────────────────────────────────────

describe('createCandidateSchema', () => {
  const valid = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
  }

  it('accepts minimal valid candidate', () => {
    expect(createCandidateSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts full valid candidate', () => {
    const result = createCandidateSchema.safeParse({
      ...valid,
      phone: '+1-555-0100',
      linkedin: 'https://linkedin.com/in/janesmith',
      portfolio: 'https://janesmith.dev',
      website: 'https://janesmith.com',
      location: 'San Francisco, CA',
      experience: 5,
      education: 'B.S. Computer Science',
      skills: ['TypeScript', 'React', 'Node.js'],
      notes: 'Strong candidate.',
      source: 'LinkedIn',
      status: 'ACTIVE',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty firstName', () => {
    const result = createCandidateSchema.safeParse({ ...valid, firstName: '' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.firstName).toBeDefined()
  })

  it('rejects empty lastName', () => {
    const result = createCandidateSchema.safeParse({ ...valid, lastName: '' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.lastName).toBeDefined()
  })

  it('rejects invalid email', () => {
    const result = createCandidateSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })

  it('rejects invalid linkedin URL', () => {
    const result = createCandidateSchema.safeParse({ ...valid, linkedin: 'not-a-url' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.linkedin).toBeDefined()
  })

  it('accepts empty string for linkedin (optional)', () => {
    const result = createCandidateSchema.safeParse({ ...valid, linkedin: '' })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for portfolio', () => {
    const result = createCandidateSchema.safeParse({ ...valid, portfolio: '' })
    expect(result.success).toBe(true)
  })

  it('rejects negative experience', () => {
    const result = createCandidateSchema.safeParse({ ...valid, experience: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects experience over 50', () => {
    const result = createCandidateSchema.safeParse({ ...valid, experience: 51 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer experience', () => {
    const result = createCandidateSchema.safeParse({ ...valid, experience: 3.5 })
    expect(result.success).toBe(false)
  })

  it('rejects more than 50 skills', () => {
    const result = createCandidateSchema.safeParse({
      ...valid,
      skills: Array(51).fill('skill'),
    })
    expect(result.success).toBe(false)
  })

  it('rejects skill string longer than 50 characters', () => {
    const result = createCandidateSchema.safeParse({
      ...valid,
      skills: ['A'.repeat(51)],
    })
    expect(result.success).toBe(false)
  })

  it('defaults skills to empty array', () => {
    const result = createCandidateSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.skills).toEqual([])
  })

  it('defaults status to ACTIVE', () => {
    const result = createCandidateSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.status).toBe('ACTIVE')
  })

  it('rejects invalid status', () => {
    const result = createCandidateSchema.safeParse({ ...valid, status: 'DELETED' })
    expect(result.success).toBe(false)
  })
})

// ─── updateCandidateSchema ────────────────────────────────────────────────────

describe('updateCandidateSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateCandidateSchema.safeParse({}).success).toBe(true)
  })

  it('accepts partial update with only email', () => {
    expect(updateCandidateSchema.safeParse({ email: 'new@example.com' }).success).toBe(true)
  })

  it('rejects invalid email in update', () => {
    const result = updateCandidateSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status in update', () => {
    const result = updateCandidateSchema.safeParse({ status: 'UNKNOWN' })
    expect(result.success).toBe(false)
  })
})

// ─── candidateFiltersSchema ───────────────────────────────────────────────────

describe('candidateFiltersSchema', () => {
  it('accepts empty filters with defaults', () => {
    const result = candidateFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data?.page).toBe(1)
    expect(result.data?.pageSize).toBe(20)
    expect(result.data?.sortBy).toBe('createdAt')
    expect(result.data?.sortOrder).toBe('desc')
  })

  it('accepts valid filter combination', () => {
    const result = candidateFiltersSchema.safeParse({
      query: 'Jane',
      status: 'ACTIVE',
      source: 'LinkedIn',
      page: '2',
      pageSize: '18',
      sortBy: 'firstName',
      sortOrder: 'asc',
    })
    expect(result.success).toBe(true)
    expect(result.data?.page).toBe(2)
  })

  it('coerces experience from string to number', () => {
    const result = candidateFiltersSchema.safeParse({ experience: '3' })
    expect(result.success).toBe(true)
    expect(result.data?.experience).toBe(3)
  })

  it('rejects invalid stage', () => {
    const result = candidateFiltersSchema.safeParse({ stage: 'UNKNOWN_STAGE' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid sortBy', () => {
    const result = candidateFiltersSchema.safeParse({ sortBy: 'phone' })
    expect(result.success).toBe(false)
  })

  it('rejects pageSize greater than 100', () => {
    const result = candidateFiltersSchema.safeParse({ pageSize: '101' })
    expect(result.success).toBe(false)
  })
})
