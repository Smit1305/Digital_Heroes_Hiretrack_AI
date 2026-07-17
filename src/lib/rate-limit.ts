type RateLimitOptions = {
  limit: number
  windowMs: number
}

type RateLimitBucket = {
  count: number
  resetAt: number
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetAt: Date
}

const globalForRateLimit = globalThis as typeof globalThis & {
  hireTrackRateLimitStore?: Map<string, RateLimitBucket>
}

const store = globalForRateLimit.hireTrackRateLimitStore ?? new Map<string, RateLimitBucket>()

if (!globalForRateLimit.hireTrackRateLimitStore) {
  globalForRateLimit.hireTrackRateLimitStore = store
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs
    store.set(key, { count: 1, resetAt })
    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: new Date(resetAt),
    }
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt),
    }
  }

  existing.count += 1
  store.set(key, existing)

  return {
    success: true,
    remaining: options.limit - existing.count,
    resetAt: new Date(existing.resetAt),
  }
}

export function clearRateLimit(key: string) {
  store.delete(key)
}
