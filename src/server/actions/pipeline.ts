 'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import type { ApplicationWithDetails, KanbanColumn } from '@/types/database'
import { ApplicationStage } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { PIPELINE_STAGES, STAGE_LABELS } from '@/features/pipeline/constants'

// ─── Fetch pipeline columns ───────────────────────────────────────────────────

export async function getPipelineAction(
  jobId?: string
): Promise<ActionResult<KanbanColumn[]>> {
  const user = await requirePermission('applications:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const applications = await db.application.findMany({
    where: {
      deletedAt: null,
      job: { organizationId: orgId, deletedAt: null },
      ...(jobId && { jobId }),
    },
    orderBy: [{ stageOrder: 'asc' }, { appliedAt: 'asc' }],
    select: {
      id: true,
      candidateId: true,
      jobId: true,
      stage: true,
      score: true,
      appliedAt: true,
      stageOrder: true,
      rejectedAt: true,
      hiredAt: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      candidate: {
        select: { id: true, firstName: true, lastName: true, email: true, resumeUrl: true },
      },
      job: {
        select: { id: true, title: true, department: true, location: true },
      },
      interviews: {
        where: { status: { in: ['SCHEDULED', 'COMPLETED'] } },
        orderBy: { scheduledAt: 'desc' },
        take: 1,
        select: {
          id: true,
          scheduledAt: true,
          type: true,
          status: true,
          candidateId: true,
          applicationId: true,
          interviewerId: true,
          duration: true,
          feedback: true,
          rating: true,
          notes: true,
          location: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      notes: {
        where: { isPinned: true },
        take: 1,
        select: {
          id: true,
          content: true,
          authorId: true,
          candidateId: true,
          applicationId: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  // Build columns — one per stage, always present even if empty
  const columns: KanbanColumn[] = PIPELINE_STAGES.map((stage) => ({
    id: stage,
    label: STAGE_LABELS[stage],
    applications: applications
      .filter((a) => a.stage === stage)
      .map((a) => a as unknown as ApplicationWithDetails),
  }))

  return { success: true, data: columns }
}

// ─── Move application to new stage ───────────────────────────────────────────

export async function moveApplicationAction(
  applicationId: string,
  newStage: ApplicationStage,
  newOrder?: number
): Promise<ActionResult<void>> {
  const user = await requirePermission('applications:move')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.application.findFirst({
    where: {
      id: applicationId,
      deletedAt: null,
      job: { organizationId: orgId },
    },
    select: {
      id: true,
      stage: true,
      stageOrder: true,
      candidateId: true,
      jobId: true,
      job: { select: { title: true } },
      candidate: { select: { firstName: true, lastName: true } },
    },
  })
  if (!existing) return { success: false, error: 'Application not found.' }

  const previousStage = existing.stage
  if (previousStage === newStage && newOrder === undefined) {
    return { success: true, data: undefined } // no-op
  }

  await db.application.update({
    where: { id: applicationId },
    data: {
      stage: newStage,
      ...(newOrder !== undefined && { stageOrder: newOrder }),
      ...(newStage === 'HIRED' && { hiredAt: new Date() }),
      ...(newStage === 'REJECTED' && { rejectedAt: new Date() }),
      // Clear terminal timestamps when moving back
      ...(newStage !== 'HIRED' && previousStage === 'HIRED' && { hiredAt: null }),
      ...(newStage !== 'REJECTED' && previousStage === 'REJECTED' && { rejectedAt: null }),
    },
  })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      action: 'STAGE_CHANGED',
      candidateId: existing.candidateId,
      applicationId,
      jobId: existing.jobId,
      organizationId: orgId,
      metadata: {
        from: previousStage,
        to: newStage,
        candidateName: `${existing.candidate.firstName} ${existing.candidate.lastName}`,
        jobTitle: existing.job.title,
      },
    },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      organizationId: orgId,
      entityType: 'APPLICATION',
      entityId: applicationId,
      action: 'UPDATED',
      previousValue: { stage: previousStage },
      newValue: { stage: newStage },
    },
  })

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')

  return { success: true, data: undefined }
}

// ─── Reject application ───────────────────────────────────────────────────────

export async function rejectApplicationAction(
  applicationId: string
): Promise<ActionResult<void>> {
  return moveApplicationAction(applicationId, ApplicationStage.REJECTED)
}

// ─── Get jobs for pipeline filter ────────────────────────────────────────────

export type PipelineJob = { id: string; title: string; department: string | null }

export async function getPipelineJobsAction(): Promise<ActionResult<PipelineJob[]>> {
  const user = await requirePermission('applications:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const jobs = await db.job.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { in: ['OPEN', 'PAUSED'] },
      applications: { some: { deletedAt: null } },
    },
    select: { id: true, title: true, department: true },
    orderBy: { title: 'asc' },
  })

  return { success: true, data: jobs }
}
