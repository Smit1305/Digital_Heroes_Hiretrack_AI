'use client'

import { format } from 'date-fns'
import {
    Briefcase,
    Edit,
    ExternalLink,
    Globe,
    GraduationCap,
    Mail,
    MapPin,
    MoreHorizontal,
    Phone,
    Star,
    Trash2,
    User,
    Calendar,
    Clock,
    Download,
    ThumbsUp,
    ThumbsDown,
    Plus,
    MessageSquare,
    AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

const Linkedin = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CandidateActivity, CandidateNote } from '@/server/actions/candidates'
import { updateCandidateStatusAction } from '@/server/actions/candidates'
import type { CandidateWithApplications } from '@/types/database'
import { CandidateStatus } from '@/types/enums'
import { CandidateForm } from './candidate-form'
import { CandidateNotes } from './candidate-notes'
import { CandidateStatusBadge, StageBadge } from './candidate-status-badge'
import { CandidateTimeline } from './candidate-timeline'
import { DeleteCandidateDialog } from './delete-candidate-dialog'
import { CreateOfferDialog } from './create-offer-dialog'

const STATUS_LABELS: Record<CandidateStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLACKLISTED: 'Blacklisted',
}

interface CandidateDetailViewProps {
  candidate: CandidateWithApplications
  notes: CandidateNote[]
  activities: CandidateActivity[]
  canEdit: boolean
  canDelete: boolean
}

export function CandidateDetailView({
  candidate,
  notes,
  activities,
  canEdit,
  canDelete,
}: CandidateDetailViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [offerOpen, setOfferOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<{ id: string; jobTitle: string } | null>(null)

  const initials = `${candidate.firstName[0] ?? ''}${candidate.lastName[0] ?? ''}`.toUpperCase()

  function handleStatusChange(status: string | null) {
    if (!status) return
    startTransition(async () => {
      const result = await updateCandidateStatusAction(
        candidate.id,
        status as CandidateStatus
      )
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarFallback className="text-lg font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {candidate.email && (
                      <a
                        href={`mailto:${candidate.email}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                        {candidate.email}
                      </a>
                    )}
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {candidate.location}
                      </span>
                    )}
                    {candidate.phone && (
                      <a
                        href={`tel:${candidate.phone}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        {candidate.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <CandidateStatusBadge status={candidate.status} />

                  {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                      <Edit className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline" size="icon-sm" aria-label="More options" />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {candidate.linkedin && (
                        <DropdownMenuItem render={<a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" />}>
                          <Linkedin className="mr-2 h-4 w-4" />
                          LinkedIn
                        </DropdownMenuItem>
                      )}
                      {(candidate.portfolio ?? candidate.website) && (
                        <DropdownMenuItem
                          render={
                            <a
                              href={candidate.portfolio ?? candidate.website ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Portfolio
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteOpen(true)}
                            variant="destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: overview / notes / timeline */}
          <Tabs defaultValue="overview">
            <TabsList variant="line">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({candidate.applications.length})
              </TabsTrigger>
              <TabsTrigger value="interviews">
                Interviews ({candidate.interviews?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Skills */}
              {candidate.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes preview */}
              {candidate.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Notes</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {candidate.notes}
                  </p>
                </div>
              )}

              {!candidate.skills.length && !candidate.notes && (
                <p className="text-sm text-muted-foreground py-4">
                  No overview information available.
                </p>
              )}
            </TabsContent>

            {/* Applications tab */}
            <TabsContent value="applications" className="mt-4">
              {candidate.applications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No applications yet.
                </p>
              ) : (
                <ul className="space-y-2.5" aria-label="Applications list">
                  {candidate.applications.map((app) => {
                    const hasOffer = !!app.offer
                    return (
                      <li
                        key={app.id}
                        className="flex flex-col gap-3 rounded-lg border p-3 text-sm"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{app.job.title}</p>
                            {app.job.department && (
                              <p className="text-xs text-muted-foreground">{app.job.department}</p>
                            )}
                          </div>
                          <StageBadge stage={app.stage} />
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {/* Offer details & action */}
                        {hasOffer ? (
                          <div className="bg-muted/40 p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">OFFER STATUS</span>
                                <span className="font-semibold text-foreground uppercase">{app.offer?.status.replace(/_/g, ' ')}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">SALARY PACKAGE</span>
                                <span className="font-semibold text-foreground">{app.offer?.currency} {app.offer?.salary.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">START DATE</span>
                                <span className="font-semibold text-foreground">
                                  {format(new Date(app.offer!.startDate), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                            {canEdit && (
                              <div>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => {
                                    setSelectedApp({ id: app.id, jobTitle: app.job.title })
                                    setOfferOpen(true)
                                  }}
                                >
                                  Edit Offer
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          canEdit && (
                            <div className="border-t pt-2 flex items-center justify-end">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                  setSelectedApp({ id: app.id, jobTitle: app.job.title })
                                  setOfferOpen(true)
                                }}
                              >
                                Make formal job offer
                              </Button>
                            </div>
                          )
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </TabsContent>

            {/* Interviews tab */}
            <TabsContent value="interviews" className="mt-4">
              {!candidate.interviews || candidate.interviews.length === 0 ? (
                <div className="border border-dashed rounded-xl p-8 text-center max-w-sm mx-auto space-y-2">
                  <Calendar className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <h3 className="font-semibold text-sm text-foreground">No interviews scheduled</h3>
                  <p className="text-xs text-muted-foreground">
                    There are no past or upcoming interviews scheduled for this candidate.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/interviews"
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs')}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Schedule an interview
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4" aria-label="Interviews list">
                  {candidate.interviews.map((interview) => {
                    const hasScorecard = !!interview.scorecard
                    const rec = interview.scorecard
                      ? (interview.scorecard.recommendation as string)
                      : null
                    const recLabel = rec
                      ? rec.replace(/_/g, ' ')
                      : null
                    const isCompleted = interview.status === 'COMPLETED'
                    
                    return (
                      <li key={interview.id} className="border bg-card rounded-xl shadow-sm p-4 space-y-3.5">
                        {/* Header details */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                              {interview.type} ROUND
                            </span>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(interview.scheduledAt), 'MMM d, yyyy · h:mm a')}</span>
                              {interview.duration && (
                                <span className="text-xs text-muted-foreground">({interview.duration}m)</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                              <User className="h-3.5 w-3.5" />
                              <span>Interviewer: {interview.interviewer.name || interview.interviewer.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Export ICS */}
                            <a
                              href={`/api/interviews/${interview.id}/ics`}
                              download
                              className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
                              title="Download Calendar Invite (.ics)"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            
                            {/* Status badge */}
                            <span className={cn(
                              'text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize',
                              interview.status === 'COMPLETED' && 'bg-emerald-500/10 text-emerald-500',
                              interview.status === 'SCHEDULED' && 'bg-blue-500/10 text-blue-500',
                              interview.status === 'RESCHEDULED' && 'bg-indigo-500/10 text-indigo-500',
                              interview.status === 'CANCELLED' && 'bg-destructive/10 text-destructive',
                              interview.status === 'NO_SHOW' && 'bg-yellow-500/10 text-yellow-500'
                            )}>
                              {interview.status.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        {/* Scorecard feedback section */}
                        {isCompleted && interview.scorecard ? (
                          <div className="space-y-3 pt-1">
                            {/* Recommendation and Rating */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Recommendation:</span>
                                <Badge className={cn(
                                  'uppercase text-[10px] py-0.5 px-2 font-bold tracking-wider border-transparent',
                                  rec === 'STRONG_HIRE' && 'bg-emerald-500 text-white',
                                  rec === 'HIRE' && 'bg-green-500 text-white',
                                  rec === 'NEUTRAL' && 'bg-slate-500 text-white',
                                  rec === 'NO_HIRE' && 'bg-orange-500 text-white',
                                  rec === 'STRONG_NO_HIRE' && 'bg-red-500 text-white'
                                )}>
                                  {recLabel}
                                </Badge>
                              </div>
                              {interview.rating && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-medium text-muted-foreground">Score:</span>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={cn(
                                          'h-3.5 w-3.5',
                                          star <= (interview.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Ratings List */}
                            {interview.scorecard.ratings && typeof interview.scorecard.ratings === 'object' && (
                              <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/30 border rounded-lg text-xs">
                                {Object.entries(interview.scorecard.ratings as Record<string, number>).map(([key, val]) => (
                                  <div key={key} className="flex justify-between items-center py-0.5">
                                    <span className="text-muted-foreground font-medium">{key}</span>
                                    <div className="flex items-center gap-0.5">
                                      <span className="font-semibold mr-1">{val}/5</span>
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-2.5 bg-green-500/5 border border-green-500/10 rounded-lg">
                                <span className="font-semibold text-green-700 block mb-1">Key Strengths</span>
                                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                  {interview.scorecard.strengths}
                                </p>
                              </div>
                              <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                                <span className="font-semibold text-red-700 block mb-1">Areas for Improvement</span>
                                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                  {interview.scorecard.weaknesses}
                                </p>
                              </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-muted/40 rounded-lg border p-2.5 text-xs space-y-1">
                              <span className="font-semibold text-foreground flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Summary Statement</span>
                              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                                {interview.scorecard.summary}
                              </p>
                            </div>

                            {/* Edit Link */}
                            <div className="flex justify-end pt-1">
                              <Link
                                href={`/interviews/${interview.id}/feedback`}
                                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-[11px]')}
                              >
                                Edit Scorecard
                              </Link>
                            </div>
                          </div>
                        ) : interview.status === 'CANCELLED' ? (
                          <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            This round was cancelled and no feedback is required.
                          </p>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 border border-dashed rounded-lg p-3 text-xs">
                            <div>
                              <p className="font-semibold text-foreground">Scorecard is pending</p>
                              <p className="text-muted-foreground text-[10px]">No feedback has been submitted for this round yet.</p>
                            </div>
                            <div>
                              <Link
                                href={`/interviews/${interview.id}/feedback`}
                                className={cn(buttonVariants({ variant: 'default', size: 'xs' }))}
                              >
                                Submit Scorecard
                              </Link>
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </TabsContent>

            {/* Notes tab */}
            <TabsContent value="notes" className="mt-4">
              <CandidateNotes candidateId={candidate.id} initialNotes={notes} />
            </TabsContent>

            {/* Timeline tab */}
            <TabsContent value="timeline" className="mt-4">
              <CandidateTimeline activities={activities} />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Info card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Profile details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.experience !== null && candidate.experience !== undefined && (
                <InfoRow icon={Star} label="Experience" value={`${candidate.experience} years`} />
              )}
              {candidate.education && (
                <InfoRow icon={GraduationCap} label="Education" value={candidate.education} />
              )}
              {candidate.source && (
                <InfoRow icon={Globe} label="Source" value={candidate.source} />
              )}
              <Separator />
              <InfoRow
                icon={User}
                label="Added"
                value={format(new Date(candidate.createdAt), 'MMM d, yyyy')}
              />
              <InfoRow
                icon={User}
                label="Updated"
                value={format(new Date(candidate.updatedAt), 'MMM d, yyyy')}
              />
            </CardContent>
          </Card>

          {/* Status changer */}
          {canEdit && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={candidate.status}
                  onValueChange={handleStatusChange}
                  disabled={isPending}
                >
                  <SelectTrigger aria-label="Change candidate status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CandidateStatus).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(candidate.linkedin || candidate.portfolio || candidate.website) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    LinkedIn profile
                    <ExternalLink className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                {(candidate.portfolio ?? candidate.website) && (
                  <a
                    href={candidate.portfolio ?? candidate.website ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    Portfolio / Website
                    <ExternalLink className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <CandidateForm
        open={editOpen}
        onOpenChange={setEditOpen}
        candidate={candidate}
        onSuccess={() => router.refresh()}
      />
      <DeleteCandidateDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        candidateId={candidate.id}
        candidateName={`${candidate.firstName} ${candidate.lastName}`}
        onSuccess={() => router.push('/candidates')}
      />
      {selectedApp && (
        <CreateOfferDialog
          open={offerOpen}
          onOpenChange={setOfferOpen}
          applicationId={selectedApp.id}
          jobTitle={selectedApp.jobTitle}
          candidateName={`${candidate.firstName} ${candidate.lastName}`}
        />
      )}
    </>
  )
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-right truncate max-w-[140px]">{value}</span>
    </div>
  )
}
