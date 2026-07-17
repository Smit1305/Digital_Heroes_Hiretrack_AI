/**
 * Unit tests for pipeline business logic constants.
 * Tests PIPELINE_STAGES, STAGE_LABELS, and STAGE_CONFIG invariants
 * without hitting the database.
 */
import { vi } from 'vitest'

// Mock everything that transitively requires a DB or auth connection
vi.mock('@/lib/db', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }))
vi.mock('@/lib/auth-utils', () => ({
  requirePermission: vi.fn(),
  requireAuth: vi.fn(),
}))

import { STAGE_CONFIG } from '@/features/pipeline/components/pipeline-stage-config'
import { PIPELINE_STAGES, STAGE_LABELS } from '@/features/pipeline/constants'
import { type ApplicationStage } from '@prisma/client'

const ALL_STAGES: ApplicationStage[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'TECHNICAL',
  'HR_ROUND',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
]

describe('PIPELINE_STAGES', () => {
  it('contains exactly 9 ATS stages', () => {
    expect(PIPELINE_STAGES).toHaveLength(9)
  })

  it('contains every ApplicationStage value', () => {
    for (const stage of ALL_STAGES) {
      expect(PIPELINE_STAGES).toContain(stage)
    }
  })

  it('starts with APPLIED', () => {
    expect(PIPELINE_STAGES[0]).toBe('APPLIED')
  })

  it('ends with WITHDRAWN', () => {
    expect(PIPELINE_STAGES[PIPELINE_STAGES.length - 1]).toBe('WITHDRAWN')
  })

  it('places HIRED before REJECTED', () => {
    const hiredIdx = PIPELINE_STAGES.indexOf('HIRED')
    const rejectedIdx = PIPELINE_STAGES.indexOf('REJECTED')
    expect(hiredIdx).toBeLessThan(rejectedIdx)
  })

  it('has no duplicate stages', () => {
    const unique = new Set(PIPELINE_STAGES)
    expect(unique.size).toBe(PIPELINE_STAGES.length)
  })
})

describe('STAGE_LABELS', () => {
  it('has a label for every stage', () => {
    for (const stage of ALL_STAGES) {
      expect(STAGE_LABELS[stage]).toBeTruthy()
      expect(typeof STAGE_LABELS[stage]).toBe('string')
    }
  })

  it('maps APPLIED to "Applied"', () => {
    expect(STAGE_LABELS.APPLIED).toBe('Applied')
  })

  it('maps HR_ROUND to "HR Round"', () => {
    expect(STAGE_LABELS.HR_ROUND).toBe('HR Round')
  })

  it('all labels are non-empty strings', () => {
    for (const stage of ALL_STAGES) {
      expect(STAGE_LABELS[stage].length).toBeGreaterThan(0)
    }
  })
})

describe('STAGE_CONFIG', () => {
  it('has config for every pipeline stage', () => {
    for (const stage of ALL_STAGES) {
      expect(STAGE_CONFIG[stage]).toBeDefined()
    }
  })

  it('every config has required fields', () => {
    for (const stage of ALL_STAGES) {
      const cfg = STAGE_CONFIG[stage]
      expect(cfg.label).toBeTruthy()
      expect(cfg.colour).toBeTruthy()
      expect(cfg.cardAccent).toBeTruthy()
      expect(cfg.bgClass).toBeTruthy()
    }
  })

  it('HIRED stage colour is green', () => {
    expect(STAGE_CONFIG.HIRED.colour).toContain('green')
  })

  it('REJECTED stage colour is red', () => {
    expect(STAGE_CONFIG.REJECTED.colour).toContain('red')
  })

  it('labels match STAGE_LABELS', () => {
    for (const stage of ALL_STAGES) {
      expect(STAGE_CONFIG[stage].label).toBe(STAGE_LABELS[stage])
    }
  })
})
