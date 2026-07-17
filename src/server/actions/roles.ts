'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import type { ActionResult } from '@/types/api'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(50).trim(),
  description: z.string().max(200, 'Description cannot exceed 200 characters').trim().optional().nullable(),
  permissionIds: z.array(z.string()).min(1, 'Select at least one permission'),
})

export type RoleInput = z.infer<typeof roleSchema>

export async function createRoleAction(input: RoleInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const parsed = roleSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { name, description, permissionIds } = parsed.data

    // Check duplicate name
    const existing = await db.role.findUnique({
      where: { name_organizationId: { name, organizationId: orgId } }
    })
    if (existing) {
      return {
        success: false,
        error: 'A role with this name already exists in your organization.',
      }
    }

    // Verify all permission ids exist
    const permissionsCount = await db.permission.count({
      where: { id: { in: permissionIds } }
    })
    if (permissionsCount !== permissionIds.length) {
      return { success: false, error: 'One or more selected permissions are invalid.' }
    }

    // Create role and map permissions in a transaction
    const role = await db.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          name,
          description,
          organizationId: orgId,
          isSystem: false,
        }
      })

      await tx.rolePermission.createMany({
        data: permissionIds.map(permId => ({
          roleId: newRole.id,
          permissionId: permId,
        }))
      })

      return newRole
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: role.id,
        action: 'ROLE_CREATED',
        newValue: { name, description, permissionIds },
      }
    })

    revalidatePath('/settings/roles')
    return { success: true, data: { id: role.id } }
  } catch (error) {
    console.error('Failed to create custom role:', error)
    return { success: false, error: 'An unexpected error occurred while creating the role.' }
  }
}

export async function updateRoleAction(id: string, input: RoleInput): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const parsed = roleSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { name, description, permissionIds } = parsed.data

    // Verify role belongs to organization
    const role = await db.role.findFirst({
      where: { id, organizationId: orgId }
    })
    if (!role) return { success: false, error: 'Role not found.' }
    if (role.isSystem) return { success: false, error: 'System roles cannot be modified.' }

    // Check duplicate name if changed
    if (name.toLowerCase() !== role.name.toLowerCase()) {
      const existing = await db.role.findUnique({
        where: { name_organizationId: { name, organizationId: orgId } }
      })
      if (existing) {
        return {
          success: false,
          error: 'A role with this name already exists in your organization.',
        }
      }
    }

    // Verify all permission ids exist
    const permissionsCount = await db.permission.count({
      where: { id: { in: permissionIds } }
    })
    if (permissionsCount !== permissionIds.length) {
      return { success: false, error: 'One or more selected permissions are invalid.' }
    }

    await db.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: { name, description }
      })

      // Sync role permissions: delete previous, add new
      await tx.rolePermission.deleteMany({ where: { roleId: id } })
      await tx.rolePermission.createMany({
        data: permissionIds.map(permId => ({
          roleId: id,
          permissionId: permId,
        }))
      })
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: id,
        action: 'ROLE_UPDATED',
        previousValue: { name: role.name, description: role.description },
        newValue: { name, description, permissionIds },
      }
    })

    revalidatePath('/settings/roles')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to update custom role:', error)
    return { success: false, error: 'An unexpected error occurred while updating the role.' }
  }
}

export async function deleteRoleAction(id: string): Promise<ActionResult<void>> {
  try {
    const user = await requirePermission('organization:manage')
    const orgId = user.organizationId
    if (!orgId) return { success: false, error: 'No organization found.' }

    const role = await db.role.findFirst({
      where: { id, organizationId: orgId }
    })
    if (!role) return { success: false, error: 'Role not found.' }
    if (role.isSystem) return { success: false, error: 'System roles cannot be deleted.' }

    // Users linked to this role will have their customRoleId set to null and default to their enum role
    await db.role.delete({
      where: { id }
    })

    await db.auditLog.create({
      data: {
        actorId: user.id,
        organizationId: orgId,
        entityType: 'ORGANIZATION',
        entityId: id,
        action: 'ROLE_DELETED',
        previousValue: { name: role.name },
      }
    })

    revalidatePath('/settings/roles')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to delete custom role:', error)
    return { success: false, error: 'An unexpected error occurred while deleting the role.' }
  }
}
