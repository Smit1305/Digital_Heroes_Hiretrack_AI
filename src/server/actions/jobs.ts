'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult, PaginatedResponse } from '@/types/api'
import type { JobWithRelations } from '@/types/database'
import {
    createJobSchema,
    jobFiltersSchema,
    updateJobSchema,
    type CreateJobInput,
    type JobFiltersInput,
    type UpdateJobInput,
} from '@/validators/job'
import type { Job } from '@prisma/client'
import { checkJobLimit } from '@/lib/plan-limits'
import { revalidatePath } from 'next/cache'

// ─── List / Search ────────────────────────────────────────────────────────────

export async function getJobsAction(
  filters: Partial<JobFiltersInput>
): Promise<ActionResult<PaginatedResponse<JobWithRelations>>> {
  const user = await requirePermission('jobs:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = jobFiltersSchema.safeParse(filters)
  if (!parsed.success) return { success: false, error: 'Invalid filter parameters.' }

  const {
    query,
    status,
    department,
    employmentType,
    isRemote,
    hiringManagerId,
    page,
    pageSize,
    sortBy,
    sortOrder,
  } = parsed.data

  const where = {
    organizationId: orgId,
    deletedAt: null,
    ...(status && { status }),
    ...(department && { department: { contains: department, mode: 'insensitive' as const } }),
    ...(employmentType && { employmentType }),
    ...(isRemote !== undefined && { isRemote }),
    ...(hiringManagerId && { hiringManagerId }),
    ...(query && {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { department: { contains: query, mode: 'insensitive' as const } },
        { location: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [total, jobs] = await Promise.all([
    db.job.count({ where }),
    db.job.findMany({
      where,
      include: {
        hiringManager: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
        _count: { select: { applications: { where: { deletedAt: null } } } },
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
      data: jobs as JobWithRelations[],
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

// ─── Get Single Job ───────────────────────────────────────────────────────────

export async function getJobAction(
  id: string
): Promise<ActionResult<JobWithRelations>> {
  const user = await requirePermission('jobs:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const job = await db.job.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: {
      hiringManager: {
        select: { id: true, name: true, email: true, avatar: true, role: true },
      },
      _count: { select: { applications: { where: { deletedAt: null } } } },
    },
  })

  if (!job) return { success: false, error: 'Job not found.' }

  return { success: true, data: job as JobWithRelations }
}

// ─── Create Job ───────────────────────────────────────────────────────────────

export async function createJobAction(
  input: CreateJobInput
): Promise<ActionResult<Job>> {
  const user = await requirePermission('jobs:create')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = createJobSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // Check plan limits
  const limit = await checkJobLimit(orgId)
  if (!limit.allowed) {
    return {
      success: false,
      error: `Plan limit reached: You cannot add more than ${limit.max} active jobs on your current plan. Upgrade your subscription to list more jobs.`,
    }
  }

  const { hiringManagerId, ...data } = parsed.data

  // Validate hiring manager belongs to same org
  if (hiringManagerId) {
    const manager = await db.user.findFirst({
      where: { id: hiringManagerId, organizationId: orgId },
      select: { id: true },
    })
    if (!manager) return { success: false, error: 'Invalid hiring manager.' }
  }

  const job = await db.job.create({
    data: {
      ...data,
      organizationId: orgId,
      createdById: user.id,
      hiringManagerId: hiringManagerId ?? null,
      publishedAt: data.status === 'OPEN' ? new Date() : null,
    },
  })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'JOB',
      entityId: job.id,
      action: 'CREATED',
      jobId: job.id,
      organizationId: orgId,
      metadata: { jobTitle: job.title, status: job.status },
    },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      organizationId: orgId,
      entityType: 'JOB',
      entityId: job.id,
      action: 'CREATED',
      newValue: { title: job.title, status: job.status },
    },
  })

  revalidatePath('/jobs')
  revalidatePath('/dashboard')

  return { success: true, data: job, message: 'Job created successfully.' }
}

// ─── Update Job ───────────────────────────────────────────────────────────────

export async function updateJobAction(
  id: string,
  input: UpdateJobInput
): Promise<ActionResult<Job>> {
  const user = await requirePermission('jobs:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = updateJobSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const existing = await db.job.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true, status: true, title: true, publishedAt: true },
  })
  if (!existing) return { success: false, error: 'Job not found.' }

  // Validate hiring manager org membership
  if (parsed.data.hiringManagerId) {
    const manager = await db.user.findFirst({
      where: { id: parsed.data.hiringManagerId, organizationId: orgId },
      select: { id: true },
    })
    if (!manager) return { success: false, error: 'Invalid hiring manager.' }
  }

  // Auto-set publishedAt when status changes to OPEN
  const publishedAt =
    parsed.data.status === 'OPEN' && existing.status !== 'OPEN'
      ? new Date()
      : undefined

  const job = await db.job.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(publishedAt && { publishedAt }),
    },
  })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'JOB',
      entityId: id,
      action: parsed.data.status && parsed.data.status !== existing.status ? 'STATUS_CHANGED' : 'UPDATED',
      jobId: id,
      organizationId: orgId,
      metadata: { changes: Object.keys(parsed.data), jobTitle: job.title },
    },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      organizationId: orgId,
      entityType: 'JOB',
      entityId: id,
      action: 'UPDATED',
      previousValue: { title: existing.title, status: existing.status },
      newValue: { title: job.title, status: job.status },
    },
  })

  revalidatePath('/jobs')
  revalidatePath(`/jobs/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: job, message: 'Job updated successfully.' }
}

// ─── Delete Job (soft) ────────────────────────────────────────────────────────

export async function deleteJobAction(id: string): Promise<ActionResult<void>> {
  const user = await requirePermission('jobs:delete')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.job.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true, title: true, _count: { select: { applications: true } } },
  })
  if (!existing) return { success: false, error: 'Job not found.' }

  await db.job.update({ where: { id }, data: { deletedAt: new Date() } })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'JOB',
      entityId: id,
      action: 'DELETED',
      jobId: id,
      organizationId: orgId,
      metadata: { jobTitle: existing.title },
    },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      organizationId: orgId,
      entityType: 'JOB',
      entityId: id,
      action: 'DELETED',
      previousValue: { title: existing.title },
    },
  })

  revalidatePath('/jobs')
  revalidatePath('/dashboard')

  return { success: true, data: undefined, message: 'Job deleted.' }
}

// ─── Archive Job ──────────────────────────────────────────────────────────────

export async function archiveJobAction(id: string): Promise<ActionResult<Job>> {
  const user = await requirePermission('jobs:archive')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const existing = await db.job.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true, title: true, status: true },
  })
  if (!existing) return { success: false, error: 'Job not found.' }
  if (existing.status === 'ARCHIVED') return { success: false, error: 'Job is already archived.' }

  const job = await db.job.update({
    where: { id },
    data: { status: 'ARCHIVED', closedAt: new Date() },
  })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'JOB',
      entityId: id,
      action: 'STATUS_CHANGED',
      jobId: id,
      organizationId: orgId,
      metadata: { from: existing.status, to: 'ARCHIVED', jobTitle: existing.title },
    },
  })

  revalidatePath('/jobs')
  revalidatePath('/dashboard')

  return { success: true, data: job, message: 'Job archived.' }
}

// ─── Duplicate Job ────────────────────────────────────────────────────────────

export async function duplicateJobAction(id: string): Promise<ActionResult<Job>> {
  const user = await requirePermission('jobs:create')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const source = await db.job.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  })
  if (!source) return { success: false, error: 'Job not found.' }

  // Destructure fields we don't want to copy
  const { id: _id, createdAt: _ca, updatedAt: _ua, deletedAt: _da, publishedAt: _pa, closedAt: _cla, ...rest } = source

  const job = await db.job.create({
    data: {
      ...rest,
      title: `${source.title} (Copy)`,
      status: 'DRAFT',
      organizationId: orgId,
      createdById: user.id,
      publishedAt: null,
      closedAt: null,
    },
  })

  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'JOB',
      entityId: job.id,
      action: 'CREATED',
      jobId: job.id,
      organizationId: orgId,
      metadata: { jobTitle: job.title, duplicatedFrom: source.id },
    },
  })

  revalidatePath('/jobs')

  return { success: true, data: job, message: `Duplicated as "${job.title}".` }
}

// ─── Get Departments (for filter autocomplete) ────────────────────────────────

export async function getJobDepartmentsAction(): Promise<ActionResult<string[]>> {
  const user = await requirePermission('jobs:read')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const rows = await db.job.findMany({
    where: { organizationId: orgId, deletedAt: null, department: { not: null } },
    select: { department: true },
    distinct: ['department'],
    orderBy: { department: 'asc' },
  })

  return {
    success: true,
    data: rows.map((r) => r.department).filter((d): d is string => Boolean(d)),
  }
}
