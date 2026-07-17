/**
 * Unit tests for analytics business logic — RANGE_LABELS and type contract.
 */
import { RANGE_LABELS, type AnalyticsRange } from '@/types/analytics'

describe('RANGE_LABELS', () => {
  const validRanges: AnalyticsRange[] = ['7d', '30d', '90d', '1y']

  it('has a label for every valid range', () => {
    for (const range of validRanges) {
      expect(RANGE_LABELS[range]).toBeTruthy()
      expect(typeof RANGE_LABELS[range]).toBe('string')
    }
  })

  it('has exactly 4 ranges', () => {
    expect(Object.keys(RANGE_LABELS)).toHaveLength(4)
  })

  it('maps 7d to "Last 7 days"', () => {
    expect(RANGE_LABELS['7d']).toBe('Last 7 days')
  })

  it('maps 1y to "Last 12 months"', () => {
    expect(RANGE_LABELS['1y']).toBe('Last 12 months')
  })

  it('all labels are non-empty strings', () => {
    for (const label of Object.values(RANGE_LABELS)) {
      expect(label.length).toBeGreaterThan(0)
    }
  })
})

// ─── Conversion rate calculation logic ───────────────────────────────────────

describe('conversion rate calculation', () => {
  function calcConversionRate(fromCount: number, toCount: number): number {
    if (fromCount === 0) return 0
    return Math.round((toCount / fromCount) * 100)
  }

  it('returns 100% when from equals to', () => {
    expect(calcConversionRate(50, 50)).toBe(100)
  })

  it('returns 0% when no candidates move forward', () => {
    expect(calcConversionRate(100, 0)).toBe(0)
  })

  it('returns 0% when fromCount is 0 (no division by zero)', () => {
    expect(calcConversionRate(0, 0)).toBe(0)
  })

  it('calculates 50% conversion correctly', () => {
    expect(calcConversionRate(100, 50)).toBe(50)
  })

  it('rounds to nearest integer', () => {
    // 1/3 = 33.33...% → rounds to 33
    expect(calcConversionRate(3, 1)).toBe(33)
  })
})

// ─── Time-to-hire calculation logic ──────────────────────────────────────────

describe('average time to hire calculation', () => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24

  function calcAvgTimeToHireDays(pairs: Array<{ appliedAt: Date; hiredAt: Date }>): number {
    if (pairs.length === 0) return 0
    const totalDays = pairs.reduce((sum, { appliedAt, hiredAt }) => {
      return sum + (hiredAt.getTime() - appliedAt.getTime()) / MS_PER_DAY
    }, 0)
    return Math.round(totalDays / pairs.length)
  }

  it('returns 0 for empty array', () => {
    expect(calcAvgTimeToHireDays([])).toBe(0)
  })

  it('calculates 7 days correctly', () => {
    const appliedAt = new Date('2026-01-01')
    const hiredAt = new Date('2026-01-08')
    expect(calcAvgTimeToHireDays([{ appliedAt, hiredAt }])).toBe(7)
  })

  it('averages multiple hire durations', () => {
    const base = new Date('2026-01-01')
    const pairs = [
      { appliedAt: base, hiredAt: new Date(base.getTime() + 10 * MS_PER_DAY) }, // 10 days
      { appliedAt: base, hiredAt: new Date(base.getTime() + 20 * MS_PER_DAY) }, // 20 days
    ]
    expect(calcAvgTimeToHireDays(pairs)).toBe(15) // average
  })

  it('rounds fractional days', () => {
    const appliedAt = new Date('2026-01-01T00:00:00Z')
    const hiredAt = new Date('2026-01-01T12:00:00Z') // 0.5 days
    expect(calcAvgTimeToHireDays([{ appliedAt, hiredAt }])).toBe(1)
  })
})
