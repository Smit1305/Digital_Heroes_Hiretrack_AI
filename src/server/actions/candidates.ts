'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult, PaginatedResponse } from '@/types/api'
import type { CandidateWithApplications } from '@/types/database'
import {
    candidateFiltersSchema,
    createCandidateSchema,
    updateCandidateSchema,
    type CandidateFiltersInput,
    type CreateCandidateInput,
    type UpdateCandidateInput,
} from '@/validators/candidate'
import type { Candidate } from '@prisma/client'
import { checkCandidateLimit } from '@/lib/plan-limits'
import { revalidatePath } from 'next/cache'

// ─── List / Search ────────────────────────────────────────────────────────────

export async function getCandidatesAction(
  filters: Partial<CandidateFiltersInput>
): Promise<ActionResult<PaginatedResponse<CandidateWithApplications>>> {
  const user = await requirePermission('candidates:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = candidateFiltersSchema.safeParse(filters)
  if (!parsed.success) return { success: false, error: 'Invalid filter parameters.' }

  const { query, status, stage, jobId, source, experience, page, pageSize, sortBy, sortOrder } =
    parsed.data

  const where = {
    organizationId: orgId,
    deletedAt: null,
    ...(status && { status }),
    ...(source && { source: { contains: source, mode: 'insensitive' as const } }),
    ...(experience !== undefined && { experience: { gte: experience } }),
    ...(jobId && { applications: { some: { jobId, deletedAt: null } } }),
    ...(stage && { applications: { some: { stage, deletedAt: null } } }),
    ...(query && {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { location: { contains: query, mode: 'insensitive' as const } },
        { skills: { hasSome: [query] } },
      ],
    }),
  }

  const [total, candidates] = await Promise.all([
    db.candidate.count({ where }),
    db.candidate.findMany({
      where,
      include: {
        applications: {
          where: { deletedAt: null },
          orderBy: { appliedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            stage: true,
            appliedAt: true,
            score: true,
            candidateId: true,
            jobId: true,
            stageOrder: true,
            rejectedAt: true,
            hiredAt: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
            job: { select: { id: true, title: true, department: true } },
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
      data: candidates as CandidateWithApplications[],
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

// ─── Get Single Candidate ─────────────────────────────────────────────────────

export async function getCandidateAction(id: string): Promise<ActionResult<CandidateWithApplications>> {
  const user = await requirePermission('candidates:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const candidate = await db.candidate.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: {
      applications: {
        where: { deletedAt: null },
        orderBy: { appliedAt: 'desc' },
        select: {
          id: true,
          stage: true,
          appliedAt: true,
          score: true,
          candidateId: true,
          jobId: true,
          stageOrder: true,
          rejectedAt: true,
          hiredAt: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          job: { select: { id: true, title: true, department: true } },
          offer: true,
        },
      },
      interviews: {
        orderBy: { scheduledAt: 'desc' },
        include: {
          interviewer: { select: { id: true, name: true, email: true } },
          scorecard: true,
        },
      },
    },
  })

  if (!candidate) return { success: false, error: 'Candidate not found.' }
  return { success: true, data: candidate as CandidateWithApplications }
}

// ─── Create Candidate ─────────────────────────────────────────────────────────

export async function createCandidateAction(
  input: CreateCandidateInput
): Promise<ActionResult<Candidate>> {
  const user = await requirePermission('candidates:create')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = createCandidateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // Check plan limits
  const limit = await checkCandidateLimit(orgId)
  if (!limit.allowed) {
    return {
      success: false,
      error: `Plan limit reached: You cannot add more than ${limit.max} candidates on your current plan. Upgrade your subscription to process more candidates.`,
    }
  }

  // Check duplicate email within org
  const existing = await db.candidate.findFirst({
    where: { email: parsed.data.email, organizationId: orgId, deletedAt: null },
    select: { id: true },
  })
  if (existing) {
    return {
      success: false,
      error: 'A candidate with this email already exists.',
      fieldErrors: { email: ['A candidate with this email already exists.'] },
    }
  }

  // Sanitise optional URL fields
  const { linkedin, portfolio, website, ...rest } = parsed.data
  const candidate = await db.candidate.create({
    data: {
      ...rest,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      website: website || null,
      organizationId: orgId,
    },
  })

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'CANDIDATE',
        entityId: candidate.id,
        action: 'CREATED',
        candidateId: candidate.id,
        organizationId: orgId,
        metadata: { name: `${candidate.firstName} ${candidate.lastName}` },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'CANDIDATE',
        entityId: candidate.id,
        action: 'CREATED',
        newValue: { firstName: candidate.firstName, lastName: candidate.lastName, email: candidate.email },
      },
    }),
  ])

  revalidatePath('/candidates')
  revalidatePath('/dashboard')

  return { success: true, data: candidate, message: 'Candidate added successfully.' }
}

// ─── Update Candidate ─────────────────────────────────────────────────────────

export async function updateCandidateAction(
  id: string,
  input: UpdateCandidateInput
): Promise<ActionResult<Candidate>> {
  const user = await requirePermission('candidates:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = updateCandidateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const existing = await db.candidate.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true },
  })
  if (!existing) return { success: false, error: 'Candidate not found.' }

  // Duplicate email check (exclude current)
  if (parsed.data.email && parsed.data.email !== existing.email) {
    const dup = await db.candidate.findFirst({
      where: { email: parsed.data.email, organizationId: orgId, deletedAt: null, id: { not: id } },
      select: { id: true },
    })
    if (dup) {
      return {
        success: false,
        error: 'A candidate with this email already exists.',
        fieldErrors: { email: ['A candidate with this email already exists.'] },
      }
    }
  }

  const { linkedin, portfolio, website, ...rest } = parsed.data
  const candidate = await db.candidate.update({
    where: { id },
    data: {
      ...rest,
      ...(linkedin !== undefined && { linkedin: linkedin || null }),
      ...(portfolio !== undefined && { portfolio: portfolio || null }),
      ...(website !== undefined && { website: website || null }),
    },
  })

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'CANDIDATE',
        entityId: id,
        action: 'UPDATED',
        candidateId: id,
        organizationId: orgId,
        metadata: { changes: Object.keys(parsed.data) },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'CANDIDATE',
        entityId: id,
        action: 'UPDATED',
        previousValue: { firstName: existing.firstName, lastName: existing.lastName },
        newValue: { firstName: candidate.firstName, lastName: candidate.lastName },
      },
    }),
  ])

  revalidatePath('/candidates')
  revalidatePath(`/candidates/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: candidate, message: 'Candidate updated.' }
}

// ─── Delete Candidate (soft) ──────────────────────────────────────────────────

export async function deleteCandidateAction(id: string): Promise<ActionResult<void>> {
  const user = await requirePermission('candidates:delete')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.candidate.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true, firstName: true, lastName: true },
  })
  if (!existing) return { success: false, error: 'Candidate not found.' }

  await db.candidate.update({ where: { id }, data: { deletedAt: new Date() } })

  await Promise.all([
    db.activityLog.create({
      data: {
        actorId: user.id,
        entityType: 'CANDIDATE',
        entityId: id,
        action: 'DELETED',
        candidateId: id,
        organizationId: orgId,
        metadata: { name: `${existing.firstName} ${existing.lastName}` },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'CANDIDATE',
        entityId: id,
        action: 'DELETED',
        previousValue: { firstName: existing.firstName, lastName: existing.lastName },
      },
    }),
  ])

  revalidatePath('/candidates')
  revalidatePath('/dashboard')

  return { success: true, data: undefined, message: 'Candidate deleted.' }
}

// ─── Update Status ────────────────────────────────────────────────────────────

export async function updateCandidateStatusAction(
  id: string,
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
): Promise<ActionResult<Candidate>> {
  const user = await requirePermission('candidates:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.candidate.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true, status: true, firstName: true, lastName: true },
  })
  if (!existing) return { success: false, error: 'Candidate not found.' }

  const candidate = await db.candidate.update({ where: { id }, data: { status } })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'CANDIDATE',
      entityId: id,
      action: 'STATUS_CHANGED',
      candidateId: id,
      organizationId: orgId,
      metadata: { from: existing.status, to: status },
    },
  })

  revalidatePath('/candidates')
  revalidatePath(`/candidates/${id}`)

  return { success: true, data: candidate, message: `Status updated to ${status.toLowerCase()}.` }
}

// ─── Add Note ─────────────────────────────────────────────────────────────────

export async function addCandidateNoteAction(
  candidateId: string,
  content: string,
  applicationId?: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission('candidates:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  if (!content.trim()) return { success: false, error: 'Note content is required.' }
  if (content.length > 5000) return { success: false, error: 'Note is too long.' }

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, organizationId: orgId, deletedAt: null },
    select: { id: true },
  })
  if (!candidate) return { success: false, error: 'Candidate not found.' }

  const note = await db.note.create({
    data: {
      content: content.trim(),
      authorId: user.id,
      candidateId,
      applicationId: applicationId ?? null,
    },
  })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'NOTE',
      entityId: note.id,
      action: 'NOTE_ADDED',
      candidateId,
      applicationId: applicationId ?? null,
      organizationId: orgId,
      metadata: { preview: content.slice(0, 80) },
    },
  })

  revalidatePath(`/candidates/${candidateId}`)

  return { success: true, data: { id: note.id }, message: 'Note added.' }
}

// ─── Get Candidate Notes ──────────────────────────────────────────────────────

export type CandidateNote = {
  id: string
  content: string
  isPinned: boolean
  createdAt: Date
  author: { id: string; name: string | null; email: string | null }
}

export async function getCandidateNotesAction(
  candidateId: string
): Promise<ActionResult<CandidateNote[]>> {
  const user = await requirePermission('candidates:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, organizationId: orgId, deletedAt: null },
    select: { id: true },
  })
  if (!candidate) return { success: false, error: 'Candidate not found.' }

  const notes = await db.note.findMany({
    where: { candidateId },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      content: true,
      isPinned: true,
      createdAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
  })

  return { success: true, data: notes }
}

// ─── Get Activity Timeline ────────────────────────────────────────────────────

export type CandidateActivity = {
  id: string
  action: string
  metadata: unknown
  createdAt: Date
  actor: { id: string; name: string | null; email: string | null } | null
}

export async function getCandidateActivityAction(
  candidateId: string
): Promise<ActionResult<CandidateActivity[]>> {
  const user = await requirePermission('candidates:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, organizationId: orgId, deletedAt: null },
    select: { id: true },
  })
  if (!candidate) return { success: false, error: 'Candidate not found.' }

  const logs = await db.activityLog.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
      actor: { select: { id: true, name: true, email: true } },
    },
  })

  return { success: true, data: logs }
}

// ─── Get Sources (for filter) ─────────────────────────────────────────────────

export async function getCandidateSourcesListAction(): Promise<ActionResult<string[]>> {
  const user = await requirePermission('candidates:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const rows = await db.candidate.findMany({
    where: { organizationId: orgId, deletedAt: null, source: { not: null } },
    select: { source: true },
    distinct: ['source'],
    orderBy: { source: 'asc' },
  })

  return {
    success: true,
    data: rows.map((r) => r.source).filter((s): s is string => Boolean(s)),
  }
}
