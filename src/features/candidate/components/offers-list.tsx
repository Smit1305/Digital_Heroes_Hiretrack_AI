'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateOfferStatusAction } from '@/server/actions/applications'
import { Award, Calendar, DollarSign, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface OfferItem {
  id: string
  salary: number
  currency: string
  startDate: Date
  notes: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED_BY_CANDIDATE' | 'ACCEPTED'
  application: {
    id: string
    job: {
      title: string
      organization: {
        name: string
      }
    }
  }
}

interface OffersListProps {
  initialOffers: OfferItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent',
  REJECTED_BY_CANDIDATE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent',
}

export function OffersList({ initialOffers }: OffersListProps) {
  const router = useRouter()
  const [offers, setOffers] = useState<OfferItem[]>(initialOffers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleResponse(applicationId: string, status: 'ACCEPTED' | 'REJECTED_BY_CANDIDATE') {
    setLoadingId(applicationId)
    const toastId = toast.loading(
      status === 'ACCEPTED' ? 'Accepting offer…' : 'Declining offer…'
    )

    try {
      const result = await updateOfferStatusAction(applicationId, status)
      setLoadingId(null)

      if (result.success) {
        toast.success(
          status === 'ACCEPTED'
            ? 'Congratulations! You have accepted the job offer.'
            : 'Offer declined successfully.',
          { id: toastId }
        )
        setOffers(
          offers.map((o) =>
            o.application.id === applicationId ? { ...o, status } : o
          )
        )
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update offer.', { id: toastId })
      }
    } catch {
      toast.error('An unexpected error occurred.', { id: toastId })
      setLoadingId(null)
    }
  }

  if (offers.length === 0) {
    return (
      <Card className="shadow-sm max-w-md mx-auto text-center p-8 space-y-3">
        <Award className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <CardTitle className="text-lg">No offers yet</CardTitle>
        <CardDescription>
          Your job applications do not have any pending or historical offers currently.
        </CardDescription>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {offers.map((offer) => {
        const isPending = offer.status === 'PENDING'
        return (
          <Card key={offer.id} className="shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 border-b bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase">
                    Official Offer Letter
                  </span>
                  <CardTitle className="text-lg font-bold">
                    {offer.application.job.title} Offer
                  </CardTitle>
                  <CardDescription>
                    from {offer.application.job.organization.name}
                  </CardDescription>
                </div>

                <Badge className={`px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[offer.status] || 'bg-muted'}`}>
                  {offer.status.replace('_BY_CANDIDATE', '').replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Salary compensation</span>
                    <span className="font-bold text-sm">
                      {offer.salary.toLocaleString()} {offer.currency} / year
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Start date</span>
                    <span className="font-bold text-sm">
                      {new Date(offer.startDate).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {offer.notes && (
                <div className="bg-muted/20 p-4 rounded-lg border text-sm text-muted-foreground whitespace-pre-wrap">
                  <span className="font-semibold text-foreground text-xs block mb-1">Letter message:</span>
                  {offer.notes}
                </div>
              )}
            </CardContent>

            {isPending && (
              <CardFooter className="bg-muted/5 border-t py-4 justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResponse(offer.application.id, 'REJECTED_BY_CANDIDATE')}
                  disabled={loadingId === offer.application.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  {loadingId === offer.application.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-1.5 h-4 w-4" />
                  )}
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResponse(offer.application.id, 'ACCEPTED')}
                  disabled={loadingId === offer.application.id}
                >
                  {loadingId === offer.application.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}
                  Accept Offer
                </Button>
              </CardFooter>
            )}
          </Card>
        )
      })}
    </div>
  )
}
