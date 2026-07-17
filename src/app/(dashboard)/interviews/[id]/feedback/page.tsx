import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, Download, User, Mail, Phone, Calendar, Briefcase, Star, GraduationCap } from 'lucide-react'
import { db } from '@/lib/db'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScorecardForm } from '@/features/interviews/components/scorecard-form'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InterviewFeedbackPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  if (!hasPermission(session.user.role, 'interviews:feedback')) {
    redirect('/dashboard')
  }

  const orgId = session.user.organizationId
  if (!orgId) redirect('/onboarding')

  // Fetch interview with all required details
  const interview = await db.interview.findFirst({
    where: {
      id,
      application: {
        job: {
          organizationId: orgId,
        },
      },
    },
    include: {
      candidate: true,
      interviewer: true,
      application: {
        include: {
          job: true,
        },
      },
      scorecard: true,
    },
  })

  if (!interview) notFound()

  const candidateName = `${interview.candidate.firstName} ${interview.candidate.lastName}`
  const jobTitle = interview.application.job.title
  const stage = interview.application.stage

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/candidates/${interview.candidateId}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Candidate Profile
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Submit Interview Scorecard
        </h1>
        <p className="text-sm text-muted-foreground">
          Rate the performance of <span className="font-semibold text-foreground">{candidateName}</span> for the <span className="font-semibold text-foreground">{jobTitle}</span> position ({interview.type} round).
        </p>
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Candidate details / Context */}
        <div className="lg:col-span-5 space-y-5">
          {/* Candidate Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Candidate Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {interview.candidate.firstName[0]}{interview.candidate.lastName[0]}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{candidateName}</h2>
                  <p className="text-xs text-muted-foreground">{interview.candidate.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2 text-xs border-t divide-y divide-border">
                {interview.candidate.phone && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</span>
                    <span className="font-medium text-foreground">{interview.candidate.phone}</span>
                  </div>
                )}
                {interview.candidate.location && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Location</span>
                    <span className="font-medium text-foreground">{interview.candidate.location}</span>
                  </div>
                )}
                {interview.candidate.experience !== null && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> Experience</span>
                    <span className="font-medium text-foreground">{interview.candidate.experience} years</span>
                  </div>
                )}
                {interview.candidate.education && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Education</span>
                    <span className="font-medium text-foreground text-right truncate max-w-[180px]">{interview.candidate.education}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Application Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Applied For</span>
                <span className="font-semibold text-foreground">{jobTitle}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Stage</span>
                <Badge variant="secondary" className="capitalize font-semibold text-[10px]">{stage.toLowerCase()}</Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Scheduled Date</span>
                <span className="font-semibold text-foreground">{new Date(interview.scheduledAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Resume Card */}
          <Card className="border shadow-sm bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Candidate Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interview.candidate.resumeUrl ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 border bg-card rounded-lg p-3">
                    <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {interview.candidate.resumeFileName || 'Resume Document'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={interview.candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </a>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed rounded-lg bg-card/50">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-55" />
                  <p className="text-xs text-muted-foreground font-medium">No resume uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Scorecard Form */}
        <div className="lg:col-span-7">
          <Card className="border shadow-sm">
            <CardHeader className="border-b pb-3.5">
              <CardTitle className="text-base font-semibold">Scorecard Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ScorecardForm interview={interview} initialScorecard={interview.scorecard} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
