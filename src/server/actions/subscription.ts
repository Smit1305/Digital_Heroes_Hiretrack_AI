'use server'

import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth-utils'
import type { ActionResult } from '@/types/api'
import { revalidatePath } from 'next/cache'

export async function updateSubscriptionAction(
  planName: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
  billingPeriod: 'MONTHLY' | 'YEARLY'
): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    // Fetch targeted plan
    const plan = await db.plan.findUnique({
      where: { name: planName },
    })
    if (!plan) {
      return { success: false, error: 'Targeted plan was not found.' }
    }

    // Set new expiration period
    const currentPeriodEnd = new Date()
    if (billingPeriod === 'YEARLY') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
    }

    // Perform database subscription update
    await db.$transaction([
      db.subscription.update({
        where: { organizationId: orgId },
        data: {
          planId: plan.id,
          billingPeriod,
          currentPeriodEnd,
          status: 'ACTIVE',
        },
      }),
      db.organization.update({
        where: { id: orgId },
        data: {
          plan: planName === 'PROFESSIONAL' ? 'PRO' : planName,
        },
      }),
      db.auditLog.create({
        data: {
          actorId: user.id,
          organizationId: orgId,
          entityType: 'ORGANIZATION',
          entityId: orgId,
          action: 'UPDATED',
          newValue: { plan: planName, billingPeriod },
        },
      }),
    ])

    revalidatePath('/settings/billing')
    return { success: true, data: undefined, message: `Successfully changed subscription to ${planName} (${billingPeriod.toLowerCase()}).` }
  } catch (error: any) {
    console.error('Failed to change subscription plan:', error)
    return { success: false, error: error.message || 'An unexpected error occurred.' }
  }
}
