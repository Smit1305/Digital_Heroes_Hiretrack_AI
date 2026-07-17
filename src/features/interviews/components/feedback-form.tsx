'use client'

import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { submitFeedbackAction } from '@/server/actions/interviews'

interface FeedbackFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  candidateName: string
  existingFeedback?: string | null
  existingRating?: number | null
  onSuccess?: () => void
}

export function FeedbackForm({
  open,
  onOpenChange,
  interviewId,
  candidateName,
  existingFeedback,
  existingRating,
  onSuccess,
}: FeedbackFormProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState(existingFeedback ?? '')
  const [rating, setRating] = useState(existingRating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)

  function onClose() {
    onOpenChange(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) {
      toast.error('Please write your feedback.')
      return
    }
    if (rating === 0) {
      toast.error('Please select a rating.')
      return
    }

    startTransition(async () => {
      const result = await submitFeedbackAction(interviewId, feedback, rating)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Feedback submitted.')
      onClose()
      onSuccess?.()
    })
  }

  const display = hoverRating || rating

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit feedback</DialogTitle>
          <DialogDescription>
            Write your interview feedback for{' '}
            <span className="font-medium text-foreground">{candidateName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Star rating */}
          <div className="space-y-1.5">
            <Label>
              Overall rating <span className="text-destructive">*</span>
            </Label>
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Interview rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={cn(
                    'text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
                    star <= display
                      ? 'text-amber-400'
                      : 'text-muted-foreground/30 hover:text-amber-300'
                  )}
                  aria-label={`Rate ${star} out of 5`}
                  aria-pressed={rating === star}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Feedback text */}
          <div className="space-y-1.5">
            <Label htmlFor="feedback">
              Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts on the candidate's performance, skills, and cultural fit..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[140px]"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length} / 5000
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !feedback.trim() || rating === 0}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Submit feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
