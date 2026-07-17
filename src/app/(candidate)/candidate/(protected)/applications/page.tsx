import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Briefcase, Calendar, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Applications — Candidate Portal',
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

export default async function CandidateApplicationsPage() {
  const session = await auth()

  if (!session?.user || !session.user.email) {
    redirect('/candidate/login')
  }

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
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and track all job applications you have submitted.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            Applied Positions ({applications.length})
          </CardTitle>
          <CardDescription>
            Historical record of your submissions and their current statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Briefcase className="h-12 w-12 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground">You haven&apos;t applied to any roles yet.</p>
              <Link href="/careers" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors">
                Browse Careers
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Link
                      href={`/careers/applications/${app.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      {app.job.title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{app.job.organization.name}</span>
                      <span>•</span>
                      <span>{app.job.location || 'Remote'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Submitted on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`px-2.5 py-0.5 text-xs font-semibold ${STAGE_COLORS[app.stage] || 'bg-muted'}`}>
                      {app.stage.replace('_', ' ')}
                    </Badge>
                    <Link
                      href={`/careers/applications/${app.id}`}
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted/30 transition-colors"
                    >
                      Track Timeline
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
