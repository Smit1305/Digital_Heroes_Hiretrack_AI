'use server'

import { requireAuth } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import { z } from 'zod'

const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be 100 characters or less')
    .trim(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

export async function completeOnboardingAction(
  input: OnboardingInput
): Promise<ActionResult<{ organizationId: string }>> {
  const user = await requireAuth()

  // Already has an org
  if (user.organizationId) {
    return { success: true, data: { organizationId: user.organizationId } }
  }

  const parsed = onboardingSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { organizationName, industry, size } = parsed.data

  const slug = organizationName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const slugExists = await db.organization.findUnique({ where: { slug }, select: { id: true } })
  const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug

  const org = await db.organization.create({
    data: {
      name: organizationName,
      slug: finalSlug,
      plan: 'FREE',
      industry: industry ?? null,
      size: size ?? null,
    },
  })

  // Attach user to org and promote to RECRUITER
  await db.user.update({
    where: { id: user.id },
    data: {
      organizationId: org.id,
      role: 'RECRUITER',
    },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      organizationId: org.id,
      entityType: 'ORGANIZATION',
      entityId: org.id,
      action: 'CREATED',
      newValue: { name: organizationName, slug: finalSlug },
    },
  })

  return { success: true, data: { organizationId: org.id } }
}
