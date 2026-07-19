import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { OfferActions } from './offer-actions'
import { Briefcase, Building2, Calendar, MapPin, Video } from 'lucide-react'
import { ApplicationStage, OfferStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface ApplicationTrackerProps {
  params: Promise<{ applicationId: string }>
}

export const metadata: Metadata = {
  title: 'Application Status Tracker — HireTrack AI',
  description: 'Track your job application status and scheduled interviews.',
  robots: { index: false, follow: false },
}

const STAGES_ORDER: ApplicationStage[] = [
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.TECHNICAL,
  ApplicationStage.HR_ROUND,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED,
]

const STAGE_DESCRIPTIONS: Record<ApplicationStage, string> = {
  APPLIED: 'We have received your application and resume.',
  SCREENING: 'Our recruiting team is reviewing your qualifications.',
  INTERVIEW: 'An initial call has been scheduled or is being arranged.',
  TECHNICAL: 'We are evaluating your technical skills and code qualifications.',
  HR_ROUND: 'Final discussions regarding details, culture, and alignment.',
  OFFER: 'Congratulations! An offer has been extended for your review.',
  HIRED: 'Welcome to the team! You have successfully completed the loop.',
  REJECTED: 'We have decided not to move forward with your application at this time.',
  WITHDRAWN: 'You have withdrawn your candidacy for this role.',
}

export default async function ApplicationTrackerPage({ params }: ApplicationTrackerProps) {
  const { applicationId } = await params

  const application = await db.application.findFirst({
    where: { id: applicationId, deletedAt: null },
    include: {
      candidate: true,
      job: { include: { organization: true } },
      offer: true,
      interviews: {
        where: { status: 'SCHEDULED' },
        include: { interviewer: { select: { name: true } } },
        orderBy: { scheduledAt: 'asc' },
      },
    },
  })

  if (!application) {
    notFound()
  }

  const { candidate, job, offer, interviews, stage } = application
  const org = job.organization

  const currentStageIndex = STAGES_ORDER.indexOf(stage)
  const isRejected = stage === 'REJECTED'
  const isWithdrawn = stage === 'WITHDRAWN'

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header banner */}
      <div className="border bg-card rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {org.name}
            </span>
            <span>•</span>
            <span className="capitalize">{job.employmentType.toLowerCase().replace('_', ' ')}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {job.title} Application Status
          </h1>
          <p className="text-xs text-muted-foreground">
            Candidate: <strong>{candidate.firstName} {candidate.lastName}</strong>
          </p>
        </div>

        <div>
          {isRejected && (
            <Badge variant="destructive" className="px-3 py-1 font-bold text-xs uppercase border-transparent">
              Rejected
            </Badge>
          )}
          {isWithdrawn && (
            <Badge variant="outline" className="px-3 py-1 font-bold text-xs uppercase border-muted-foreground/30">
              Withdrawn
            </Badge>
          )}
          {!isRejected && !isWithdrawn && (
            <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase bg-primary/10 text-primary border-transparent">
              {stage.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Offer letter display */}
      {stage === 'OFFER' && offer && offer.status === 'PENDING' && (
        <OfferActions
          applicationId={application.id}
          salary={offer.salary}
          currency={offer.currency}
          startDate={offer.startDate}
          notes={offer.notes}
        />
      )}

      {/* Main Grid: Status timeline & interviews */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Timeline */}
        <div className="md:col-span-2 border bg-card rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-foreground">Hiring Timeline</h2>

          {isRejected || isWithdrawn ? (
            <div className="bg-muted/50 p-4 rounded-xl border space-y-2 text-sm">
              <div className="font-semibold text-foreground">
                {isRejected ? 'Application Closed' : 'Candidacy Withdrawn'}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {STAGE_DESCRIPTIONS[stage]}
              </p>
            </div>
          ) : (
            <div className="relative border-l pl-4 ml-2 space-y-6">
              {STAGES_ORDER.map((s, idx) => {
                const isPassed = idx < currentStageIndex
                const isCurrent = idx === currentStageIndex
                const isFuture = idx > currentStageIndex

                return (
                  <div key={s} className="relative space-y-1">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                        isPassed
                          ? 'bg-primary border-primary'
                          : isCurrent
                            ? 'bg-background border-primary animate-pulse'
                            : 'bg-background border-muted'
                      }`}
                    />

                    <div className="pl-2">
                      <h3
                        className={`text-sm font-semibold tracking-tight ${
                          isCurrent
                            ? 'text-primary'
                            : isFuture
                              ? 'text-muted-foreground/60'
                              : 'text-foreground'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isCurrent ? STAGE_DESCRIPTIONS[s] : isPassed ? 'Completed stage.' : 'Upcoming stage.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Interviews & Contact */}
        <div className="md:col-span-1 space-y-6">
          {/* Upcoming Interviews */}
          <div className="border bg-card rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground">Your Interviews</h2>

            {interviews.length === 0 ? (
              <p className="text-xs text-muted-foreground">No upcoming interviews scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {interviews.map((iv) => (
                  <div key={iv.id} className="border-b last:border-0 pb-3 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground uppercase tracking-wide">
                        {iv.type.replace('_', ' ')} ROUND
                      </span>
                      <span className="text-muted-foreground">{iv.duration} mins</span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        {new Date(iv.scheduledAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {iv.location && (
                        <div className="flex items-center gap-1.5 truncate">
                          {iv.location.startsWith('http') ? (
                            <>
                              <Video className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                              <a href={iv.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                                Join Video Call
                              </a>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              {iv.location}
                            </>
                          )}
                        </div>
                      )}

                      {iv.interviewer.name && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Interviewer: <strong>{iv.interviewer.name}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Need help Card */}
          <div className="border bg-muted/40 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-foreground">Need help or changes?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you need to reschedule an interview or withdraw your application, please reach out to the recruiter directly at:
            </p>
            <div className="bg-card px-3 py-2 rounded-lg border text-xs font-semibold text-foreground truncate select-all">
              {org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-careers@hiretrack.ai
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
