import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/features/settings/components/settings-tabs'
import type { Metadata } from 'next'
import { UsersClient } from './users-client'

export const metadata: Metadata = {
  title: 'User Management — HireTrack AI',
  description: 'Manage organization team members, update roles and teams, and send invites.',
}

export default async function UsersSettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    redirect('/onboarding')
  }

  // Fetch all organization users
  const users = await db.user.findMany({
    where: { organizationId: orgId },
    include: {
      team: { select: { id: true, name: true } },
      customRole: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'asc' },
  })

  // Fetch pending invitations
  const invitations = await db.invitation.findMany({
    where: { organizationId: orgId, accepted: false, expires: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch custom roles
  const customRoles = await db.role.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, isSystem: true },
    orderBy: { name: 'asc' },
  })

  // Fetch teams
  const teams = await db.team.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    isActive: u.isActive,
    teamId: u.teamId,
    teamName: u.team?.name ?? null,
    customRoleId: u.customRoleId,
    customRoleName: u.customRole?.name ?? null,
  }))

  const formattedInvites = invitations.map(i => ({
    id: i.id,
    email: i.email,
    role: i.role,
    expires: i.expires,
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

      <UsersClient 
        currentUserId={session.user.id}
        initialUsers={formattedUsers} 
        initialInvitations={formattedInvites}
        roles={customRoles}
        teams={teams}
      />
    </div>
  )
}
