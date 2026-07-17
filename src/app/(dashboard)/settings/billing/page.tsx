import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/features/settings/components/settings-tabs'
import { BillingView } from '@/features/settings/components/billing-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing & Subscriptions — Settings',
  description: 'Manage your organization subscription plan and billing rates.',
}

export default async function SettingsBillingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const role = session.user.role
  const orgId = session.user.organizationId

  // Only Workspace Owners or Super Admins can update organization billing info
  if (!orgId) {
    redirect('/onboarding')
  }

  if (role !== 'OWNER' && role !== 'SUPER_ADMIN') {
    redirect('/settings') // redirect non-authorized members
  }

  // 1. Fetch current subscription details
  const sub = await db.subscription.findUnique({
    where: { organizationId: orgId },
    include: { plan: true },
  })

  if (!sub || !sub.plan) {
    redirect('/pricing')
  }

  // 2. Fetch available pricing plans
  const plans = await db.plan.findMany({
    orderBy: {
      monthlyPrice: 'asc',
    },
  })

  const currentSubscription = {
    planName: sub.plan.name,
    billingPeriod: sub.billingPeriod,
    currentPeriodEnd: sub.currentPeriodEnd,
    status: sub.status,
  }

  const availablePlans = plans.map((plan) => ({
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    features: plan.features,
  }))

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your organization workspace and billing plans.
        </p>
      </div>

      <SettingsTabs />

      <BillingView
        currentSubscription={currentSubscription}
        availablePlans={availablePlans}
      />
    </div>
  )
}
