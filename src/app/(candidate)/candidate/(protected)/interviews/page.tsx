import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { buttonVariants } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Video, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'My Interviews — Candidate Portal',
}

export default async function CandidateInterviewsPage() {
  const session = await auth()

  if (!session?.user || !session.user.email) {
    redirect('/candidate/login')
  }

  // 1. Fetch Upcoming Interviews
  const upcomingInterviews = await db.interview.findMany({
    where: {
      candidate: {
        email: session.user.email,
        deletedAt: null,
      },
      scheduledAt: {
        gte: new Date(),
      },
      status: 'SCHEDULED',
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
      interviewer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  // 2. Fetch Historical/Completed Interviews
  const pastInterviews = await db.interview.findMany({
    where: {
      candidate: {
        email: session.user.email,
        deletedAt: null,
      },
      OR: [
        {
          scheduledAt: {
            lt: new Date(),
          },
        },
        {
          status: 'COMPLETED',
        },
      ],
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
      scheduledAt: 'desc',
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Coordinate calls, review panel details, and join virtual interview rooms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upcoming Round List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Schedules ({upcomingInterviews.length})
              </CardTitle>
              <CardDescription>
                Your planned calls and video assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No upcoming rounds scheduled. We will notify you when a recruiter coordinates a call.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((iv) => (
                    <div key={iv.id} className="border p-5 rounded-xl space-y-4 bg-muted/10 relative">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                            {iv.type.replace('_', ' ')} ROUND
                          </span>
                          <h4 className="font-semibold text-base text-foreground mt-1.5">
                            Interview for {iv.application.job.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            with {iv.application.job.organization.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>{iv.duration} mins</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t pt-3">
                        <div className="space-y-1 text-muted-foreground">
                          <span className="font-medium text-foreground block">Time & Date</span>
                          <span>
                            {new Date(iv.scheduledAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        
                        {iv.interviewer && (
                          <div className="space-y-1 text-muted-foreground">
                            <span className="font-medium text-foreground block">Host Interviewer</span>
                            <span>{iv.interviewer.name || 'Hiring Team'}</span>
                          </div>
                        )}
                      </div>

                      {iv.location && (
                        <div className="border-t pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-[250px]">
                            {iv.location.startsWith('http') ? (
                              <>
                                <Video className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="truncate">Online Video Call</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{iv.location}</span>
                              </>
                            )}
                          </div>
                          {iv.location.startsWith('http') && (
                            <a
                              href={iv.location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={buttonVariants({ className: 'py-2 px-4 h-9 text-xs font-semibold' })}
                            >
                              Join Call
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Past History */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                History
              </CardTitle>
              <CardDescription>
                Completed panel evaluations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pastInterviews.length === 0 ? (
                <div className="p-6 text-xs text-muted-foreground text-center">
                  No completed interviews recorded.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {pastInterviews.map((iv) => (
                    <div key={iv.id} className="p-4 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">
                          {iv.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold">
                          {iv.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate">
                        {iv.application.job.title} • {iv.application.job.organization.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(iv.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
