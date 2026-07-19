'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  inviteUserAction, 
  createEmployeeAction,
  revokeInvitationAction, 
  updateUserRoleAction, 
  suspendUserAction, 
  removeUserAction 
} from '@/server/actions/users'
import { UserRole } from '@/types/enums'
import { ROLE_LABELS } from '@/lib/permissions'
import { 
  UserPlus, 
  Mail, 
  Calendar, 
  UserX, 
  Ban, 
  CheckCircle2, 
  Loader2, 
  Undo2, 
  Trash2,
  ShieldCheck,
  Briefcase
} from 'lucide-react'

interface UserData {
  id: string
  name: string | null
  email: string
  avatar: string | null
  role: UserRole
  isActive: boolean
  teamId: string | null
  teamName: string | null
  customRoleId: string | null
  customRoleName: string | null
}

interface InvitationData {
  id: string
  email: string
  role: UserRole
  expires: Date
}

interface UsersClientProps {
  currentUserId: string
  initialUsers: UserData[]
  initialInvitations: InvitationData[]
  roles: Array<{ id: string; name: string; isSystem: boolean }>
  teams: Array<{ id: string; name: string }>
}

export function UsersClient({ 
  currentUserId,
  initialUsers, 
  initialInvitations, 
  roles, 
  teams 
}: UsersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [invitations, setInvitations] = useState<InvitationData[]>(initialInvitations)
  
  // Dialog visibility states
  const [isInviteOpen, setIsInviteOpen] = useState(searchParams.get('invite') === 'true')
  const [isSuspendOpen, setIsSuspendOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('invite') === 'true') {
      setIsInviteOpen(true)
    }
  }, [searchParams])

  const handleCloseInvite = (open: boolean) => {
    setIsInviteOpen(open)
    if (!open && searchParams.get('invite') === 'true') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('invite')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // Loading state
  const [isPending, setIsPending] = useState(false)

  // Form states
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('VIEWER')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Direct Employee Creation States
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false)
  const [empName, setEmpName] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empPassword, setEmpPassword] = useState('')
  const [empRole, setEmpRole] = useState<UserRole>('RECRUITER')
  const [empTeamId, setEmpTeamId] = useState<string>('')

  const handleOpenCreateEmployee = () => {
    setEmpName('')
    setEmpEmail('')
    setEmpPassword('')
    setEmpRole('RECRUITER')
    setEmpTeamId('')
    setFieldErrors({})
    setIsCreateEmployeeOpen(true)
  }

  const handleCreateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setFieldErrors({})

    const toastId = toast.loading('Creating employee account…')
    const result = await createEmployeeAction({
      name: empName,
      email: empEmail,
      password: empPassword,
      role: empRole,
      teamId: empTeamId || null,
    })
    setIsPending(false)

    if (result.success) {
      toast.success('Employee account created successfully.', { id: toastId })
      setIsCreateEmployeeOpen(false)
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to create employee.', { id: toastId })
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    }
  }

  // Tab state
  const [activeTab, setActiveTab] = useState<'members' | 'suspended' | 'invitations'>('members')

  const handleOpenInvite = () => {
    setInviteEmail('')
    setInviteRole('VIEWER')
    setFieldErrors({})
    setIsInviteOpen(true)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setFieldErrors({})

    const toastId = toast.loading('Sending invitation…')
    const result = await inviteUserAction({ email: inviteEmail, role: inviteRole })
    setIsPending(false)

    if (result.success) {
      toast.success('Invitation sent successfully.', { id: toastId })
      setIsInviteOpen(false)
      router.refresh()
      
      const newInvite: InvitationData = {
        id: result.data.id,
        email: inviteEmail,
        role: inviteRole,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
      setInvitations([newInvite, ...invitations])
    } else {
      toast.error(result.error, { id: toastId })
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    }
  }

  const handleRevokeInvite = async (id: string) => {
    const toastId = toast.loading('Revoking invitation…')
    const result = await revokeInvitationAction(id)

    if (result.success) {
      toast.success('Invitation revoked.', { id: toastId })
      router.refresh()
      setInvitations(invitations.filter((i) => i.id !== id))
    } else {
      toast.error(result.error ?? 'Failed to revoke invitation.', { id: toastId })
    }
  }

  const handleUpdateRole = async (userId: string, role: UserRole, customRoleId: string | null) => {
    const toastId = toast.loading('Updating user role…')
    // Keep target user's current teamId
    const target = users.find(u => u.id === userId)
    const result = await updateUserRoleAction(userId, role, customRoleId, target?.teamId)

    if (result.success) {
      toast.success('Role updated successfully.', { id: toastId })
      router.refresh()
      
      const customRoleName = roles.find(r => r.id === customRoleId)?.name ?? null
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, role, customRoleId, customRoleName } 
          : u
      ))
    } else {
      toast.error(result.error ?? 'Failed to update role.', { id: toastId })
    }
  }

  const handleUpdateTeam = async (userId: string, teamId: string | null) => {
    const toastId = toast.loading('Assigning user to team…')
    const target = users.find(u => u.id === userId)
    if (!target) return

    const result = await updateUserRoleAction(userId, target.role, target.customRoleId, teamId)

    if (result.success) {
      toast.success('Team assignment updated.', { id: toastId })
      router.refresh()
      
      const teamName = teams.find(t => t.id === teamId)?.name ?? null
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, teamId, teamName } 
          : u
      ))
    } else {
      toast.error(result.error ?? 'Failed to update team assignment.', { id: toastId })
    }
  }

  const handleToggleSuspend = async () => {
    if (!selectedUser) return
    setIsPending(true)

    const isCurrentlySuspended = !selectedUser.isActive
    const toastId = toast.loading(isCurrentlySuspended ? 'Restoring user…' : 'Suspending user…')
    const result = await suspendUserAction(selectedUser.id, !isCurrentlySuspended)
    setIsPending(false)

    if (result.success) {
      toast.success(isCurrentlySuspended ? 'User restored.' : 'User suspended.', { id: toastId })
      setIsSuspendOpen(false)
      router.refresh()
      
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, isActive: isCurrentlySuspended } 
          : u
      ))
    } else {
      toast.error(result.error ?? 'Action failed.', { id: toastId })
    }
  }

  const handleRemoveUser = async () => {
    if (!selectedUser) return
    setIsPending(true)

    const toastId = toast.loading('Removing user from organization…')
    const result = await removeUserAction(selectedUser.id)
    setIsPending(false)

    if (result.success) {
      toast.success('User removed from organization.', { id: toastId })
      setIsRemoveOpen(false)
      router.refresh()
      setUsers(users.filter(u => u.id !== selectedUser.id))
    } else {
      toast.error(result.error ?? 'Failed to remove user.', { id: toastId })
    }
  }

  const activeMembers = users.filter(u => u.isActive)
  const suspendedMembers = users.filter(u => !u.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium tracking-tight">User Directory</h2>
          <p className="text-sm text-muted-foreground">
            Manage organization membership and permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenCreateEmployee} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create Employee Account
          </Button>
          <Button variant="outline" onClick={handleOpenInvite} className="flex items-center gap-1.5">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Invite via Email
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="border-b flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === 'members' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Members ({activeMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('suspended')}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === 'suspended' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Suspended ({suspendedMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === 'invitations' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Invites ({invitations.length})
          </button>
        </div>
      </div>

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Members</CardTitle>
            <CardDescription>Users who currently have access to the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">No active members found.</p>
            ) : (
              <div className="space-y-4">
                {activeMembers.map((member) => {
                  const initials = (member.name ?? member.email).split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  const isSelf = member.id === currentUserId

                  return (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors">
                      {/* Left: User Details */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar ?? undefined} alt={member.name ?? 'Member avatar'} />
                          <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            {member.name ?? 'Unverified User'}
                            {isSelf && <Badge variant="secondary" className="text-[9px] px-1 py-0.5">You</Badge>}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>

                      {/* Right: Actions and Dropdowns */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Team Selector */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Team</span>
                          <Select 
                            value={member.teamId ?? 'unassigned'} 
                            onValueChange={(val) => handleUpdateTeam(member.id, val === 'unassigned' ? null : val)}
                            disabled={isSelf}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[120px] bg-background border border-border">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
                              {teams.map(team => (
                                <SelectItem key={team.id} value={team.id} className="text-xs">{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Role Selector (System and Custom combined) */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">System Role</span>
                          <Select 
                            value={member.role} 
                            onValueChange={(val) => handleUpdateRole(member.id, val as UserRole, member.customRoleId)}
                            disabled={isSelf}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[120px] bg-background border border-border">
                              <SelectValue placeholder="System Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(ROLE_LABELS).map(roleKey => (
                                <SelectItem key={roleKey} value={roleKey} className="text-xs">{ROLE_LABELS[roleKey as UserRole]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Custom Role Selector */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Custom Role</span>
                          <Select 
                            value={member.customRoleId ?? 'none'} 
                            onValueChange={(val) => handleUpdateRole(member.id, member.role, val === 'none' ? null : val)}
                            disabled={isSelf}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[120px] bg-background border border-border">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-xs">None</SelectItem>
                              {roles.filter(r => !r.isSystem).map(r => (
                                <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Suspension / Delete button */}
                        {!isSelf && (
                          <div className="flex items-center gap-1.5 self-end">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => { setSelectedUser(member); setIsSuspendOpen(true) }}
                              title="Suspend User"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/5"
                              onClick={() => { setSelectedUser(member); setIsRemoveOpen(true) }}
                              title="Remove from Org"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SUSPENDED TAB */}
      {activeTab === 'suspended' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Suspended Members</CardTitle>
            <CardDescription>Members whose access has been temporarily revoked.</CardDescription>
          </CardHeader>
          <CardContent>
            {suspendedMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">No suspended members.</p>
            ) : (
              <div className="space-y-4">
                {suspendedMembers.map((member) => {
                  const initials = (member.name ?? member.email).split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

                  return (
                    <div key={member.id} className="flex flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 opacity-60">
                          <AvatarImage src={member.avatar ?? undefined} alt={member.name ?? 'Member avatar'} />
                          <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground line-through">
                            {member.name ?? 'Unverified User'}
                          </h4>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                          onClick={() => { setSelectedUser(member); handleToggleSuspend() }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Restore Account
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/5"
                          onClick={() => { setSelectedUser(member); setIsRemoveOpen(true) }}
                          title="Remove User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* INVITATIONS TAB */}
      {activeTab === 'invitations' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Pending Invitations</CardTitle>
            <CardDescription>Invites sent to users who have not yet signed up.</CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">No pending invitations.</p>
            ) : (
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{invite.email}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Role: {ROLE_LABELS[invite.role]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Expires: {new Date(invite.expires).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs text-destructive hover:bg-destructive/5"
                      onClick={() => handleRevokeInvite(invite.id)}
                    >
                      Revoke Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE EMPLOYEE DIRECTLY DIALOG */}
      <Dialog open={isCreateEmployeeOpen} onOpenChange={setIsCreateEmployeeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Employee Account</DialogTitle>
            <DialogDescription>
              Directly create a new employee or team member account for your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="emp-name" className="text-xs font-semibold text-foreground">Full Name</label>
              <Input
                id="emp-name"
                type="text"
                placeholder="Alex Morgan"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                required
                disabled={isPending}
              />
              {fieldErrors.name && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emp-email" className="text-xs font-semibold text-foreground">Work Email</label>
              <Input
                id="emp-email"
                type="email"
                placeholder="alex.morgan@company.com"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                required
                disabled={isPending}
              />
              {fieldErrors.email && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emp-password" className="text-xs font-semibold text-foreground">Initial Password</label>
              <Input
                id="emp-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                required
                disabled={isPending}
              />
              {fieldErrors.password && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.password[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="emp-role" className="text-xs font-semibold text-foreground">Role</label>
                <Select 
                  value={empRole} 
                  onValueChange={(val) => setEmpRole(val as UserRole)}
                  disabled={isPending}
                >
                  <SelectTrigger id="emp-role" className="bg-background">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ROLE_LABELS).map(roleKey => (
                      <SelectItem key={roleKey} value={roleKey}>{ROLE_LABELS[roleKey as UserRole]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="emp-team" className="text-xs font-semibold text-foreground">Team / Department</label>
                <Select 
                  value={empTeamId || 'unassigned'} 
                  onValueChange={(val) => setEmpTeamId(val === 'unassigned' ? '' : (val || ''))}
                  disabled={isPending}
                >
                  <SelectTrigger id="emp-team" className="bg-background">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateEmployeeOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Create Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* INVITE USER DIALOG */}
      <Dialog open={isInviteOpen} onOpenChange={handleCloseInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an email invitation link to join this workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="invite-email" className="text-xs font-semibold text-foreground">Email Address</label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                disabled={isPending}
              />
              {fieldErrors.email && (
                <p className="text-xs font-medium text-destructive">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="invite-role" className="text-xs font-semibold text-foreground">Default Access Level</label>
              <Select 
                value={inviteRole} 
                onValueChange={(val) => setInviteRole(val as UserRole)}
                disabled={isPending}
              >
                <SelectTrigger id="invite-role" className="bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ROLE_LABELS).map(roleKey => (
                    <SelectItem key={roleKey} value={roleKey}>{ROLE_LABELS[roleKey as UserRole]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SUSPEND CONFIRMATION DIALOG */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong className="text-foreground">"{selectedUser?.name ?? selectedUser?.email}"</strong>? They will be immediately blocked from signing in or executing actions. You can restore access later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleToggleSuspend} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REMOVE USER CONFIRMATION DIALOG */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong className="text-foreground">"{selectedUser?.name ?? selectedUser?.email}"</strong> from this organization? Their organization membership will be cleared and they will lose all access to this workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveUser} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
