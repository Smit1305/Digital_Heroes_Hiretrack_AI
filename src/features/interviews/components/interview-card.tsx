'use client'

import { format, isPast, isToday, isTomorrow } from 'date-fns'
import {
    AlertTriangle,
    Calendar,
    Clock,
    Edit,
    MessageSquare,
    MoreHorizontal,
    RefreshCw,
    Trash2,
    User,
    X,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { InterviewerOption, SchedulableApplication } from '@/server/actions/interviews'
import {
    cancelInterviewAction,
    deleteInterviewAction,
    markNoShowAction,
} from '@/server/actions/interviews'
import type { InterviewWithDetails } from '@/types/database'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import { FeedbackForm } from './feedback-form'
import { InterviewForm } from './interview-form'
import { InterviewStatusBadge, InterviewTypeBadge, StarRating } from './interview-type-badge'
import { RescheduleForm } from './reschedule-form'

function formatInterviewDate(date: Date): string {
  const d = new Date(date)
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy · h:mm a')
}

interface InterviewCardProps {
  interview: InterviewWithDetails
  interviewers: InterviewerOption[]
  applications: SchedulableApplication[]
  onMutated: () => void
  canEdit: boolean
  canFeedback: boolean
  canDelete: boolean
}

export function InterviewCard({
  interview,
  interviewers,
  applications,
  onMutated,
  canEdit,
  canFeedback,
  canDelete,
}: InterviewCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const candidateName = `${interview.candidate.firstName} ${interview.candidate.lastName}`
  const initials =
    `${interview.candidate.firstName[0] ?? ''}${interview.candidate.lastName[0] ?? ''}`.toUpperCase()
  const isPastInterview = isPast(new Date(interview.scheduledAt))
  const isScheduled = interview.status === 'SCHEDULED'
  const isRescheduled = interview.status === 'RESCHEDULED'
  const isCompleted = interview.status === 'COMPLETED'
  const canActOnInterview = isScheduled || isRescheduled

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelInterviewAction(interview.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Interview cancelled.')
      onMutated()
    })
  }

  function handleMarkNoShow() {
    startTransition(async () => {
      const result = await markNoShowAction(interview.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Marked as no-show.')
      onMutated()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInterviewAction(interview.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Interview deleted.')
      setDeleteOpen(false)
      onMutated()
    })
  }

  return (
    <>
      <Card
        className={cn(
          'group flex flex-col hover:ring-1 hover:ring-foreground/20 transition-all',
          interview.status === 'CANCELLED' && 'opacity-60',
          interview.status === 'NO_SHOW' && 'opacity-70'
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <Link
                    href={`/candidates/${interview.candidate.id}`}
                    className="text-sm font-semibold leading-tight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {candidateName}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {interview.application.job.title}
                  </p>
                </div>
                <InterviewStatusBadge status={interview.status} />
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Options for ${candidateName} interview`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  />
                }
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem render={<Link href={`/candidates/${interview.candidate.id}`} />}>
                  <User className="mr-2 h-4 w-4" />
                  View candidate
                </DropdownMenuItem>

                <DropdownMenuItem render={<a href={`/api/interviews/${interview.id}/ics`} download />}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Export Calendar (.ics)
                </DropdownMenuItem>

                {canEdit && canActOnInterview && (
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit details
                  </DropdownMenuItem>
                )}

                {canEdit && canActOnInterview && (
                  <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reschedule
                  </DropdownMenuItem>
                )}

                {canFeedback && (canActOnInterview || isCompleted) && (
                  <DropdownMenuItem render={<Link href={`/interviews/${interview.id}/feedback`} />}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {interview.feedback ? 'Edit scorecard' : 'Submit scorecard'}
                  </DropdownMenuItem>
                )}

                {canEdit && canActOnInterview && (
                  <DropdownMenuItem
                    onClick={handleMarkNoShow}
                    disabled={isPending}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Mark no-show
                  </DropdownMenuItem>
                )}

                {canEdit && canActOnInterview && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleCancel}
                      disabled={isPending}
                      variant="destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel interview
                    </DropdownMenuItem>
                  </>
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
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Type badge */}
          <InterviewTypeBadge type={interview.type} />

          {/* Date + duration */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Calendar
                className={cn(
                  'h-3.5 w-3.5 flex-shrink-0',
                  isPastInterview && canActOnInterview
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
              <span
                className={
                  isPastInterview && canActOnInterview
                    ? 'text-destructive font-medium'
                    : 'text-muted-foreground'
                }
              >
                {formatInterviewDate(interview.scheduledAt)}
              </span>
            </div>
            {interview.duration && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span>{interview.duration} minutes</span>
              </div>
            )}
          </div>

          {/* Interviewer */}
          {interview.interviewer && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">
                {interview.interviewer.name ?? interview.interviewer.email}
              </span>
            </div>
          )}

          {/* Feedback preview */}
          {isCompleted && interview.rating && (
            <div className="space-y-1 border-t pt-2">
              <StarRating rating={interview.rating} />
              {interview.feedback && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {interview.feedback}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <InterviewForm
        open={editOpen}
        onOpenChange={setEditOpen}
        interview={interview}
        interviewers={interviewers}
        applications={applications}
        onSuccess={onMutated}
      />

      <RescheduleForm
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        interviewId={interview.id}
        candidateName={candidateName}
        currentScheduledAt={new Date(interview.scheduledAt)}
        onSuccess={onMutated}
      />

      <FeedbackForm
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        interviewId={interview.id}
        candidateName={candidateName}
        existingFeedback={interview.feedback}
        existingRating={interview.rating}
        onSuccess={onMutated}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={isPending}
        title="Delete interview"
        description={`Are you sure you want to permanently delete the interview with ${candidateName}? This cannot be undone.`}
      />
    </>
  )
}
