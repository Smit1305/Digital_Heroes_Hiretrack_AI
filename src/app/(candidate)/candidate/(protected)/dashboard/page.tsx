import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Candidate Dashboard',
}

const STAGE_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent',
  SCREENING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent',
  INTERVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent',
  TECHNICAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-transparent',
  HR_ROUND: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-transparent',
  OFFER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-transparent animate-pulse',
  HIRED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-transparent',
}

export default async function CandidateDashboardPage() {
  const session = await auth()

  if (!session?.user || !session.user.email) {
    redirect('/candidate/login')
  }

  // 1. Fetch Candidate Applications
  const applications = await db.application.findMany({
    where: {
      candidate: {
        email: session.user.email,
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      job: {
        include: {
          organization: true,
        },
      },
      offer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 2. Fetch Scheduled/Upcoming Interviews
  const interviews = await db.interview.findMany({
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
          job: true,
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

  // 3. Fetch candidate's notifications
  const notifications = await db.notification.findMany({
    where: {
      userId: session.user.id,
      readAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
  })

  const pendingOffersCount = applications.filter(
    (app) => app.stage === 'OFFER' && app.offer?.status === 'PENDING'
  ).length

  return (
    <div className="space-y-8">
      {/* Top Banner Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border bg-card p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Welcome, {session.user.name?.split(' ')[0] ?? 'Candidate'}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your job application progress and upcoming interview schedules.
          </p>
        </div>

        {/* Quick Stats Indicator */}
        <div className="flex items-center gap-3">
          <Badge className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-transparent text-xs font-semibold">
            {applications.length} Active {applications.length === 1 ? 'Application' : 'Applications'}
          </Badge>
          {pendingOffersCount > 0 && (
            <Badge className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-transparent animate-bounce text-xs font-semibold">
              {pendingOffersCount} Job Offer Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Applications & Interviews */}
        <div className="md:col-span-2 space-y-8">
          {/* Applications list */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                My Applications
              </CardTitle>
              <CardDescription>
                Live status tracking for jobs you have applied to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
                  <Link href="/careers" className={buttonVariants({ size: 'sm' })}>
                    Browse Open Jobs
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {applications.map((app) => (
                    <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <Link
                          href={`/careers/applications/${app.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          {app.job.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{app.job.organization.name}</span>
                          <span>•</span>
                          <span>
                            Applied {new Date(app.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={STAGE_COLORS[app.stage] || 'bg-muted'}>
                          {app.stage.replace('_', ' ')}
                        </Badge>
                        <Link
                          href={`/careers/applications/${app.id}`}
                          className={buttonVariants({ variant: 'outline', size: 'xs' })}
                        >
                          Track
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Interviews */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Upcoming Interviews
              </CardTitle>
              <CardDescription>
                Scheduled virtual and in-person interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No upcoming interviews scheduled.
                </p>
              ) : (
                <div className="space-y-4">
                  {interviews.map((iv) => (
                    <div key={iv.id} className="border p-4 rounded-xl space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          {iv.type.replace('_', ' ')} ROUND
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{iv.duration} mins</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          Interview for {iv.application.job.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Date:{' '}
                          <strong>
                            {new Date(iv.scheduledAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </strong>
                        </p>
                      </div>

                      {iv.location && (
                        <div className="text-xs border-t pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                            {iv.location.startsWith('http') ? (
                              <>
                                <Video className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <span className="truncate">Online Video Call</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{iv.location}</span>
                              </>
                            )}
                          </div>
                          {iv.location.startsWith('http') && (
                            <a
                              href={iv.location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={buttonVariants({ variant: 'link', size: 'xs' }) + ' p-0 h-auto font-semibold'}
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

        {/* Right 1 Col: Quick Actions & Notifications */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2.5">
              <Link
                href="/candidate/profile"
                className={buttonVariants({ variant: 'outline', className: 'justify-start w-full' })}
              >
                <FileText className="mr-2 h-4 w-4" />
                Edit Profile & Resume
              </Link>
              <Link
                href="/careers"
                className={buttonVariants({ className: 'justify-start w-full' })}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Explore Careers Site
              </Link>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-green-500/80" />
                  <span>Your inbox is empty. You are all caught up!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="text-xs flex gap-2 items-start border-b pb-2 last:border-0 last:pb-0">
                      <AlertCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-foreground font-medium">{notif.title}</p>
                        <p className="text-muted-foreground leading-relaxed">{notif.body}</p>
                        <p className="text-[10px] text-muted-foreground/60">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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
