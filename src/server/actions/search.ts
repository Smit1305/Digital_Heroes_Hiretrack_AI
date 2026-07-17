'use server'

import { requireAuth } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'

export interface GlobalSearchResults {
  jobs: { id: string; title: string; status: string }[]
  candidates: { id: string; name: string; email: string }[]
  teams: { id: string; name: string }[]
  settings: { name: string; href: string }[]
}

export async function searchGlobalAction(query: string): Promise<ActionResult<GlobalSearchResults>> {
  try {
    const user = await requireAuth()
    const orgId = user.organizationId
    if (!orgId) {
      return { success: false, error: 'No organization found.' }
    }

    const defaultSettings = [
      { name: 'Profile Settings', href: '/settings' },
      { name: 'Team Settings', href: '/settings/teams' },
      { name: 'User Directory & Invites', href: '/settings/users' },
      { name: 'Roles & Permissions Matrix', href: '/settings/roles' },
    ]

    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: {
          jobs: [],
          candidates: [],
          teams: [],
          settings: defaultSettings,
        },
      }
    }

    const cleanQuery = query.trim()

    const [jobs, candidates, teams] = await Promise.all([
      db.job.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          OR: [
            { title: { contains: cleanQuery, mode: 'insensitive' } },
            { department: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, status: true },
        take: 5,
      }),
      db.candidate.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          OR: [
            { firstName: { contains: cleanQuery, mode: 'insensitive' } },
            { lastName: { contains: cleanQuery, mode: 'insensitive' } },
            { email: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, email: true },
        take: 5,
      }),
      db.team.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { description: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true },
        take: 5,
      }),
    ])

    const filteredSettings = defaultSettings.filter((s) =>
      s.name.toLowerCase().includes(cleanQuery.toLowerCase())
    )

    const mappedCandidates = candidates.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      email: c.email,
    }))

    return {
      success: true,
      data: {
        jobs,
        candidates: mappedCandidates,
        teams,
        settings: filteredSettings,
      },
    }
  } catch (error) {
    console.error('Failed to perform global search:', error)
    return { success: false, error: 'An unexpected error occurred during global search.' }
  }
}
