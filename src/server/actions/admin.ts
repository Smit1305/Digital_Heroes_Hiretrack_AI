'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { ActionResult } from '@/types/api'
import { OrgPlan } from '@/types/enums'
import { revalidatePath } from 'next/cache'

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized. Super Admin access required.')
  }
}

export async function updateOrgPlanAction(
  orgId: string,
  plan: OrgPlan
): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin()

    const targetPlanName = plan === 'PRO' ? 'PROFESSIONAL' : plan
    const dbPlan = await db.plan.findUnique({
      where: { name: targetPlanName },
    })
    if (!dbPlan) throw new Error('Targeted plan not found.')

    await db.$transaction([
      db.organization.update({
        where: { id: orgId },
        data: { plan },
      }),
      db.subscription.update({
        where: { organizationId: orgId },
        data: { planId: dbPlan.id },
      }),
    ])

    revalidatePath('/admin')
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error('Failed to update organization plan:', error)
    return { success: false, error: error.message || 'Failed to update plan.' }
  }
}

export async function toggleOrgSubscriptionAction(
  orgId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin()

    await db.subscription.update({
      where: { organizationId: orgId },
      data: { status },
    })

    // If suspended, deactivate all organization users to lock them out immediately
    const isActive = status === 'ACTIVE'
    await db.user.updateMany({
      where: { organizationId: orgId },
      data: { isActive },
    })

    revalidatePath('/admin')
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error('Failed to toggle organization subscription status:', error)
    return { success: false, error: error.message || 'Failed to toggle status.' }
  }
}
