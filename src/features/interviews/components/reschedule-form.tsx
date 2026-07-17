'use client'

import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { rescheduleInterviewAction } from '@/server/actions/interviews'
import React from 'react'

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface RescheduleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  candidateName: string
  currentScheduledAt: Date
  onSuccess?: () => void
}

export function RescheduleForm({
  open,
  onOpenChange,
  interviewId,
  candidateName,
  currentScheduledAt,
  onSuccess,
}: RescheduleFormProps) {
  const [isPending, startTransition] = useTransition()
  const scheduledAtRef = React.useRef<HTMLInputElement>(null)
  const notesRef = React.useRef<HTMLTextAreaElement>(null)

  function onClose() {
    onOpenChange(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const rawDate = scheduledAtRef.current?.value
    if (!rawDate) {
      toast.error('Please select a new date and time.')
      return
    }
    const newDate = new Date(rawDate)
    if (isNaN(newDate.getTime())) {
      toast.error('Invalid date.')
      return
    }
    if (newDate <= new Date()) {
      toast.error('New date must be in the future.')
      return
    }

    startTransition(async () => {
      const notes = notesRef.current?.value || undefined
      const result = await rescheduleInterviewAction(interviewId, newDate, notes)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Interview rescheduled.')
      onClose()
      onSuccess?.()
    })
  }

  // Default to next day same time
  const defaultDate = new Date(currentScheduledAt)
  defaultDate.setDate(defaultDate.getDate() + 1)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reschedule interview</DialogTitle>
          <DialogDescription>
            Choose a new date and time for{' '}
            <span className="font-medium text-foreground">{candidateName}</span>'s interview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="newScheduledAt">
              New date & time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newScheduledAt"
              type="datetime-local"
              ref={scheduledAtRef}
              defaultValue={toDatetimeLocal(defaultDate)}
            />
            <p className="text-xs text-muted-foreground">
              Current: {currentScheduledAt.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rescheduleNotes">Notes (optional)</Label>
            <Textarea
              id="rescheduleNotes"
              ref={notesRef}
              placeholder="Reason for rescheduling..."
              className="min-h-[80px]"
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Reschedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
