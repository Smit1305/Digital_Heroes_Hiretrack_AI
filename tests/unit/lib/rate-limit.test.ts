import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'

const KEY = 'test:rate-limit'
const OPTIONS = { limit: 3, windowMs: 60_000 }

describe('checkRateLimit', () => {
  afterEach(() => {
    clearRateLimit(KEY)
  })

  it('allows first request', () => {
    const result = checkRateLimit(KEY, OPTIONS)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('allows requests up to the limit', () => {
    checkRateLimit(KEY, OPTIONS) // 1st
    checkRateLimit(KEY, OPTIONS) // 2nd
    const third = checkRateLimit(KEY, OPTIONS) // 3rd — exactly at limit
    expect(third.success).toBe(true)
    expect(third.remaining).toBe(0)
  })

  it('blocks requests exceeding the limit', () => {
    checkRateLimit(KEY, OPTIONS) // 1
    checkRateLimit(KEY, OPTIONS) // 2
    checkRateLimit(KEY, OPTIONS) // 3
    const overLimit = checkRateLimit(KEY, OPTIONS) // 4 — over
    expect(overLimit.success).toBe(false)
    expect(overLimit.remaining).toBe(0)
  })

  it('returns a resetAt date in the future', () => {
    const result = checkRateLimit(KEY, OPTIONS)
    expect(result.resetAt).toBeInstanceOf(Date)
    expect(result.resetAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('resets after the window expires', () => {
    const shortWindow = { limit: 2, windowMs: 1 } // 1 ms window
    checkRateLimit(KEY, shortWindow)
    checkRateLimit(KEY, shortWindow)
    checkRateLimit(KEY, shortWindow) // over limit within window

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit(KEY, shortWindow)
        expect(result.success).toBe(true)
        clearRateLimit(KEY)
        resolve()
      }, 10)
    })
  })

  it('tracks different keys independently', () => {
    const KEY_A = 'rate:a'
    const KEY_B = 'rate:b'
    try {
      checkRateLimit(KEY_A, { limit: 1, windowMs: 60_000 })
      const overA = checkRateLimit(KEY_A, { limit: 1, windowMs: 60_000 })
      const firstB = checkRateLimit(KEY_B, { limit: 1, windowMs: 60_000 })
      expect(overA.success).toBe(false)
      expect(firstB.success).toBe(true)
    } finally {
      clearRateLimit(KEY_A)
      clearRateLimit(KEY_B)
    }
  })

  it('clearRateLimit allows requests again after clear', () => {
    checkRateLimit(KEY, { limit: 1, windowMs: 60_000 })
    const blocked = checkRateLimit(KEY, { limit: 1, windowMs: 60_000 })
    expect(blocked.success).toBe(false)

    clearRateLimit(KEY)

    const afterClear = checkRateLimit(KEY, { limit: 1, windowMs: 60_000 })
    expect(afterClear.success).toBe(true)
  })
})
