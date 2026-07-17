import { db } from '@/lib/db'

interface LimitCheckResult {
  allowed: boolean
  max: number
  count: number
}

/**
  * Verifies if organization has seats remaining to invite team members.
  */
export async function checkUserLimit(orgId: string): Promise<LimitCheckResult> {
  const sub = await db.subscription.findUnique({
    where: { organizationId: orgId },
    include: { plan: true },
  })

  if (!sub || !sub.plan) {
    return { allowed: true, max: 999999, count: 0 } // Safe fallback
  }

  const count = await db.user.count({
    where: { organizationId: orgId, isActive: true },
  })

  return {
    allowed: count < sub.plan.maxUsers,
    max: sub.plan.maxUsers,
    count,
  }
}

/**
  * Verifies if organization has quotas remaining to publish active jobs.
  */
export async function checkJobLimit(orgId: string): Promise<LimitCheckResult> {
  const sub = await db.subscription.findUnique({
    where: { organizationId: orgId },
    include: { plan: true },
  })

  if (!sub || !sub.plan) {
    return { allowed: true, max: 999999, count: 0 }
  }

  const count = await db.job.count({
    where: {
      organizationId: orgId,
      status: { in: ['OPEN', 'PAUSED'] },
      deletedAt: null,
    },
  })

  return {
    allowed: count < sub.plan.maxJobs,
    max: sub.plan.maxJobs,
    count,
  }
}

/**
  * Verifies if organization has quota remaining to process more candidates.
  */
export async function checkCandidateLimit(orgId: string): Promise<LimitCheckResult> {
  const sub = await db.subscription.findUnique({
    where: { organizationId: orgId },
    include: { plan: true },
  })

  if (!sub || !sub.plan) {
    return { allowed: true, max: 999999, count: 0 }
  }

  const count = await db.candidate.count({
    where: { organizationId: orgId, deletedAt: null },
  })

  return {
    allowed: count < sub.plan.maxCandidates,
    max: sub.plan.maxCandidates,
    count,
  }
}
