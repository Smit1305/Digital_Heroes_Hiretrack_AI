'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createRoleAction, updateRoleAction, deleteRoleAction } from '@/server/actions/roles'
import { Shield, Plus, ShieldCheck, Loader2, Save, Trash2, Edit2, Info } from 'lucide-react'

interface RoleData {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  permissionIds: string[]
}

interface PermissionData {
  id: string
  name: string
  description: string | null
}

interface RolesClientProps {
  initialRoles: RoleData[]
  permissions: PermissionData[]
}

export function RolesClient({ initialRoles, permissions }: RolesClientProps) {
  const router = useRouter()
  const [roles, setTeams] = useState<RoleData[]>(initialRoles)
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoles[0]?.id ?? '')
  
  // Dialog visibility states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Loading state
  const [isPending, setIsPending] = useState(false)

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', permissionIds: [] as string[] })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [editRoleId, setEditRoleId] = useState<string>('')

  const selectedRole = roles.find(r => r.id === selectedRoleId)

  // Group permissions by resource category for cleaner UI
  const getPermissionCategory = (name: string) => {
    if (name.startsWith('jobs:')) return 'Job Management'
    if (name.startsWith('candidates:')) return 'Candidate Directory'
    if (name.startsWith('applications:')) return 'Hiring Pipeline & Applications'
    if (name.startsWith('interviews:')) return 'Interviews & Evaluations'
    if (name.startsWith('reports:') || name.startsWith('analytics:')) return 'Analytics & Reports'
    return 'Organization Settings'
  }

  const categories = Array.from(new Set(permissions.map(p => getPermissionCategory(p.name))))

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '', permissionIds: [] })
    setFieldErrors({})
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (role: RoleData) => {
    setEditRoleId(role.id)
    setFormData({ 
      name: role.name, 
      description: role.description || '', 
      permissionIds: [...role.permissionIds] 
    })
    setFieldErrors({})
    setIsEditOpen(true)
  }

  const handleOpenDelete = (role: RoleData) => {
    setIsDeleteOpen(true)
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setFieldErrors({})

    const toastId = toast.loading('Creating custom role…')
    const result = await createRoleAction(formData)
    setIsPending(false)

    if (result.success) {
      toast.success('Custom role created successfully.', { id: toastId })
      setIsCreateOpen(false)
      router.refresh()
      
      const newRole: RoleData = {
        id: result.data.id,
        name: formData.name,
        description: formData.description || null,
        isSystem: false,
        permissionIds: formData.permissionIds
      }
      setTeams([...roles, newRole])
      setSelectedRoleId(newRole.id)
    } else {
      toast.error(result.error, { id: toastId })
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    }
  }

  const handleTogglePermission = (permId: string) => {
    if (!selectedRole || selectedRole.isSystem) return
    
    const isSelected = selectedRole.permissionIds.includes(permId)
    const updatedPermissionIds = isSelected 
      ? selectedRole.permissionIds.filter(id => id !== permId)
      : [...selectedRole.permissionIds, permId]

    setTeams(roles.map(r => 
      r.id === selectedRole.id 
        ? { ...r, permissionIds: updatedPermissionIds } 
        : r
    ))
  }

  const handleSavePermissions = async () => {
    if (!selectedRole || selectedRole.isSystem) return
    setIsPending(true)

    const toastId = toast.loading('Saving permissions…')
    const result = await updateRoleAction(selectedRole.id, {
      name: selectedRole.name,
      description: selectedRole.description,
      permissionIds: selectedRole.permissionIds
    })
    setIsPending(false)

    if (result.success) {
      toast.success('Permissions saved successfully.', { id: toastId })
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to save permissions.', { id: toastId })
    }
  }

  const handleEditRoleDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setFieldErrors({})

    const toastId = toast.loading('Updating role details…')
    const result = await updateRoleAction(editRoleId, {
      name: formData.name,
      description: formData.description,
      permissionIds: formData.permissionIds // Keep the dynamic permissions intact
    })
    setIsPending(false)

    if (result.success) {
      toast.success('Role details updated.', { id: toastId })
      setIsEditOpen(false)
      router.refresh()
      
      setTeams(roles.map(r => 
        r.id === editRoleId 
          ? { ...r, name: formData.name, description: formData.description || null } 
          : r
      ))
    } else {
      toast.error(result.error ?? 'Failed to update role.', { id: toastId })
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole || selectedRole.isSystem) return
    setIsPending(true)

    const toastId = toast.loading('Deleting custom role…')
    const result = await deleteRoleAction(selectedRole.id)
    setIsPending(false)

    if (result.success) {
      toast.success('Role deleted.', { id: toastId })
      setIsDeleteOpen(false)
      router.refresh()
      
      const remainingRoles = roles.filter(r => r.id !== selectedRole.id)
      setTeams(remainingRoles)
      setSelectedRoleId(remainingRoles[0]?.id ?? '')
    } else {
      toast.error(result.error ?? 'Failed to delete role.', { id: toastId })
    }
  }

  const handleDialogPermissionToggle = (permId: string) => {
    const isSelected = formData.permissionIds.includes(permId)
    const updatedIds = isSelected 
      ? formData.permissionIds.filter(id => id !== permId)
      : [...formData.permissionIds, permId]
    setFormData({ ...formData, permissionIds: updatedIds })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground">
            Configure dynamic system and custom authorization groups.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Role Selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Roles</div>
          <div className="flex flex-col gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left p-3.5 border rounded-lg hover:bg-muted/10 transition-colors flex items-center justify-between ${
                  selectedRoleId === role.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] uppercase font-bold py-px px-1">
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{role.description ?? 'No description.'}</p>
                </div>
                {!role.isSystem && selectedRoleId === role.id && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(role) }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive hover:bg-destructive/5"
                      onClick={(e) => { e.stopPropagation(); handleOpenDelete(role) }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Permission Details */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card>
              <CardHeader className="pb-3 border-b flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Permissions Mapping: {selectedRole.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedRole.description ?? 'No description provided.'}
                  </CardDescription>
                </div>

                {!selectedRole.isSystem && (
                  <Button 
                    onClick={handleSavePermissions} 
                    disabled={isPending}
                    size="sm" 
                    className="flex items-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Permissions
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-6">
                {selectedRole.isSystem && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-primary flex items-start gap-2.5 mb-6">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>System Default Role:</strong> This is a standard system role built into HireTrack AI. Its permissions are read-only and cannot be customized.
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {categories.map((category) => {
                    const categoryPermissions = permissions.filter(p => getPermissionCategory(p.name) === category)
                    
                    return (
                      <div key={category} className="space-y-3">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-1">
                          {category}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryPermissions.map((perm) => {
                            const isChecked = selectedRole.permissionIds.includes(perm.id)
                            
                            return (
                              <div 
                                key={perm.id} 
                                className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                                  isChecked ? 'border-primary/20 bg-primary/[0.02]' : 'border-border bg-card'
                                }`}
                              >
                                <Checkbox
                                  id={`perm-${perm.id}`}
                                  checked={isChecked}
                                  onCheckedChange={() => handleTogglePermission(perm.id)}
                                  disabled={selectedRole.isSystem || isPending}
                                  className="mt-0.5"
                                />
                                <div className="space-y-0.5 leading-none">
                                  <label 
                                    htmlFor={`perm-${perm.id}`} 
                                    className={`text-xs font-semibold select-none cursor-pointer ${
                                      selectedRole.isSystem ? 'cursor-not-allowed opacity-75' : ''
                                    }`}
                                  >
                                    {perm.name}
                                  </label>
                                  <p className="text-[10px] text-muted-foreground">
                                    {perm.description ?? 'No permission description.'}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <Shield className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-semibold text-sm">No role selected</h3>
              <p className="text-xs text-muted-foreground">Select a role on the left to edit permissions.</p>
            </Card>
          )}
        </div>
      </div>

      {/* CREATE CUSTOM ROLE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Name your custom role and select its baseline privileges.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="role-name" className="text-xs font-semibold text-foreground">Role Name</label>
              <Input
                id="role-name"
                placeholder="e.g. Lead Interviewer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isPending}
              />
              {fieldErrors.name && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="role-description" className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Textarea
                id="role-description"
                placeholder="Purpose of this role and accessibility level"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                rows={2}
              />
              {fieldErrors.description && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.description[0]}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground">Associate Permissions</label>
              {fieldErrors.permissionIds && (
                <p className="text-xs font-medium text-destructive mb-2">{fieldErrors.permissionIds[0]}</p>
              )}
              
              <div className="space-y-4 max-h-60 overflow-y-auto border rounded-md p-3 divide-y">
                {categories.map((category) => {
                  const categoryPermissions = permissions.filter(p => getPermissionCategory(p.name) === category)
                  
                  return (
                    <div key={category} className="pt-3 first:pt-0 space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{category}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map(perm => (
                          <div key={perm.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`dialog-perm-${perm.id}`}
                              checked={formData.permissionIds.includes(perm.id)}
                              onCheckedChange={() => handleDialogPermissionToggle(perm.id)}
                            />
                            <label htmlFor={`dialog-perm-${perm.id}`} className="text-xs select-none cursor-pointer">
                              {perm.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Create Custom Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CUSTOM ROLE DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role Details</DialogTitle>
            <DialogDescription>
              Update name and description details of this custom role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRoleDetails} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-role-name" className="text-xs font-semibold text-foreground">Role Name</label>
              <Input
                id="edit-role-name"
                placeholder="e.g. Lead Interviewer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isPending}
              />
              {fieldErrors.name && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-role-description" className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Textarea
                id="edit-role-description"
                placeholder="Purpose of this role"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                rows={3}
              />
              {fieldErrors.description && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.description[0]}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the custom role <strong className="text-foreground">"{selectedRole?.name}"</strong>? Any user assigned this custom role will lose their custom privileges and fallback to their system default role.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
