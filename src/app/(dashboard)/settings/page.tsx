import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { OrgSettingsForm } from '@/features/settings/components/org-settings-form'
import { SettingsTabs } from '@/features/settings/components/settings-tabs'
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Organization Settings — HireTrack AI',
  description: 'Manage your organization settings and billing plan.',
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    redirect('/onboarding')
  }

  const org = await db.organization.findUnique({
    where: { id: orgId },
  })

  if (!org) {
    redirect('/onboarding')
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
          <OrgSettingsForm
            initialData={{
              name: org.name,
              slug: org.slug,
              website: org.website,
              industry: org.industry,
              size: org.size,
              plan: org.plan,
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Workspace Status
              </CardTitle>
              <CardDescription>Details about your current HireTrack workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">Workspace Slug</div>
                <div className="text-sm font-semibold font-mono bg-muted px-2.5 py-1.5 rounded-lg border border-border/50 text-foreground w-fit">
                  {org.slug}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">Billing Plan</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold uppercase">{org.plan} PLAN</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent text-[10px] uppercase font-bold py-0.5 px-2">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  PRO PLAN FEATURES
                </div>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Unlimited active hiring pipelines</li>
                  <li>AI-generated interview questions</li>
                  <li>Advanced analytics & recruiter dashboards</li>
                  <li>Unlimited applicant note pinning</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
