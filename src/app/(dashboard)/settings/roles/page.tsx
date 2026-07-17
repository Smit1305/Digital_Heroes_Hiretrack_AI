import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/features/settings/components/settings-tabs'
import type { Metadata } from 'next'
import { RolesClient } from './roles-client'

export const metadata: Metadata = {
  title: 'Roles & Permissions — HireTrack AI',
  description: 'Manage dynamic organizational roles and fine-grained permissions.',
}

export default async function RolesSettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    redirect('/onboarding')
  }

  // Fetch all organization roles + their permission mappings
  const roles = await db.role.findMany({
    where: { organizationId: orgId },
    include: {
      permissions: {
        select: {
          permissionId: true,
        }
      }
    },
    orderBy: [
      { isSystem: 'desc' },
      { name: 'asc' }
    ]
  })

  // Fetch all system permissions
  const permissions = await db.permission.findMany({
    orderBy: { name: 'asc' },
  })

  const formattedRoles = roles.map(role => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissionIds: role.permissions.map(p => p.permissionId),
  }))

  const formattedPermissions = permissions.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
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

      <RolesClient 
        initialRoles={formattedRoles} 
        permissions={formattedPermissions} 
      />
    </div>
  )
}
