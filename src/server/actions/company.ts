'use server'

import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import { companyRegisterSchema, type CompanyRegisterInput } from '@/validators/company'
import bcrypt from 'bcryptjs'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function registerCompanyAction(
  input: CompanyRegisterInput
): Promise<ActionResult<{ email: string }>> {
  try {
    const parsed = companyRegisterSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { companyName, companySize, industry, fullName, email, password, plan, billingPeriod } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Verify email uniqueness
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists.',
        fieldErrors: { email: ['An account with this email already exists.'] },
      }
    }

    // 2. Fetch the corresponding plan record
    const targetPlanName = plan === 'PRO' ? 'PROFESSIONAL' : plan
    const dbPlan = await db.plan.findUnique({
      where: { name: targetPlanName },
    })

    if (!dbPlan) {
      return {
        success: false,
        error: 'The requested plan was not found.',
      }
    }

    // 3. Generate unique slug
    let baseSlug = slugify(companyName)
    if (!baseSlug) baseSlug = 'workspace'
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const existingOrg = await db.organization.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!existingOrg) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const passwordHash = await bcrypt.hash(password, 12)
    
    const subscriptionPeriodEnd = new Date()
    if (billingPeriod === 'YEARLY') {
      subscriptionPeriodEnd.setFullYear(subscriptionPeriodEnd.getFullYear() + 1)
    } else {
      subscriptionPeriodEnd.setMonth(subscriptionPeriodEnd.getMonth() + 1)
    }

    // 4. Database transaction setup
    const user = await db.$transaction(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          name: companyName,
          slug,
          industry,
          size: companySize,
          plan,
        },
      })

      // Create Subscription
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          planId: dbPlan.id,
          status: 'ACTIVE',
          billingPeriod,
          currentPeriodEnd: subscriptionPeriodEnd,
        },
      })

      // Create User with OWNER role
      const newUser = await tx.user.create({
        data: {
          name: fullName,
          email: normalizedEmail,
          passwordHash,
          role: 'OWNER',
          organizationId: org.id,
          emailVerified: new Date(), // Pre-verify owner email on checkout billing flow
        },
      })

      // Create initial audit log
      await tx.auditLog.create({
        data: {
          actorId: newUser.id,
          organizationId: org.id,
          entityType: 'ORGANIZATION',
          entityId: org.id,
          action: 'CREATED',
          newValue: { name: companyName, slug, plan },
        },
      })

      return newUser
    })

    return { success: true, data: { email: normalizedEmail } }
  } catch (error) {
    console.error('Company registration failed:', error)
    return { success: false, error: 'An unexpected error occurred during registration.' }
  }
}
