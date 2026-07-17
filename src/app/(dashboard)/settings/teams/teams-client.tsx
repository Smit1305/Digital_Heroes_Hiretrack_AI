'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { 
  createTeamAction, 
  updateTeamAction, 
  deleteTeamAction, 
  getTeamAnalyticsAction,
  type TeamAnalytics
} from '@/server/actions/teams'
import { Layers, Plus, MoreVertical, Pencil, Trash2, BarChart3, Users, Briefcase, Loader2 } from 'lucide-react'

interface TeamMember {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

interface TeamData {
  id: string
  name: string
  description: string | null
  members: TeamMember[]
  activeJobsCount: number
}

interface TeamsClientProps {
  initialTeams: TeamData[]
}

export function TeamsClient({ initialTeams }: TeamsClientProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<TeamData[]>(initialTeams)
  
  // Dialog visibility states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  // Loading states
  const [isPending, setIsPending] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Form states
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Analytics state
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null)

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '' })
    setFieldErrors({})
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (team: TeamData) => {
    setSelectedTeam(team)
    setFormData({ name: team.name, description: team.description || '' })
    setFieldErrors({})
    setIsEditOpen(true)
  }

  const handleOpenDelete = (team: TeamData) => {
    setSelectedTeam(team)
    setIsDeleteOpen(true)
  }

  const handleOpenAnalytics = async (team: TeamData) => {
    setSelectedTeam(team)
    setTeamAnalytics(null)
    setAnalyticsLoading(true)
    setIsAnalyticsOpen(true)
    
    const result = await getTeamAnalyticsAction(team.id)
    setAnalyticsLoading(false)
    if (result.success) {
      setTeamAnalytics(result.data)
    } else {
      toast.error(result.error)
      setIsAnalyticsOpen(false)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setFieldErrors({})

    const toastId = toast.loading('Creating team…')
    const result = await createTeamAction(formData)
    setIsPending(false)

    if (result.success) {
      toast.success('Team created successfully.', { id: toastId })
      setIsCreateOpen(false)
      router.refresh()
      // Optimistic or fresh update: since it's server page we reload page, but can update state as well
      const newTeam: TeamData = {
        id: result.data.id,
        name: formData.name,
        description: formData.description || null,
        members: [],
        activeJobsCount: 0,
      }
      setTeams([...teams, newTeam])
    } else {
      toast.error(result.error, { id: toastId })
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    }
  }

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return
    setIsPending(true)
    setFieldErrors({})

    const toastId = toast.loading('Updating team…')
    const result = await updateTeamAction(selectedTeam.id, formData)
    setIsPending(false)

    if (result.success) {
      toast.success('Team updated successfully.', { id: toastId })
      setIsEditOpen(false)
      router.refresh()
      setTeams(
        teams.map((t) =>
          t.id === selectedTeam.id
            ? { ...t, name: formData.name, description: formData.description || null }
            : t
        )
      )
    } else {
      toast.error(result.error ?? 'Failed to update team.', { id: toastId })
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
      }
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    setIsPending(true)

    const toastId = toast.loading('Deleting team…')
    const result = await deleteTeamAction(selectedTeam.id)
    setIsPending(false)

    if (result.success) {
      toast.success('Team deleted successfully.', { id: toastId })
      setIsDeleteOpen(false)
      router.refresh()
      setTeams(teams.filter((t) => t.id !== selectedTeam.id))
    } else {
      toast.error(result.error ?? 'Failed to delete team.', { id: toastId })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Workspace Teams</h2>
          <p className="text-sm text-muted-foreground">
            Organize work and jobs into specific departments.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">No teams created</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Create department teams (e.g. Engineering, Sales) to assign jobs and group members.
          </p>
          <Button onClick={handleOpenCreate} variant="secondary" className="mt-4 flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add First Team
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
                      {team.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {team.description ?? 'No description provided.'}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" aria-label="Open team menu" />
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenAnalytics(team)} className="flex items-center gap-2 text-xs">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        Team Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEdit(team)} className="flex items-center gap-2 text-xs">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenDelete(team)} className="flex items-center gap-2 text-xs text-destructive focus:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{team.members.length} {team.members.length === 1 ? 'member' : 'members'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{team.activeJobsCount} active {team.activeJobsCount === 1 ? 'job' : 'jobs'}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-2 border-t bg-muted/20 flex items-center justify-between">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {team.members.slice(0, 4).map((member) => {
                    const memberInitials = (member.name ?? member.email).split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-background ring-offset-0">
                        <AvatarImage src={member.avatar ?? undefined} alt={member.name ?? 'Avatar'} />
                        <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                          {memberInitials}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {team.members.length > 4 && (
                    <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                      +{team.members.length - 4}
                    </div>
                  )}
                  {team.members.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">No members assigned</span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-primary hover:text-primary/80" onClick={() => handleOpenAnalytics(team)}>
                  View analytics →
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE TEAM DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a department team to group roles and jobs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="create-name" className="text-xs font-semibold text-foreground">Team Name</label>
              <Input
                id="create-name"
                placeholder="e.g. Engineering"
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
              <label htmlFor="create-description" className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Textarea
                id="create-description"
                placeholder="Brief description of team functions"
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
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT TEAM DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team name and description details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTeam} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-name" className="text-xs font-semibold text-foreground">Team Name</label>
              <Input
                id="edit-name"
                placeholder="e.g. Engineering"
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
              <label htmlFor="edit-description" className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of team functions"
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
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the team <strong className="text-foreground">"{selectedTeam?.name}"</strong>? This will unlink all members and jobs from this team. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TEAM ANALYTICS DIALOG */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Team Analytics: {selectedTeam?.name}
            </DialogTitle>
            <DialogDescription>
              Performance metrics and active pipelines.
            </DialogDescription>
          </DialogHeader>

          {analyticsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Gathering team records…</p>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/40 border rounded-lg p-3 text-center space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Jobs</div>
                  <div className="text-xl font-bold text-foreground">{teamAnalytics?.activeJobsCount ?? 0}</div>
                </div>
                <div className="bg-muted/40 border rounded-lg p-3 text-center space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Candidates</div>
                  <div className="text-xl font-bold text-foreground">{teamAnalytics?.totalCandidatesCount ?? 0}</div>
                </div>
                <div className="bg-muted/40 border rounded-lg p-3 text-center space-y-0.5">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Hires</div>
                  <div className="text-xl font-bold text-foreground">{teamAnalytics?.hiredCandidatesCount ?? 0}</div>
                </div>
              </div>

              {/* Jobs pipeline table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Positions Overview</h4>
                {teamAnalytics?.jobs && teamAnalytics.jobs.length > 0 ? (
                  <div className="border rounded-md divide-y overflow-hidden max-h-48 overflow-y-auto">
                    {teamAnalytics.jobs.map((job) => (
                      <div key={job.id} className="p-3 text-xs flex items-center justify-between hover:bg-muted/10">
                        <div className="font-semibold">{job.title}</div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium uppercase">{job.status}</span>
                          <span>{job.applicationsCount} applicants</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-3 text-center bg-muted/10 border rounded-md">
                    No jobs associated with this team.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button onClick={() => setIsAnalyticsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
