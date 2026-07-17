import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/features/settings/components/settings-tabs'
import type { Metadata } from 'next'
import { TeamsClient } from './teams-client'

export const metadata: Metadata = {
  title: 'Teams Management — HireTrack AI',
  description: 'Manage department teams, view team analytics and active positions.',
}

export default async function TeamsSettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    redirect('/onboarding')
  }

  const teams = await db.team.findMany({
    where: { organizationId: orgId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      },
      jobs: {
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
        }
      }
    },
    orderBy: { name: 'asc' },
  })

  // Convert schema results to clean props
  const formattedTeams = teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description,
    members: team.users,
    activeJobsCount: team.jobs.filter(j => j.status === 'OPEN').length,
  }))

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your organization workspace and profile settings.
        </p>
      </div>

      <SettingsTabs />

      <TeamsClient initialTeams={formattedTeams} />
    </div>
  )
}
