import { createInterviewSchema, updateInterviewSchema } from '@/validators/interview'

// ─── createInterviewSchema ────────────────────────────────────────────────────

describe('createInterviewSchema', () => {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24) // tomorrow

  const valid = {
    candidateId: 'clxxxxxxxxxxxxxxxxxxxxxx',
    applicationId: 'clxxxxxxxxxxxxxxxxxxxxxy',
    interviewerId: 'clxxxxxxxxxxxxxxxxxxxxyz',
    scheduledAt: futureDate,
  }

  it('accepts minimal valid interview', () => {
    const result = createInterviewSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('accepts full valid interview', () => {
    const result = createInterviewSchema.safeParse({
      ...valid,
      duration: 90,
      type: 'VIDEO',
      location: 'https://meet.google.com/abc',
      notes: 'Focus on system design.',
    })
    expect(result.success).toBe(true)
  })

  it('defaults duration to 60', () => {
    const result = createInterviewSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.duration).toBe(60)
  })

  it('defaults type to VIDEO', () => {
    const result = createInterviewSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.type).toBe('VIDEO')
  })

  it('rejects scheduling in the past', () => {
    const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24)
    const result = createInterviewSchema.safeParse({ ...valid, scheduledAt: yesterday })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.scheduledAt).toBeDefined()
  })

  it('rejects duration below 15 minutes', () => {
    const result = createInterviewSchema.safeParse({ ...valid, duration: 10 })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.duration).toBeDefined()
  })

  it('rejects duration above 480 minutes', () => {
    const result = createInterviewSchema.safeParse({ ...valid, duration: 481 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer duration', () => {
    const result = createInterviewSchema.safeParse({ ...valid, duration: 45.5 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid interview type', () => {
    const result = createInterviewSchema.safeParse({ ...valid, type: 'UNKNOWN' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid interview types', () => {
    const types = ['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'HR', 'PANEL'] as const
    for (const type of types) {
      const result = createInterviewSchema.safeParse({ ...valid, type })
      expect(result.success).toBe(true)
    }
  })

  it('rejects location longer than 500 characters', () => {
    const result = createInterviewSchema.safeParse({ ...valid, location: 'A'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('rejects notes longer than 5000 characters', () => {
    const result = createInterviewSchema.safeParse({ ...valid, notes: 'A'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('accepts date string and coerces to Date', () => {
    const result = createInterviewSchema.safeParse({
      ...valid,
      scheduledAt: futureDate.toISOString(),
    })
    expect(result.success).toBe(true)
    expect(result.data?.scheduledAt).toBeInstanceOf(Date)
  })
})

// ─── updateInterviewSchema ────────────────────────────────────────────────────

describe('updateInterviewSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateInterviewSchema.safeParse({}).success).toBe(true)
  })

  it('accepts partial update with only notes', () => {
    expect(updateInterviewSchema.safeParse({ notes: 'Updated notes.' }).success).toBe(true)
  })

  it('accepts feedback and rating', () => {
    const result = updateInterviewSchema.safeParse({
      feedback: 'Excellent performance.',
      rating: 5,
    })
    expect(result.success).toBe(true)
  })

  it('rejects rating below 1', () => {
    const result = updateInterviewSchema.safeParse({ rating: 0 })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.rating).toBeDefined()
  })

  it('rejects rating above 5', () => {
    const result = updateInterviewSchema.safeParse({ rating: 6 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer rating', () => {
    const result = updateInterviewSchema.safeParse({ rating: 4.5 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = updateInterviewSchema.safeParse({ status: 'UNKNOWN' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid statuses', () => {
    const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'] as const
    for (const status of statuses) {
      expect(updateInterviewSchema.safeParse({ status }).success).toBe(true)
    }
  })

  it('accepts valid type update', () => {
    expect(updateInterviewSchema.safeParse({ type: 'ONSITE' }).success).toBe(true)
  })

  it('rejects invalid type in update', () => {
    expect(updateInterviewSchema.safeParse({ type: 'WALK_IN' }).success).toBe(false)
  })
})
