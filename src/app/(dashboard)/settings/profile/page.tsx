import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from '@/features/settings/components/profile-settings-form'
import { SettingsTabs } from '@/features/settings/components/settings-tabs'
import type { Metadata } from 'next'
import { ROLE_LABELS } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profile Settings — HireTrack AI',
  description: 'Manage your profile settings, display name, and avatar.',
}

export default async function ProfileSettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
  })

  if (!dbUser) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your organization workspace and profile settings.
        </p>
      </div>

      <SettingsTabs />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileSettingsForm
            initialData={{
              name: dbUser.name ?? '',
              email: dbUser.email,
              avatar: dbUser.avatar,
              role: ROLE_LABELS[dbUser.role] ?? dbUser.role,
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Security & Account Info
              </CardTitle>
              <CardDescription>Detailed information about your user profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">Email Address</div>
                <div className="text-sm font-medium text-foreground truncate">{dbUser.email}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">System Role</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold">{ROLE_LABELS[dbUser.role] ?? dbUser.role}</span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-4">
                <div className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">Account Created</div>
                <div className="text-sm text-foreground mt-1">
                  {new Date(dbUser.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
