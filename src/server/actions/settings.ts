'use server'

import { requireAuth, requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Profile schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim(),
  avatar: z.string().url('Avatar must be a valid URL').or(z.string().length(0)).nullable().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth()

    const parsed = profileSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { name, avatar } = parsed.data

    await db.user.update({
      where: { id: user.id },
      data: {
        name,
        avatar: avatar || null,
      },
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: user.organizationId ?? '',
        entityType: 'USER',
        entityId: user.id,
        action: 'UPDATED',
        newValue: { name, avatar },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/settings')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'An unexpected error occurred while updating profile.' }
  }
}

// Organization schema
const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100).trim(),
  website: z.string().url('Website must be a valid URL').or(z.string().length(0)).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  size: z.string().max(50).nullable().optional(),
})

export type OrgInput = z.infer<typeof orgSchema>

export async function updateOrganizationAction(input: OrgInput): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId

    if (!orgId) {
      return { success: false, error: 'No organization found.' }
    }

    const parsed = orgSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { name, website, industry, size } = parsed.data

    await db.organization.update({
      where: { id: orgId },
      data: {
        name,
        website: website || null,
        industry: industry || null,
        size: size || null,
      },
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: orgId,
        action: 'UPDATED',
        newValue: { name, website, industry, size },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/settings')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to update organization:', error)
    return { success: false, error: 'An unexpected error occurred while updating organization settings.' }
  }
}
