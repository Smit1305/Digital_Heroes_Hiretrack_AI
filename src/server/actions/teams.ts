'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50).trim(),
  description: z.string().max(200, 'Description cannot exceed 200 characters').trim().optional().nullable(),
})

export type TeamInput = z.infer<typeof teamSchema>

export async function createTeamAction(input: TeamInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const parsed = teamSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { name, description } = parsed.data

    // Check duplicate name
    const existing = await db.team.findUnique({
      where: { name_organizationId: { name, organizationId: orgId } }
    })
    if (existing) {
      return {
        success: false,
        error: 'A team with this name already exists in your organization.',
      }
    }

    const team = await db.team.create({
      data: {
        name,
        description,
        organizationId: orgId,
      }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: team.id,
        action: 'TEAM_CREATED',
        newValue: { name, description },
      }
    })

    revalidatePath('/settings/teams')
    return { success: true, data: { id: team.id } }
  } catch (error) {
    console.error('Failed to create team:', error)
    return { success: false, error: 'An unexpected error occurred while creating the team.' }
  }
}

export async function updateTeamAction(id: string, input: TeamInput): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const parsed = teamSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { name, description } = parsed.data

    // Verify team belongs to organization
    const team = await db.team.findFirst({
      where: { id, organizationId: orgId }
    })
    if (!team) return { success: false, error: 'Team not found.' }

    // Check duplicate name if changed
    if (name.toLowerCase() !== team.name.toLowerCase()) {
      const existing = await db.team.findUnique({
        where: { name_organizationId: { name, organizationId: orgId } }
      })
      if (existing) {
        return {
          success: false,
          error: 'A team with this name already exists in your organization.',
        }
      }
    }

    await db.team.update({
      where: { id },
      data: { name, description }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: id,
        action: 'TEAM_UPDATED',
        previousValue: { name: team.name, description: team.description },
        newValue: { name, description },
      }
    })

    revalidatePath('/settings/teams')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to update team:', error)
    return { success: false, error: 'An unexpected error occurred while updating the team.' }
  }
}

export async function deleteTeamAction(id: string): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const team = await db.team.findFirst({
      where: { id, organizationId: orgId }
    })
    if (!team) return { success: false, error: 'Team not found.' }

    await db.team.delete({
      where: { id }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: id,
        action: 'TEAM_DELETED',
        previousValue: { name: team.name },
      }
    })

    revalidatePath('/settings/teams')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to delete team:', error)
    return { success: false, error: 'An unexpected error occurred while deleting the team.' }
  }
}

export interface TeamAnalytics {
  activeJobsCount: number
  totalCandidatesCount: number
  hiredCandidatesCount: number
  jobs: Array<{ id: string; title: string; status: string; applicationsCount: number }>
}

export async function getTeamAnalyticsAction(id: string): Promise<ActionResult<TeamAnalytics>> {
  try {
    const user = await requirePermission('analytics:read')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const team = await db.team.findFirst({
      where: { id, organizationId: orgId }
    })
    if (!team) return { success: false, error: 'Team not found.' }

    // Fetch team jobs
    const jobs = await db.job.findMany({
      where: { teamId: id, organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        applications: {
          select: { id: true, stage: true }
        }
      }
    })

    const activeJobsCount = jobs.filter(j => j.status === 'OPEN').length
    
    let totalCandidatesCount = 0
    let hiredCandidatesCount = 0
    const jobsList = jobs.map(j => {
      const appCount = j.applications.length
      totalCandidatesCount += appCount
      hiredCandidatesCount += j.applications.filter(a => a.stage === 'HIRED').length
      return {
        id: j.id,
        title: j.title,
        status: j.status,
        applicationsCount: appCount
      }
    })

    return {
      success: true,
      data: {
        activeJobsCount,
        totalCandidatesCount,
        hiredCandidatesCount,
        jobs: jobsList
      }
    }
  } catch (error) {
    console.error('Failed to get team analytics:', error)
    return { success: false, error: 'An unexpected error occurred while fetching team analytics.' }
  }
}
