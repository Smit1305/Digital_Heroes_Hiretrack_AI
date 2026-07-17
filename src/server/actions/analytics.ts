'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import {
  analyticsRangeSchema,
  type AnalyticsKPIs,
  type AnalyticsRange,
  type ConversionStep,
  type InterviewStats,
  type RecruiterRow,
  type TopJobRow,
  type DepartmentAnalyticsRow,
  type InterviewSuccessRow,
} from '@/types/analytics'
import type { ActionResult } from '@/types/api'
import type { HiringFunnelData, MonthlyHiringData, SourceData } from '@/types/database'
import { ApplicationStage } from '@prisma/client'
import { endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns'

function getDateLimits(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): { from: Date; to: Date } {
  if (dateFromStr && dateToStr) {
    const from = new Date(dateFromStr)
    const to = new Date(dateToStr)
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      // Set to end of the day for 'to' date to be inclusive
      to.setHours(23, 59, 59, 999)
      return { from, to }
    }
  }
  const days: Record<AnalyticsRange, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const daysCount = days[range] || 30
  const from = subDays(new Date(), daysCount)
  const to = new Date()
  return { from, to }
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  TECHNICAL: 'Technical',
  HR_ROUND: 'HR Round',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const FUNNEL_STAGES: ApplicationStage[] = [
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.TECHNICAL,
  ApplicationStage.HR_ROUND,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED,
]

// ─── Overview KPIs ─────────────────────────────────────────────────────────────

export async function getAnalyticsKPIsAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<AnalyticsKPIs>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    const [
      totalApplications,
      hires,
      offers,
      rejections,
      scheduledInterviews,
      completedInterviews,
      cancelledInterviews,
      noShowInterviews,
      hiredApps,
      avgRatingResult,
      totalCandidates,
      activeCandidates,
    ] = await Promise.all([
      db.application.count({
        where: { deletedAt: null, appliedAt: { gte: from, lte: to }, job: { organizationId: orgId } },
      }),
      db.application.count({
        where: { deletedAt: null, stage: 'HIRED', hiredAt: { gte: from, lte: to }, job: { organizationId: orgId } },
      }),
      db.application.count({
        where: { deletedAt: null, stage: 'OFFER', appliedAt: { gte: from, lte: to }, job: { organizationId: orgId } },
      }),
      db.application.count({
        where: { deletedAt: null, stage: 'REJECTED', rejectedAt: { gte: from, lte: to }, job: { organizationId: orgId } },
      }),
      db.interview.count({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { gte: from, lte: to },
          application: { job: { organizationId: orgId } },
        },
      }),
      db.interview.count({
        where: {
          status: 'COMPLETED',
          scheduledAt: { gte: from, lte: to },
          application: { job: { organizationId: orgId } },
        },
      }),
      db.interview.count({
        where: {
          status: 'CANCELLED',
          scheduledAt: { gte: from, lte: to },
          application: { job: { organizationId: orgId } },
        },
      }),
      db.interview.count({
        where: {
          status: 'NO_SHOW',
          scheduledAt: { gte: from, lte: to },
          application: { job: { organizationId: orgId } },
        },
      }),
      // For time-to-hire calculation
      db.application.findMany({
        where: {
          deletedAt: null,
          stage: 'HIRED',
          hiredAt: { gte: from, lte: to, not: null },
          job: { organizationId: orgId },
        },
        select: { appliedAt: true, hiredAt: true },
      }),
      // Avg interview rating
      db.interview.aggregate({
        where: {
          status: 'COMPLETED',
          rating: { not: null },
          scheduledAt: { gte: from, lte: to },
          application: { job: { organizationId: orgId } },
        },
        _avg: { rating: true },
      }),
      // Total candidates in org
      db.candidate.count({ where: { organizationId: orgId, deletedAt: null } }),
      // New candidates in range
      db.candidate.count({
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: from, lte: to } },
      }),
    ])

    // Compute avg time-to-hire in days
    const avgTimeToHireDays =
      hiredApps.length === 0
        ? 0
        : Math.round(
            hiredApps.reduce((sum, a) => {
              const diff = a.hiredAt
                ? (a.hiredAt.getTime() - a.appliedAt.getTime()) / (1000 * 60 * 60 * 24)
                : 0
              return sum + diff
            }, 0) / hiredApps.length
          )

    const totalInterviews =
      scheduledInterviews + completedInterviews + cancelledInterviews + noShowInterviews
    const interviewCompletionRate =
      totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0
    const conversionRate =
      totalApplications > 0 ? Math.round((hires / totalApplications) * 100 * 10) / 10 : 0
    const offerAcceptanceRate =
      offers > 0 ? Math.round((hires / offers) * 100) : 0

    return {
      success: true,
      data: {
        totalApplications,
        hires,
        offers,
        rejections,
        conversionRate,
        avgTimeToHireDays,
        totalInterviews,
        interviewCompletionRate,
        offerAcceptanceRate,
        avgInterviewRating: avgRatingResult._avg.rating
          ? Math.round(avgRatingResult._avg.rating * 10) / 10
          : null,
        totalCandidates,
        activeCandidates,
      },
    }
  } catch (error) {
    console.error('Failed to get analytics KPIs:', error)
    return { success: false, error: 'An unexpected error occurred while fetching KPIs.' }
  }
}

// ─── Hiring Funnel ─────────────────────────────────────────────────────────────

export async function getAnalyticsFunnelAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<HiringFunnelData[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    const counts = await db.application.groupBy({
      by: ['stage'],
      where: {
        deletedAt: null,
        appliedAt: { gte: from, lte: to },
        job: { organizationId: orgId },
      },
      _count: { id: true },
    })

    const countMap: Partial<Record<ApplicationStage, number>> = {}
    for (const row of counts) {
      countMap[row.stage] = row._count.id
    }

    const totalApplied = countMap[ApplicationStage.APPLIED] ?? 0

    const funnel: HiringFunnelData[] = FUNNEL_STAGES.map((stage) => {
      const count = countMap[stage] ?? 0
      return {
        stage,
        label: STAGE_LABELS[stage],
        count,
        percentage: totalApplied > 0 ? Math.round((count / totalApplied) * 100) : 0,
      }
    })

    return { success: true, data: funnel }
  } catch (error) {
    console.error('Failed to get funnel data:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Stage Conversion Rates ───────────────────────────────────────────────────

export async function getStageConversionAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<ConversionStep[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    const counts = await db.application.groupBy({
      by: ['stage'],
      where: {
        deletedAt: null,
        appliedAt: { gte: from, lte: to },
        job: { organizationId: orgId },
      },
      _count: { id: true },
    })

    const countMap: Partial<Record<ApplicationStage, number>> = {}
    for (const row of counts) {
      countMap[row.stage] = row._count.id
    }

    const steps: ConversionStep[] = []
    for (let i = 0; i < FUNNEL_STAGES.length - 1; i++) {
      const fromStage = FUNNEL_STAGES[i]
      const toStage = FUNNEL_STAGES[i + 1]
      if (!fromStage || !toStage) continue
      const fromCount = countMap[fromStage] ?? 0
      const toCount = countMap[toStage] ?? 0
      steps.push({
        from: STAGE_LABELS[fromStage],
        to: STAGE_LABELS[toStage],
        fromCount,
        toCount,
        rate: fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0,
      })
    }

    return { success: true, data: steps }
  } catch (error) {
    console.error('Failed to get conversion rates:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Monthly Trends (dynamic) ──────────────────────────────────────────────────

export async function getAnalyticsTrendsAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<MonthlyHiringData[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    let monthCount = range === '7d' ? 1 : range === '30d' ? 3 : range === '90d' ? 6 : 12
    const now = new Date()
    let baseDate = now

    if (dateFromStr && dateToStr) {
      const from = new Date(dateFromStr)
      const to = new Date(dateToStr)
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        monthCount = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1
        if (monthCount < 1) monthCount = 1
        baseDate = to
      }
    }

    const months = await Promise.all(
      Array.from({ length: monthCount }).map(async (_, index) => {
        const i = monthCount - 1 - index
        const d = subMonths(baseDate, i)
        const start = startOfMonth(d)
        const end = endOfMonth(d)
        const label = format(d, monthCount <= 3 ? 'MMM d' : 'MMM')

        const [applications, hires] = await Promise.all([
          db.application.count({
            where: {
              deletedAt: null,
              appliedAt: { gte: start, lte: end },
              job: { organizationId: orgId },
            },
          }),
          db.application.count({
            where: {
              deletedAt: null,
              stage: 'HIRED',
              hiredAt: { gte: start, lte: end },
              job: { organizationId: orgId },
            },
          }),
        ])

        return { month: label, applications, hires }
      })
    )

    return { success: true, data: months }
  } catch (error) {
    console.error('Failed to get trends data:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Candidate Sources ─────────────────────────────────────────────────────────

export async function getAnalyticsSourcesAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<SourceData[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    const sources = await db.candidate.groupBy({
      by: ['source'],
      where: { organizationId: orgId, deletedAt: null, createdAt: { gte: from, lte: to } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    })

    const total = sources.reduce((acc, s) => acc + s._count.id, 0)

    const data: SourceData[] = sources.map((s) => ({
      source: s.source ?? 'Unknown',
      count: s._count.id,
      percentage: total > 0 ? Math.round((s._count.id / total) * 100) : 0,
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Failed to get candidate sources:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Interview Stats ──────────────────────────────────────────────────────────

export async function getInterviewStatsAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<InterviewStats>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)
    const baseWhere = {
      scheduledAt: { gte: from, lte: to },
      application: { job: { organizationId: orgId } },
    }

    const [statusGroups, typeGroups, avgRating, avgDuration] = await Promise.all([
      db.interview.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true },
      }),
      db.interview.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: { id: true },
      }),
      db.interview.aggregate({
        where: { ...baseWhere, status: 'COMPLETED', rating: { not: null } },
        _avg: { rating: true },
      }),
      db.interview.aggregate({
        where: { ...baseWhere, status: 'COMPLETED', duration: { not: null } },
        _avg: { duration: true },
      }),
    ])

    const total = statusGroups.reduce((s, r) => s + r._count.id, 0)

    const byStatus = statusGroups.map((r) => ({
      status: r.status,
      count: r._count.id,
      percentage: total > 0 ? Math.round((r._count.id / total) * 100) : 0,
    }))

    const byType = typeGroups.map((r) => ({
      type: r.type,
      count: r._count.id,
      percentage: total > 0 ? Math.round((r._count.id / total) * 100) : 0,
    }))

    const completed = statusGroups.find((r) => r.status === 'COMPLETED')?._count.id ?? 0
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      success: true,
      data: {
        total,
        byStatus,
        byType,
        completionRate,
        avgRating: avgRating._avg.rating
          ? Math.round(avgRating._avg.rating * 10) / 10
          : null,
        avgDurationMinutes: avgDuration._avg.duration
          ? Math.round(avgDuration._avg.duration)
          : null,
      },
    }
  } catch (error) {
    console.error('Failed to get interview stats:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Top Performing Jobs ──────────────────────────────────────────────────────

export async function getTopJobsAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<TopJobRow[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    const jobs = await db.job.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        _count: {
          select: {
            applications: { where: { deletedAt: null, appliedAt: { gte: from, lte: to } } },
          },
        },
        applications: {
          where: { deletedAt: null, stage: 'HIRED', hiredAt: { gte: from, lte: to } },
          select: { id: true },
        },
      },
      orderBy: { applications: { _count: 'desc' } },
      take: 10,
    })

    const data: TopJobRow[] = jobs
      .filter((j) => j._count.applications > 0)
      .map((j) => ({
        id: j.id,
        title: j.title,
        department: j.department,
        status: j.status,
        applicationCount: j._count.applications,
        hireCount: j.applications.length,
        conversionRate:
          j._count.applications > 0
            ? Math.round((j.applications.length / j._count.applications) * 100)
            : 0,
      }))

    return { success: true, data }
  } catch (error) {
    console.error('Failed to get top jobs:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Recruiter Performance ────────────────────────────────────────────────────

export async function getRecruiterPerformanceAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<RecruiterRow[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    // Count stage-changes per actor (proxy for pipeline activity)
    const activityGroups = await db.activityLog.groupBy({
      by: ['actorId'],
      where: {
        organizationId: orgId,
        action: { in: ['STAGE_CHANGED', 'INTERVIEW_SCHEDULED', 'OFFER_SENT'] },
        createdAt: { gte: from, lte: to },
        actorId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    const actorIds = activityGroups
      .map((g) => g.actorId)
      .filter((id): id is string => id !== null)

    if (actorIds.length === 0) return { success: true, data: [] }

    const [users, hireCountsByActor] = await Promise.all([
      db.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, email: true, role: true },
      }),
      db.activityLog.groupBy({
        by: ['actorId'],
        where: {
          organizationId: orgId,
          action: 'STAGE_CHANGED',
          createdAt: { gte: from, lte: to },
          actorId: { in: actorIds },
          metadata: { path: ['to'], equals: 'HIRED' },
        },
        _count: { id: true },
      }),
    ])

    const userMap = new Map(users.map((u) => [u.id, u]))
    const hiresMap = new Map(
      hireCountsByActor.map((r) => [r.actorId, r._count.id])
    )

    const data: RecruiterRow[] = activityGroups
      .filter((g) => g.actorId && userMap.has(g.actorId))
      .map((g) => {
        const actorUser = userMap.get(g.actorId!)!
        return {
          id: actorUser.id,
          name: actorUser.name ?? actorUser.email ?? 'Unknown',
          role: actorUser.role,
          actionsCount: g._count.id,
          hiresCount: hiresMap.get(g.actorId!) ?? 0,
        }
      })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to get recruiter performance:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Department Analytics ──────────────────────────────────────────────────────

export async function getDepartmentAnalyticsAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<DepartmentAnalyticsRow[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    // Fetch jobs with department in this org
    const jobs = await db.job.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        department: true,
        status: true,
        _count: {
          select: {
            applications: { where: { deletedAt: null, appliedAt: { gte: from, lte: to } } },
          },
        },
        applications: {
          where: { deletedAt: null, stage: 'HIRED', hiredAt: { gte: from, lte: to } },
          select: { id: true },
        },
      },
    })

    // Group counts by department
    const deptMap = new Map<string, { openJobs: number; applications: number; hires: number }>()

    for (const job of jobs) {
      const dept = job.department?.trim() || 'General'
      const existing = deptMap.get(dept) || { openJobs: 0, applications: 0, hires: 0 }
      
      deptMap.set(dept, {
        openJobs: existing.openJobs + (job.status === 'OPEN' ? 1 : 0),
        applications: existing.applications + job._count.applications,
        hires: existing.hires + job.applications.length,
      })
    }

    const data: DepartmentAnalyticsRow[] = Array.from(deptMap.entries()).map(([dept, counts]) => ({
      department: dept,
      openJobsCount: counts.openJobs,
      applicationCount: counts.applications,
      chargeCount: undefined, // Type compatibility placeholder or match DepartmentAnalyticsRow schema
      hireCount: counts.hires,
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Failed to get department analytics:', error)
    return { success: false, error: 'An unexpected error occurred while fetching department analytics.' }
  }
}

// ─── Interview Success Ratings ──────────────────────────────────────────────────

export async function getInterviewSuccessAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<InterviewSuccessRow[]>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const { from, to } = getDateLimits(range, dateFromStr, dateToStr)

    // Fetch scorecards for completed interviews in this org within range
    const scorecards = await db.scorecard.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        interview: {
          status: 'COMPLETED',
          application: { job: { organizationId: orgId } }
        }
      },
      select: {
        recommendation: true
      }
    })

    const total = scorecards.length
    const counts: Record<string, number> = {
      STRONG_HIRE: 0,
      HIRE: 0,
      NEUTRAL: 0,
      NO_HIRE: 0,
      STRONG_NO_HIRE: 0,
    }

    for (const sc of scorecards) {
      const rec = sc.recommendation.toUpperCase().replace(/\s+/g, '_')
      if (counts[rec] !== undefined) {
        counts[rec]++
      } else {
        if (rec.includes('STRONG_HIRE')) counts.STRONG_HIRE++
        else if (rec.includes('STRONG_NO')) counts.STRONG_NO_HIRE++
        else if (rec.includes('HIRE') && !rec.includes('NO')) counts.HIRE++
        else if (rec.includes('NO_HIRE')) counts.NO_HIRE++
        else counts.NEUTRAL++
      }
    }

    const data: InterviewSuccessRow[] = Object.entries(counts).map(([rec, count]) => ({
      recommendation: rec.replace(/_/g, ' '),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Failed to get interview success ratings:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── Export data (updated) ──────────────────────────────────────────────────────

export type AnalyticsExportData = {
  kpis: AnalyticsKPIs
  funnel: HiringFunnelData[]
  sources: SourceData[]
  topJobs: TopJobRow[]
}

export async function getAnalyticsExportDataAction(
  range: AnalyticsRange = '30d',
  dateFromStr?: string,
  dateToStr?: string
): Promise<ActionResult<AnalyticsExportData>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const [kpisResult, funnelResult, sourcesResult, topJobsResult] = await Promise.all([
      getAnalyticsKPIsAction(range, dateFromStr, dateToStr),
      getAnalyticsFunnelAction(range, dateFromStr, dateToStr),
      getAnalyticsSourcesAction(range, dateFromStr, dateToStr),
      getTopJobsAction(range, dateFromStr, dateToStr),
    ])

    if (
      !kpisResult.success ||
      !funnelResult.success ||
      !sourcesResult.success ||
      !topJobsResult.success
    ) {
      return { success: false, error: 'Failed to gather export data.' }
    }

    return {
      success: true,
      data: {
        kpis: kpisResult.data,
        funnel: funnelResult.data,
        sources: sourcesResult.data,
        topJobs: topJobsResult.data,
      },
    }
  } catch (error) {
    console.error('Failed to get analytics export data:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
