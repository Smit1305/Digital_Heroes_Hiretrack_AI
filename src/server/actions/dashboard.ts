'use server'

import { requireAuth } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import type {
    DashboardStats,
    HiringFunnelData,
    MonthlyHiringData,
    SourceData,
} from '@/types/database'
import { ApplicationStage } from '@prisma/client'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'

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

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    return { success: false, error: 'No organization found.' }
  }

  const [totalJobs, openPositions, totalCandidates, scheduledInterviews, offers, hires, totalApplied] =
    await Promise.all([
      // Total non-deleted jobs
      db.job.count({
        where: { organizationId: orgId, deletedAt: null },
      }),
      // Open jobs
      db.job.count({
        where: { organizationId: orgId, status: 'OPEN', deletedAt: null },
      }),
      // Total active candidates
      db.candidate.count({
        where: { organizationId: orgId, deletedAt: null },
      }),
      // Scheduled interviews (upcoming)
      db.interview.count({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { gte: new Date() },
          application: { job: { organizationId: orgId } },
        },
      }),
      // Applications in OFFER stage
      db.application.count({
        where: {
          stage: 'OFFER',
          deletedAt: null,
          job: { organizationId: orgId },
        },
      }),
      // Applications in HIRED stage
      db.application.count({
        where: {
          stage: 'HIRED',
          deletedAt: null,
          job: { organizationId: orgId },
        },
      }),
      // Total applications for conversion rate
      db.application.count({
        where: {
          deletedAt: null,
          job: { organizationId: orgId },
        },
      }),
    ])

  const conversionRate =
    totalApplied > 0 ? Math.round((hires / totalApplied) * 100 * 10) / 10 : 0

  return {
    success: true,
    data: {
      totalJobs,
      openPositions,
      totalCandidates,
      scheduledInterviews,
      offers,
      hires,
      conversionRate,
    },
  }
}

// ─── Hiring Funnel ───────────────────────────────────────────────────────────

export async function getHiringFunnelAction(): Promise<ActionResult<HiringFunnelData[]>> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    return { success: false, error: 'No organization found.' }
  }

  const counts = await db.application.groupBy({
    by: ['stage'],
    where: {
      deletedAt: null,
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
}

// ─── Monthly Hiring Data ─────────────────────────────────────────────────────

export async function getMonthlyHiringAction(): Promise<ActionResult<MonthlyHiringData[]>> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    return { success: false, error: 'No organization found.' }
  }

  const now = new Date()

  const months = await Promise.all(
    Array.from({ length: 6 }).map(async (_, index) => {
      const i = 5 - index
      const d = subMonths(now, i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const label = format(d, 'MMM')

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
}

// ─── Candidate Sources ───────────────────────────────────────────────────────

export async function getCandidateSourcesAction(): Promise<ActionResult<SourceData[]>> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    return { success: false, error: 'No organization found.' }
  }

  const sources = await db.candidate.groupBy({
    by: ['source'],
    where: {
      organizationId: orgId,
      deletedAt: null,
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  })

  const total = sources.reduce((acc, s) => acc + s._count.id, 0)

  const data: SourceData[] = sources.map((s) => ({
    source: s.source ?? 'Unknown',
    count: s._count.id,
    percentage: total > 0 ? Math.round((s._count.id / total) * 100) : 0,
  }))

  return { success: true, data }
}

// ─── Recent Applications ─────────────────────────────────────────────────────

export type RecentApplication = {
  id: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  department: string | null
  stage: ApplicationStage
  appliedAt: Date
}

export async function getRecentApplicationsAction(): Promise<ActionResult<RecentApplication[]>> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    return { success: false, error: 'No organization found.' }
  }

  const applications = await db.application.findMany({
    where: {
      deletedAt: null,
      job: { organizationId: orgId },
    },
    orderBy: { appliedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      stage: true,
      appliedAt: true,
      candidate: {
        select: { firstName: true, lastName: true, email: true },
      },
      job: {
        select: { title: true, department: true },
      },
    },
  })

  const data: RecentApplication[] = applications.map((app) => ({
    id: app.id,
    candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
    candidateEmail: app.candidate.email,
    jobTitle: app.job.title,
    department: app.job.department,
    stage: app.stage,
    appliedAt: app.appliedAt,
  }))

  return { success: true, data }
}

// ─── Upcoming Interviews ──────────────────────────────────────────────────────

export type UpcomingInterview = {
  id: string
  candidateName: string
  jobTitle: string
  scheduledAt: Date
  type: string
  interviewerName: string | null
  duration: number | null
}

export async function getUpcomingInterviewsAction(): Promise<ActionResult<UpcomingInterview[]>> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    return { success: false, error: 'No organization found.' }
  }

  const interviews = await db.interview.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { gte: new Date() },
      application: { job: { organizationId: orgId } },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 8,
    select: {
      id: true,
      scheduledAt: true,
      type: true,
      duration: true,
      candidate: { select: { firstName: true, lastName: true } },
      interviewer: { select: { name: true } },
      application: { select: { job: { select: { title: true } } } },
    },
  })

  const data: UpcomingInterview[] = interviews.map((iv) => ({
    id: iv.id,
    candidateName: `${iv.candidate.firstName} ${iv.candidate.lastName}`,
    jobTitle: iv.application.job.title,
    scheduledAt: iv.scheduledAt,
    type: iv.type,
    interviewerName: iv.interviewer.name,
    duration: iv.duration,
  }))

  return { success: true, data }
}
