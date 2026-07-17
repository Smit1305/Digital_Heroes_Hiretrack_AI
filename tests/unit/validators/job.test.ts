import { createJobSchema, jobFiltersSchema, updateJobSchema } from '@/validators/job'

// ─── createJobSchema ──────────────────────────────────────────────────────────

describe('createJobSchema', () => {
  const valid = {
    title: 'Senior Engineer',
    description: 'We are looking for an experienced engineer to join our team.',
  }

  it('accepts minimal valid input', () => {
    expect(createJobSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a full valid job', () => {
    const result = createJobSchema.safeParse({
      ...valid,
      department: 'Engineering',
      location: 'Remote',
      employmentType: 'FULL_TIME',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'USD',
      requirements: 'Must know TypeScript.',
      benefits: 'Health insurance.',
      status: 'OPEN',
      isRemote: true,
      experienceLevel: 'Senior',
    })
    expect(result.success).toBe(true)
  })

  it('rejects title shorter than 2 characters', () => {
    const result = createJobSchema.safeParse({ ...valid, title: 'A' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.title).toBeDefined()
  })

  it('rejects title longer than 200 characters', () => {
    const result = createJobSchema.safeParse({ ...valid, title: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects description shorter than 10 characters', () => {
    const result = createJobSchema.safeParse({ ...valid, description: 'Short' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.description).toBeDefined()
  })

  it('rejects invalid employmentType', () => {
    const result = createJobSchema.safeParse({ ...valid, employmentType: 'INVALID' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = createJobSchema.safeParse({ ...valid, status: 'UNKNOWN' })
    expect(result.success).toBe(false)
  })

  it('rejects negative salaryMin', () => {
    const result = createJobSchema.safeParse({ ...valid, salaryMin: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer salaryMax', () => {
    const result = createJobSchema.safeParse({ ...valid, salaryMax: 100.5 })
    expect(result.success).toBe(false)
  })

  it('defaults employmentType to FULL_TIME', () => {
    const result = createJobSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.employmentType).toBe('FULL_TIME')
  })

  it('defaults status to DRAFT', () => {
    const result = createJobSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.status).toBe('DRAFT')
  })

  it('defaults isRemote to false', () => {
    const result = createJobSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.isRemote).toBe(false)
  })

  it('defaults salaryCurrency to USD', () => {
    const result = createJobSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.salaryCurrency).toBe('USD')
  })

  it('rejects currency code that is not 3 characters', () => {
    const result = createJobSchema.safeParse({ ...valid, salaryCurrency: 'US' })
    expect(result.success).toBe(false)
  })
})

// ─── updateJobSchema ──────────────────────────────────────────────────────────

describe('updateJobSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateJobSchema.safeParse({}).success).toBe(true)
  })

  it('accepts partial update with only title', () => {
    expect(updateJobSchema.safeParse({ title: 'Updated Title' }).success).toBe(true)
  })

  it('rejects invalid status in update', () => {
    const result = updateJobSchema.safeParse({ status: 'PUBLISHED' })
    expect(result.success).toBe(false)
  })

  it('rejects title too short in update', () => {
    const result = updateJobSchema.safeParse({ title: 'A' })
    expect(result.success).toBe(false)
  })
})

// ─── jobFiltersSchema ─────────────────────────────────────────────────────────

describe('jobFiltersSchema', () => {
  it('accepts empty filters with defaults', () => {
    const result = jobFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data?.page).toBe(1)
    expect(result.data?.pageSize).toBe(20)
    expect(result.data?.sortBy).toBe('createdAt')
    expect(result.data?.sortOrder).toBe('desc')
  })

  it('accepts valid filter combination', () => {
    const result = jobFiltersSchema.safeParse({
      query: 'engineer',
      status: 'OPEN',
      employmentType: 'FULL_TIME',
      page: '2',
      pageSize: '10',
      sortBy: 'title',
      sortOrder: 'asc',
    })
    expect(result.success).toBe(true)
    expect(result.data?.page).toBe(2)
    expect(result.data?.pageSize).toBe(10)
  })

  it('rejects pageSize greater than 100', () => {
    const result = jobFiltersSchema.safeParse({ pageSize: '200' })
    expect(result.success).toBe(false)
  })

  it('rejects page less than 1', () => {
    const result = jobFiltersSchema.safeParse({ page: '0' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid sortBy value', () => {
    const result = jobFiltersSchema.safeParse({ sortBy: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid sortOrder value', () => {
    const result = jobFiltersSchema.safeParse({ sortOrder: 'random' })
    expect(result.success).toBe(false)
  })

  it('coerces page from string to number', () => {
    const result = jobFiltersSchema.safeParse({ page: '5' })
    expect(result.success).toBe(true)
    expect(result.data?.page).toBe(5)
  })
})
