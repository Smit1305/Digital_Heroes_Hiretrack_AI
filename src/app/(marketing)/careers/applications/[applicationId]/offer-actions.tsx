'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateOfferStatusAction } from '@/server/actions/applications'

interface OfferActionsProps {
  applicationId: string
  salary: number
  currency: string
  startDate: Date
  notes: string | null
}

export function OfferActions({ applicationId, salary, currency, startDate, notes }: OfferActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [outcome, setOutcome] = useState<'ACCEPTED' | 'REJECTED' | null>(null)

  const handleUpdate = (status: 'ACCEPTED' | 'REJECTED_BY_CANDIDATE') => {
    startTransition(async () => {
      try {
        const result = await updateOfferStatusAction(applicationId, status)
        if (result.success) {
          toast.success(result.message ?? 'Offer status updated.')
          setOutcome(status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED')
          router.refresh()
        } else {
          toast.error(result.error ?? 'Failed to update offer.')
        }
      } catch {
        toast.error('An error occurred. Please try again.')
      }
    })
  }

  if (outcome === 'ACCEPTED') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 text-green-700 p-4 rounded-xl text-center text-sm font-semibold">
        🎉 You have accepted this offer! Welcome to the team.
      </div>
    )
  }

  if (outcome === 'REJECTED') {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center text-sm font-semibold">
        You have declined this offer. We wish you the best in your career.
      </div>
    )
  }

  const formattedDate = new Date(startDate).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="border bg-card rounded-2xl p-6 shadow-md border-primary/20 space-y-6 max-w-xl mx-auto">
      <div className="space-y-1">
        <span className="text-[10px] bg-primary/10 text-primary border-transparent font-bold py-0.5 px-2 rounded-full">
          OFFER DETAILS
        </span>
        <h2 className="text-lg font-bold text-foreground">Review your formal offer</h2>
        <p className="text-xs text-muted-foreground">Please review the details and start date before deciding.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border text-sm">
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold">SALARY PACKAGE</div>
          <div className="font-bold text-base mt-0.5">
            {currency} {salary.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold">PROPOSED START DATE</div>
          <div className="font-bold text-base mt-0.5">{formattedDate}</div>
        </div>
      </div>

      {notes && (
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground font-semibold">OFFER NOTES / DETAILS</div>
          <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border whitespace-pre-wrap leading-relaxed">
            {notes}
          </div>
        </div>
      )}

      <div className="pt-2 flex justify-end gap-3">
        <Button
          variant="outline"
          className="rounded-xl border-destructive/20 hover:bg-destructive/5 text-destructive font-semibold hover:text-destructive"
          onClick={() => handleUpdate('REJECTED_BY_CANDIDATE')}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Decline Offer
        </Button>
        <Button
          className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => handleUpdate('ACCEPTED')}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Offer
        </Button>
      </div>
    </div>
  )
}
