'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { InterviewerOption, SchedulableApplication } from '@/server/actions/interviews'
import { createInterviewAction, updateInterviewAction } from '@/server/actions/interviews'
import type { InterviewWithDetails } from '@/types/database'
import { createInterviewSchema, type CreateInterviewInput } from '@/validators/interview'
import { InterviewType } from '@/types/enums'
import { TYPE_CONFIG } from './interview-type-badge'

interface InterviewFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interview?: InterviewWithDetails
  /** Pre-select an application when opening from candidate/job context */
  preSelectedApplicationId?: string
  interviewers: InterviewerOption[]
  applications: SchedulableApplication[]
  onSuccess?: () => void
}

// Format a local datetime string for the datetime-local input
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function InterviewForm({
  open,
  onOpenChange,
  interview,
  preSelectedApplicationId,
  interviewers,
  applications,
  onSuccess,
}: InterviewFormProps) {
  const isEditing = Boolean(interview)
  const [isPending, startTransition] = useTransition()

  const selectedApp = interview
    ? applications.find((a) => a.id === interview.application?.id)
    : applications.find((a) => a.id === preSelectedApplicationId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: {
      candidateId: interview?.candidate.id ?? selectedApp?.candidateId ?? '',
      applicationId: interview?.application?.id ?? preSelectedApplicationId ?? '',
      interviewerId: interview?.interviewer?.id ?? '',
      scheduledAt: interview?.scheduledAt ?? undefined,
      duration: interview?.duration ?? 60,
      type: interview?.type ?? InterviewType.VIDEO,
      location: interview?.location ?? '',
      notes: interview?.notes ?? '',
    },
  })

  const applicationId = watch('applicationId')
  const interviewType = watch('type')

  // When application changes, auto-fill candidateId
  useEffect(() => {
    const app = applications.find((a) => a.id === applicationId)
    if (app) setValue('candidateId', app.candidateId)
  }, [applicationId, applications, setValue])

  function onClose() {
    reset()
    onOpenChange(false)
  }

  function onSubmit(data: any) {
    startTransition(async () => {
      const result = isEditing && interview
        ? await updateInterviewAction(interview.id, {
            scheduledAt: data.scheduledAt,
            duration: data.duration,
            type: data.type,
            location: data.location,
            notes: data.notes,
          })
        : await createInterviewAction(data)

      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? (isEditing ? 'Interview updated.' : 'Interview scheduled.'))
      onClose()
      onSuccess?.()
    })
  }

  // Generate a default scheduledAt (next business day at 10:00)
  const defaultScheduledAt = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(10, 0, 0, 0)
    return toDatetimeLocal(d)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit interview' : 'Schedule interview'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the interview details.'
              : 'Set up an interview for a candidate.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Application picker (hidden when editing) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="applicationId">
                Candidate & position <span className="text-destructive">*</span>
              </Label>
              <Select
                value={applicationId}
                onValueChange={(v) => setValue('applicationId', v)}
              >
                <SelectTrigger id="applicationId" aria-invalid={!!errors.applicationId}>
                  <SelectValue placeholder="Select candidate + job" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.candidateName} — {app.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.applicationId && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.applicationId.message as string}
                </p>
              )}
            </div>
          )}

          {/* Interviewer */}
          <div className="space-y-1.5">
            <Label htmlFor="interviewerId">
              Interviewer <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('interviewerId')}
              onValueChange={(v) => setValue('interviewerId', v)}
            >
              <SelectTrigger id="interviewerId" aria-invalid={!!errors.interviewerId}>
                <SelectValue placeholder="Select interviewer" />
              </SelectTrigger>
              <SelectContent>
                {interviewers.map((iv) => (
                  <SelectItem key={iv.id} value={iv.id}>
                    {iv.name ?? iv.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.interviewerId && (
              <p className="text-xs text-destructive" role="alert">
                {errors.interviewerId.message as string}
              </p>
            )}
          </div>

          {/* Type + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Interview type</Label>
              <Select
                value={interviewType}
                onValueChange={(v) => setValue('type', v as InterviewType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(InterviewType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_CONFIG[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={480}
                {...register('duration', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Date + time */}
          <div className="space-y-1.5">
            <Label htmlFor="scheduledAt">
              Date & time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              defaultValue={
                interview?.scheduledAt
                  ? toDatetimeLocal(new Date(interview.scheduledAt))
                  : defaultScheduledAt()
              }
              aria-invalid={!!errors.scheduledAt}
              {...register('scheduledAt')}
            />
            {errors.scheduledAt && (
              <p className="text-xs text-destructive" role="alert">
                {errors.scheduledAt.message as string}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location">Location / meeting link</Label>
            <Input
              id="location"
              placeholder="https://meet.google.com/... or Office Room 2A"
              {...register('location')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (internal)</Label>
            <Textarea
              id="notes"
              placeholder="Preparation notes, topics to cover..."
              className="min-h-[80px]"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isEditing ? 'Save changes' : 'Schedule interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
