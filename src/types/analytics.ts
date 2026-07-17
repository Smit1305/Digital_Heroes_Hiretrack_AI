import type { InterviewStatus, InterviewType, JobStatus, UserRole } from '@prisma/client'

// ─── KPI Overview ─────────────────────────────────────────────────────────────

export interface AnalyticsKPIs {
  totalApplications: number
  hires: number
  offers: number
  rejections: number
  conversionRate: number
  avgTimeToHireDays: number
  totalInterviews: number
  interviewCompletionRate: number
  offerAcceptanceRate: number
  avgInterviewRating: number | null
  totalCandidates: number
  activeCandidates: number
}

// ─── Stage Conversion ─────────────────────────────────────────────────────────

export interface ConversionStep {
  from: string
  to: string
  fromCount: number
  toCount: number
  rate: number // percentage
}

// ─── Interview Stats ──────────────────────────────────────────────────────────

export interface InterviewStatsByStatus {
  status: InterviewStatus
  count: number
  percentage: number
}

export interface InterviewStatsByType {
  type: InterviewType
  count: number
  percentage: number
}

export interface InterviewStats {
  total: number
  byStatus: InterviewStatsByStatus[]
  byType: InterviewStatsByType[]
  completionRate: number
  avgRating: number | null
  avgDurationMinutes: number | null
}

// ─── Top Jobs ─────────────────────────────────────────────────────────────────

export interface TopJobRow {
  id: string
  title: string
  department: string | null
  status: JobStatus
  applicationCount: number
  hireCount: number
  conversionRate: number // percentage
}

// ─── Recruiter Performance ────────────────────────────────────────────────────

export interface RecruiterRow {
  id: string
  name: string
  role: UserRole
  actionsCount: number
  hiresCount: number
}

import { z } from 'zod'

// ─── Time Range ───────────────────────────────────────────────────────────────

export const analyticsRangeSchema = z.enum(['7d', '30d', '90d', '1y']).default('30d')
export type AnalyticsRange = z.infer<typeof analyticsRangeSchema>

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '1y': 'Last 12 months',
}

// ─── Department Analytics ──────────────────────────────────────────────────────
export interface DepartmentAnalyticsRow {
  department: string
  openJobsCount: number
  applicationCount: number
  hireCount: number
}

// ─── Interview Success Ratings ──────────────────────────────────────────────────
export interface InterviewSuccessRow {
  recommendation: string // STRONG_HIRE, HIRE, NEUTRAL, NO_HIRE, STRONG_NO_HIRE
  count: number
  percentage: number
}
