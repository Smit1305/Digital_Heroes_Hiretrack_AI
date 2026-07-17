import { OffersList } from '@/features/candidate/components/offers-list'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Offers — Candidate Portal',
}

export default async function CandidateOffersPage() {
  const session = await auth()

  if (!session?.user || !session.user.email) {
    redirect('/candidate/login')
  }

  // Fetch all offer letters matching candidate email
  const offers = await db.offer.findMany({
    where: {
      application: {
        candidate: {
          email: session.user.email,
        },
      },
    },
    include: {
      application: {
        include: {
          job: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Cast type to match client structure
  const formattedOffers = offers.map((offer) => ({
    id: offer.id,
    salary: offer.salary,
    currency: offer.currency,
    startDate: offer.startDate,
    notes: offer.notes,
    status: offer.status as 'PENDING' | 'APPROVED' | 'REJECTED_BY_CANDIDATE' | 'ACCEPTED',
    application: {
      id: offer.applicationId,
      job: {
        title: offer.application.job.title,
        organization: {
          name: offer.application.job.organization.name,
        },
      },
    },
  }))

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Offers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review details of compensation, start dates, and submit your official responses.
        </p>
      </div>

      <OffersList initialOffers={formattedOffers} />
    </div>
  )
}
