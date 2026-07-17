'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult, PaginatedResponse } from '@/types/api'
import type { InterviewWithDetails } from '@/types/database'
import {
    createInterviewSchema,
    updateInterviewSchema,
    submitScorecardSchema,
    type CreateInterviewInput,
    type UpdateInterviewInput,
    type SubmitScorecardInput,
} from '@/validators/interview'
import type { Interview, Scorecard } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ─── Interviewer select (matches UserSafe = Omit<User, 'passwordHash'>) ────────

const interviewerSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  avatar: true,
  role: true,
  organizationId: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const

// ─── Filter schema ────────────────────────────────────────────────────────────

const interviewFiltersSchema = z.object({
  query: z.string().optional(),
  status: z
    .enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'ALL'])
    .default('ALL'),
  type: z
    .enum(['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'HR', 'PANEL', 'ALL'])
    .default('ALL'),
  interviewerId: z.string().cuid().optional(),
  upcoming: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['scheduledAt', 'createdAt']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type InterviewFiltersInput = z.infer<typeof interviewFiltersSchema>

// ─── List interviews ──────────────────────────────────────────────────────────

export async function getInterviewsAction(
  filters: Partial<InterviewFiltersInput>
): Promise<ActionResult<PaginatedResponse<InterviewWithDetails>>> {
  const user = await requirePermission('interviews:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = interviewFiltersSchema.safeParse(filters)
  if (!parsed.success) return { success: false, error: 'Invalid filter parameters.' }

  const { query, status, type, interviewerId, upcoming, page, pageSize, sortBy, sortOrder } =
    parsed.data

  const where = {
    application: { job: { organizationId: orgId, deletedAt: null }, deletedAt: null },
    ...(status !== 'ALL' && { status }),
    ...(type !== 'ALL' && { type }),
    ...(interviewerId && { interviewerId }),
    ...(upcoming && { scheduledAt: { gte: new Date() }, status: 'SCHEDULED' as const }),
    ...(query && {
      OR: [
        { candidate: { firstName: { contains: query, mode: 'insensitive' as const } } },
        { candidate: { lastName: { contains: query, mode: 'insensitive' as const } } },
        { candidate: { email: { contains: query, mode: 'insensitive' as const } } },
        { application: { job: { title: { contains: query, mode: 'insensitive' as const } } } },
      ],
    }),
  }

  const [total, interviews] = await Promise.all([
    db.interview.count({ where }),
    db.interview.findMany({
      where,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        interviewer: { select: interviewerSelect },
        application: {
          select: {
            id: true,
            stage: true,
            job: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return {
    success: true,
    data: {
      data: interviews as unknown as InterviewWithDetails[],
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  }
}

// ─── Get single interview ─────────────────────────────────────────────────────

export async function getInterviewAction(
  id: string
): Promise<ActionResult<InterviewWithDetails>> {
  const user = await requirePermission('interviews:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const interview = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
      interviewer: { select: interviewerSelect },
      application: {
        select: {
          id: true,
          stage: true,
          job: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!interview) return { success: false, error: 'Interview not found.' }
  return { success: true, data: interview as unknown as InterviewWithDetails }
}

// ─── Create interview ─────────────────────────────────────────────────────────

export async function createInterviewAction(
  input: CreateInterviewInput
): Promise<ActionResult<Interview>> {
  const user = await requirePermission('interviews:create')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = createInterviewSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { candidateId, applicationId, interviewerId, ...rest } = parsed.data

  // Verify application belongs to org
  const application = await db.application.findFirst({
    where: { id: applicationId, candidateId, deletedAt: null, job: { organizationId: orgId } },
    select: {
      id: true,
      jobId: true,
      job: { select: { title: true } },
      candidate: { select: { firstName: true, lastName: true } },
    },
  })
  if (!application) return { success: false, error: 'Application not found.' }

  // Verify interviewer belongs to org
  const interviewer = await db.user.findFirst({
    where: { id: interviewerId, organizationId: orgId, isActive: true },
    select: { id: true, name: true },
  })
  if (!interviewer) return { success: false, error: 'Interviewer not found in your organization.' }

  const interview = await db.interview.create({
    data: { ...rest, candidateId, applicationId, interviewerId },
  })

  const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: interview.id,
        action: 'INTERVIEW_SCHEDULED',
        candidateId,
        applicationId,
        jobId: application.jobId,
        organizationId: orgId,
        metadata: {
          type: interview.type,
          scheduledAt: interview.scheduledAt,
          interviewerName: interviewer.name,
          jobTitle: application.job.title,
        },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: interview.id,
        action: 'CREATED',
        newValue: {
          type: interview.type,
          status: interview.status,
          scheduledAt: interview.scheduledAt,
          interviewerId,
          applicationId,
        },
      },
    }),
    db.notification.create({
      data: {
        userId: interviewerId,
        title: 'New Interview Assigned',
        body: `You have been assigned as the interviewer for ${candidateName}'s ${interview.type} round for the ${application.job.title} position, scheduled for ${new Date(interview.scheduledAt).toLocaleString()}.`,
        link: `/interviews`,
      },
    }),
  ])

  revalidatePath('/interviews')
  revalidatePath('/dashboard')

  return { success: true, data: interview, message: 'Interview scheduled.' }
}

// ─── Update interview ─────────────────────────────────────────────────────────

export async function updateInterviewAction(
  id: string,
  input: UpdateInterviewInput
): Promise<ActionResult<Interview>> {
  const user = await requirePermission('interviews:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = updateInterviewSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      status: true,
      type: true,
      scheduledAt: true,
      candidateId: true,
      applicationId: true,
      application: { select: { jobId: true } },
    },
  })
  if (!existing) return { success: false, error: 'Interview not found.' }

  const interview = await db.interview.update({ where: { id }, data: parsed.data })

  const activityAction =
    parsed.data.status === 'COMPLETED'
      ? 'INTERVIEW_COMPLETED'
      : parsed.data.status
        ? 'STATUS_CHANGED'
        : 'UPDATED'

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: id,
        action: activityAction as 'INTERVIEW_COMPLETED' | 'STATUS_CHANGED' | 'UPDATED',
        candidateId: existing.candidateId,
        applicationId: existing.applicationId,
        jobId: existing.application.jobId,
        organizationId: orgId,
        metadata: { changes: Object.keys(parsed.data), status: interview.status },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'UPDATED',
        previousValue: {
          status: existing.status,
          type: existing.type,
          scheduledAt: existing.scheduledAt,
        },
        newValue: {
          status: interview.status,
          type: interview.type,
          scheduledAt: interview.scheduledAt,
        },
      },
    }),
  ])

  revalidatePath('/interviews')
  revalidatePath('/dashboard')

  return { success: true, data: interview, message: 'Interview updated.' }
}

// ─── Reschedule interview ─────────────────────────────────────────────────────

export async function rescheduleInterviewAction(
  id: string,
  scheduledAt: Date,
  notes?: string
): Promise<ActionResult<Interview>> {
  const user = await requirePermission('interviews:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  if (!scheduledAt || scheduledAt <= new Date()) {
    return { success: false, error: 'New date must be in the future.' }
  }

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      candidateId: true,
      applicationId: true,
      interviewerId: true,
      candidate: { select: { firstName: true, lastName: true } },
      application: {
        select: {
          jobId: true,
          job: { select: { title: true } },
        },
      },
    },
  })
  if (!existing) return { success: false, error: 'Interview not found.' }
  if (existing.status === 'CANCELLED') {
    return { success: false, error: 'Cannot reschedule a cancelled interview.' }
  }
  if (existing.status === 'COMPLETED') {
    return { success: false, error: 'Cannot reschedule a completed interview.' }
  }

  const interview = await db.interview.update({
    where: { id },
    data: {
      scheduledAt,
      status: 'RESCHEDULED',
      ...(notes !== undefined && { notes }),
    },
  })

  const candidateName = `${existing.candidate.firstName} ${existing.candidate.lastName}`

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'UPDATED',
        candidateId: existing.candidateId,
        applicationId: existing.applicationId,
        jobId: existing.application.jobId,
        organizationId: orgId,
        metadata: {
          from: existing.scheduledAt,
          to: scheduledAt,
          status: 'RESCHEDULED',
        },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'RESCHEDULED',
        previousValue: { scheduledAt: existing.scheduledAt, status: existing.status },
        newValue: { scheduledAt, status: 'RESCHEDULED' },
      },
    }),
    db.notification.create({
      data: {
        userId: existing.interviewerId,
        title: 'Interview Rescheduled',
        body: `Your interview with ${candidateName} for ${existing.application.job.title} has been rescheduled to ${new Date(scheduledAt).toLocaleString()}.`,
        link: `/interviews`,
      },
    }),
  ])

  revalidatePath('/interviews')

  return { success: true, data: interview, message: 'Interview rescheduled.' }
}

// ─── Cancel interview ─────────────────────────────────────────────────────────

export async function cancelInterviewAction(id: string): Promise<ActionResult<Interview>> {
  const user = await requirePermission('interviews:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      status: true,
      candidateId: true,
      applicationId: true,
      interviewerId: true,
      candidate: { select: { firstName: true, lastName: true } },
      application: {
        select: {
          jobId: true,
          job: { select: { title: true } },
        },
      },
    },
  })
  if (!existing) return { success: false, error: 'Interview not found.' }
  if (existing.status === 'CANCELLED') {
    return { success: false, error: 'Interview is already cancelled.' }
  }

  const interview = await db.interview.update({ where: { id }, data: { status: 'CANCELLED' } })

  const candidateName = `${existing.candidate.firstName} ${existing.candidate.lastName}`

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'STATUS_CHANGED',
        candidateId: existing.candidateId,
        applicationId: existing.applicationId,
        jobId: existing.application.jobId,
        organizationId: orgId,
        metadata: { from: existing.status, to: 'CANCELLED' },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'CANCELLED',
        previousValue: { status: existing.status },
        newValue: { status: 'CANCELLED' },
      },
    }),
    db.notification.create({
      data: {
        userId: existing.interviewerId,
        title: 'Interview Cancelled',
        body: `Your interview with ${candidateName} for ${existing.application.job.title} has been cancelled.`,
        link: `/interviews`,
      },
    }),
  ])

  revalidatePath('/interviews')

  return { success: true, data: interview, message: 'Interview cancelled.' }
}

// ─── Mark no-show ─────────────────────────────────────────────────────────────

export async function markNoShowAction(id: string): Promise<ActionResult<Interview>> {
  const user = await requirePermission('interviews:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      status: true,
      candidateId: true,
      applicationId: true,
      application: { select: { jobId: true } },
    },
  })
  if (!existing) return { success: false, error: 'Interview not found.' }
  if (existing.status !== 'SCHEDULED' && existing.status !== 'RESCHEDULED') {
    return {
      success: false,
      error: 'Only scheduled or rescheduled interviews can be marked as no-show.',
    }
  }

  const interview = await db.interview.update({ where: { id }, data: { status: 'NO_SHOW' } })

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'STATUS_CHANGED',
        candidateId: existing.candidateId,
        applicationId: existing.applicationId,
        jobId: existing.application.jobId,
        organizationId: orgId,
        metadata: { from: existing.status, to: 'NO_SHOW' },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'NO_SHOW',
        previousValue: { status: existing.status },
        newValue: { status: 'NO_SHOW' },
      },
    }),
  ])

  revalidatePath('/interviews')

  return { success: true, data: interview, message: 'Marked as no-show.' }
}

// ─── Submit feedback ──────────────────────────────────────────────────────────

export async function submitFeedbackAction(
  id: string,
  feedback: string,
  rating: number
): Promise<ActionResult<Interview>> {
  const user = await requirePermission('interviews:feedback')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  if (!feedback.trim()) return { success: false, error: 'Feedback is required.' }
  if (rating < 1 || rating > 5) return { success: false, error: 'Rating must be between 1 and 5.' }

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      status: true,
      rating: true,
      candidateId: true,
      applicationId: true,
      application: { select: { jobId: true } },
    },
  })
  if (!existing) return { success: false, error: 'Interview not found.' }

  const interview = await db.interview.update({
    where: { id },
    data: { feedback: feedback.trim(), rating, status: 'COMPLETED' },
  })

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'INTERVIEW_COMPLETED',
        candidateId: existing.candidateId,
        applicationId: existing.applicationId,
        jobId: existing.application.jobId,
        organizationId: orgId,
        metadata: { rating, feedbackPreview: feedback.slice(0, 80) },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'FEEDBACK_SUBMITTED',
        previousValue: { status: existing.status, rating: existing.rating },
        newValue: { status: 'COMPLETED', rating, feedbackPreview: feedback.slice(0, 80) },
      },
    }),
  ])

  revalidatePath('/interviews')
  revalidatePath('/dashboard')

  return { success: true, data: interview, message: 'Feedback submitted.' }
}

// ─── Delete interview ─────────────────────────────────────────────────────────

export async function deleteInterviewAction(id: string): Promise<ActionResult<void>> {
  const user = await requirePermission('interviews:delete')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.interview.findFirst({
    where: { id, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      type: true,
      status: true,
      scheduledAt: true,
      candidateId: true,
      applicationId: true,
      application: { select: { jobId: true } },
    },
  })
  if (!existing) return { success: false, error: 'Interview not found.' }

  await db.interview.delete({ where: { id } })

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'DELETED',
        candidateId: existing.candidateId,
        applicationId: existing.applicationId,
        jobId: existing.application.jobId,
        organizationId: orgId,
        metadata: { type: existing.type, status: existing.status, scheduledAt: existing.scheduledAt },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'INTERVIEW',
        entityId: id,
        action: 'DELETED',
        previousValue: {
          type: existing.type,
          status: existing.status,
          scheduledAt: existing.scheduledAt,
        },
      },
    }),
  ])

  revalidatePath('/interviews')
  revalidatePath('/dashboard')

  return { success: true, data: undefined, message: 'Interview deleted.' }
}

// ─── Get interviewers (for form dropdown) ─────────────────────────────────────

export type InterviewerOption = {
  id: string
  name: string | null
  email: string | null
  role: string
}

export async function getInterviewersAction(): Promise<ActionResult<InterviewerOption[]>> {
  const user = await requirePermission('interviews:create')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const users = await db.user.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      role: { in: ['SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'] },
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })

  return { success: true, data: users }
}

// ─── Get applications for scheduling (candidate + job combos) ─────────────────

export type SchedulableApplication = {
  id: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  stage: string
}

export async function getSchedulableApplicationsAction(): Promise<
  ActionResult<SchedulableApplication[]>
> {
  const user = await requirePermission('interviews:create')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const apps = await db.application.findMany({
    where: {
      deletedAt: null,
      job: { organizationId: orgId, deletedAt: null },
      stage: { notIn: ['HIRED', 'REJECTED'] },
    },
    select: {
      id: true,
      stage: true,
      candidateId: true,
      candidate: { select: { firstName: true, lastName: true } },
      job: { select: { id: true, title: true } },
    },
    orderBy: { appliedAt: 'desc' },
    take: 200,
  })

  return {
    success: true,
    data: apps.map((a) => ({
      id: a.id,
      candidateId: a.candidateId,
      candidateName: `${a.candidate.firstName} ${a.candidate.lastName}`,
      jobId: a.job.id,
      jobTitle: a.job.title,
      stage: a.stage,
    })),
  }
}

// ─── Scorecard Operations ───────────────────────────────────────────────────

export async function submitScorecardAction(
  interviewId: string,
  input: SubmitScorecardInput
): Promise<ActionResult<Scorecard>> {
  const user = await requirePermission('interviews:feedback')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = submitScorecardSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { recommendation, summary, strengths, weaknesses, ratings } = parsed.data

  const interview = await db.interview.findFirst({
    where: { id: interviewId, application: { job: { organizationId: orgId } } },
    select: {
      id: true,
      candidateId: true,
      applicationId: true,
      interviewerId: true,
      candidate: { select: { firstName: true, lastName: true } },
      application: { select: { jobId: true, job: { select: { title: true } } } },
    },
  })

  if (!interview) return { success: false, error: 'Interview not found.' }

  const ratingKeys = Object.keys(ratings)
  const totalScore = ratingKeys.reduce((acc, key) => acc + (ratings[key] || 0), 0)
  const averageRating = ratingKeys.length > 0 ? Math.round(totalScore / ratingKeys.length) : 3

  const [scorecard] = await db.$transaction([
    db.scorecard.upsert({
      where: { interviewId },
      create: {
        interviewId,
        recommendation,
        summary,
        strengths,
        weaknesses,
        ratings,
      },
      update: {
        recommendation,
        summary,
        strengths,
        weaknesses,
        ratings,
      },
    }),
    db.interview.update({
      where: { id: interviewId },
      data: {
        status: 'COMPLETED',
        rating: averageRating,
        feedback: summary,
      },
    }),
    db.notification.create({
      data: {
        userId: user.id,
        title: `Scorecard Submitted`,
        body: `${user.name || user.email} submitted a scorecard for ${interview.candidate.firstName} ${interview.candidate.lastName}.`,
        link: `/candidates/${interview.candidateId}`,
      },
    }),
  ])

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'INTERVIEW',
      entityId: interviewId,
      action: 'INTERVIEW_COMPLETED',
      candidateId: interview.candidateId,
      applicationId: interview.applicationId,
      jobId: interview.application.jobId,
      organizationId: orgId,
      metadata: {
        recommendation,
        rating: averageRating,
      },
    },
  })

  revalidatePath('/interviews')
  revalidatePath(`/candidates/${interview.candidateId}`)
  revalidatePath('/dashboard')

  return { success: true, data: scorecard, message: 'Scorecard submitted successfully.' }
}

export async function getScorecardAction(interviewId: string): Promise<ActionResult<Scorecard | null>> {
  const user = await requirePermission('interviews:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const scorecard = await db.scorecard.findUnique({
    where: { interviewId },
  })

  return { success: true, data: scorecard }
}
