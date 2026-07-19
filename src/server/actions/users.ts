'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { UserRole } from '@/types/enums'

import { sendEmail } from '@/lib/email'
import { checkUserLimit } from '@/lib/plan-limits'
import { getAppBaseUrl } from '@/lib/app-url'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  role: z.nativeEnum(UserRole),
})

export type InviteInput = z.infer<typeof inviteSchema>

export async function inviteUserAction(input: InviteInput): Promise<ActionResult<{ id: string; token: string }>> {
  try {
    const user = await requirePermission('users:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const parsed = inviteSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { email, role } = parsed.data

    // Check plan limits
    const limit = await checkUserLimit(orgId)
    if (!limit.allowed) {
      return {
        success: false,
        error: `Plan limit reached: You cannot add more than ${limit.max} active users on your current plan. Upgrade your subscription to add more team members.`,
      }
    }

    // Check if user is already in org
    const existingUser = await db.user.findFirst({
      where: { email, organizationId: orgId }
    })
    if (existingUser) {
      return { success: false, error: 'User is already a member of this organization.' }
    }

    // Check if active invitation already exists
    const existingInvite = await db.invitation.findFirst({
      where: { email, organizationId: orgId, accepted: false, expires: { gte: new Date() } }
    })
    if (existingInvite) {
      return { success: false, error: 'An active invitation has already been sent to this email.' }
    }

    // Fetch org name
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    })
    const orgName = org?.name ?? 'their organization'

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setDate(expires.getDate() + 7) // 7 days expiration

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        organizationId: orgId,
        token,
        expires,
      }
    })

    const inviteUrl = await getAppBaseUrl(`/auth/accept-invite?token=${token}`)

    await sendEmail({
      to: email,
      subject: `Invite to join ${orgName} on HireTrack AI`,
      text: `You have been invited to join ${orgName} as a ${role.toLowerCase().replace('_', ' ')}. Accept your invitation by opening this link: ${inviteUrl}`,
      html: `
        <p>You have been invited to join <strong>${orgName}</strong> on HireTrack AI.</p>
        <p>Your assigned role: <strong>${role.replace('_', ' ')}</strong></p>
        <p><a href="${inviteUrl}">Accept Invitation</a></p>
        <p>This link expires in 7 days.</p>
      `,
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'USER',
        entityId: invitation.id,
        action: 'USER_INVITED',
        newValue: { email, role, expires },
      }
    })

    revalidatePath('/settings/users')
    return { success: true, data: { id: invitation.id, token } }
  } catch (error) {
    console.error('Failed to invite user:', error)
    return { success: false, error: 'An unexpected error occurred while inviting the user.' }
  }
}

export async function revokeInvitationAction(id: string): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('users:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const invite = await db.invitation.findFirst({
      where: { id, organizationId: orgId }
    })
    if (!invite) return { success: false, error: 'Invitation not found.' }

    await db.invitation.delete({
      where: { id }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'USER',
        entityId: id,
        action: 'INVITATION_REVOKED',
        previousValue: { email: invite.email, role: invite.role },
      }
    })

    revalidatePath('/settings/users')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to revoke invitation:', error)
    return { success: false, error: 'An unexpected error occurred while revoking the invitation.' }
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: UserRole,
  customRoleId?: string | null,
  teamId?: string | null
): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('users:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    // Make sure we are not changing our own role
    if (userId === user.id) {
      return { success: false, error: 'You cannot modify your own role.' }
    }

    const targetUser = await db.user.findFirst({
      where: { id: userId, organizationId: orgId }
    })
    if (!targetUser) return { success: false, error: 'User not found.' }

    // If customRoleId is provided, verify it belongs to the org
    if (customRoleId) {
      const customRole = await db.role.findFirst({
        where: { id: customRoleId, organizationId: orgId }
      })
      if (!customRole) return { success: false, error: 'Custom role not found.' }
    }

    // If teamId is provided, verify it belongs to the org
    if (teamId) {
      const team = await db.team.findFirst({
        where: { id: teamId, organizationId: orgId }
      })
      if (!team) return { success: false, error: 'Team not found.' }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        role,
        customRoleId: customRoleId || null,
        teamId: teamId || null
      }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'USER',
        entityId: userId,
        action: 'USER_ROLE_UPDATED',
        previousValue: { role: targetUser.role, customRoleId: targetUser.customRoleId, teamId: targetUser.teamId },
        newValue: { role, customRoleId, teamId },
      }
    })

    revalidatePath('/settings/users')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return { success: false, error: 'An unexpected error occurred while updating the user role.' }
  }
}

export async function suspendUserAction(userId: string, suspend: boolean): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('users:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    if (userId === user.id) {
      return { success: false, error: 'You cannot suspend yourself.' }
    }

    const targetUser = await db.user.findFirst({
      where: { id: userId, organizationId: orgId }
    })
    if (!targetUser) return { success: false, error: 'User not found.' }

    await db.user.update({
      where: { id: userId },
      data: { isActive: !suspend }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'USER',
        entityId: userId,
        action: suspend ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
        newValue: { isActive: !suspend },
      }
    })

    // Force sign-out or session invalidation happens automatically on next middleware/actions load
    revalidatePath('/settings/users')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to toggle user suspension:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function removeUserAction(userId: string): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('users:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    if (userId === user.id) {
      return { success: false, error: 'You cannot remove yourself from the organization.' }
    }

    const targetUser = await db.user.findFirst({
      where: { id: userId, organizationId: orgId }
    })
    if (!targetUser) return { success: false, error: 'User not found.' }

    // Remove organization association, reset team, and downgrade role
    await db.user.update({
      where: { id: userId },
      data: {
        organizationId: null,
        teamId: null,
        customRoleId: null,
        role: 'VIEWER'
      }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'USER',
        entityId: userId,
        action: 'USER_REMOVED',
        previousValue: { email: targetUser.email, name: targetUser.name },
      }
    })

    revalidatePath('/settings/users')
    revalidatePath('/settings/users')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to remove user:', error)
    return { success: false, error: 'An unexpected error occurred while removing the user.' }
  }
}

import bcrypt from 'bcryptjs'

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>

export async function acceptInvitationAction(
  input: AcceptInvitationInput
): Promise<ActionResult<{ email: string }>> {
  try {
    const parsed = acceptInvitationSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { token, name, password } = parsed.data

    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { organization: true },
    })

    if (!invitation || invitation.accepted || invitation.expires < new Date()) {
      return {
        success: false,
        error: 'This invitation link is invalid or has expired.',
      }
    }

    const normalizedEmail = invitation.email.toLowerCase().trim()

    // Verify if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: invitation.role,
          organizationId: invitation.organizationId,
          emailVerified: new Date(),
        },
      }),
      db.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true },
      }),
      db.auditLog.create({
        data: {
          actorId: invitation.id, // Invitation identifier act as placeholder
          organizationId: invitation.organizationId,
          entityType: 'USER',
          entityId: invitation.id,
          action: 'USER_REGISTERED',
          newValue: { email: normalizedEmail, role: invitation.role },
        },
      }),
    ])

    return { success: true, data: { email: normalizedEmail } }
  } catch (error) {
    console.error('Failed to accept invitation:', error)
    return { success: false, error: 'An unexpected error occurred while accepting the invitation.' }
  }
}

