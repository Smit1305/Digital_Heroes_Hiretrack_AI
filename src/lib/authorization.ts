'use server'

import { requireAuth } from '@/lib/auth-utils'
import { db } from '@/lib/db'

export type ResourceType = 'job' | 'candidate' | 'application' | 'interview' | 'team' | 'offer'

/**
 * Row-level authorization: verifies the resource belongs to the user's organization.
 * Throws if unauthorized. Returns the validated orgId for further queries.
 *
 * @example
 * ```ts
 * const orgId = await assertCanAccess('job', jobId)
 * // safe to proceed with mutation
 * ```
 */
export async function assertCanAccess(
  resourceType: ResourceType,
  resourceId: string
): Promise<string> {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    throw new Error('User has no organization')
  }

  let belongsToOrg = false

  switch (resourceType) {
    case 'job': {
      const job = await db.job.findFirst({
        where: { id: resourceId, organizationId: orgId, deletedAt: null },
        select: { id: true },
      })
      belongsToOrg = !!job
      break
    }
    case 'candidate': {
      const candidate = await db.candidate.findFirst({
        where: { id: resourceId, organizationId: orgId, deletedAt: null },
        select: { id: true },
      })
      belongsToOrg = !!candidate
      break
    }
    case 'application': {
      const application = await db.application.findFirst({
        where: {
          id: resourceId,
          deletedAt: null,
          job: { organizationId: orgId },
        },
        select: { id: true },
      })
      belongsToOrg = !!application
      break
    }
    case 'interview': {
      const interview = await db.interview.findFirst({
        where: {
          id: resourceId,
          application: { job: { organizationId: orgId } },
        },
        select: { id: true },
      })
      belongsToOrg = !!interview
      break
    }
    case 'team': {
      const team = await db.team.findFirst({
        where: { id: resourceId, organizationId: orgId },
        select: { id: true },
      })
      belongsToOrg = !!team
      break
    }
    case 'offer': {
      const offer = await db.offer.findFirst({
        where: {
          id: resourceId,
          application: { job: { organizationId: orgId } },
        },
        select: { id: true },
      })
      belongsToOrg = !!offer
      break
    }
  }

  if (!belongsToOrg) {
    throw new Error(`Access denied: ${resourceType} not found in your organization`)
  }

  return orgId
}

/**
 * Lightweight version that just checks the user belongs to an org.
 * Returns the user and orgId.
 */
export async function requireOrgAccess() {
  const user = await requireAuth()
  const orgId = user.organizationId

  if (!orgId) {
    throw new Error('User has no organization')
  }

  return { user, orgId }
}
