import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Briefcase, Building, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Choose Account Type',
  description: 'Select whether you are looking for a job or hiring talent.',
}

export default function SelectAccountPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full text-center space-y-2 mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Welcome to HireTrack AI
        </h1>
        <p className="text-sm text-muted-foreground">
          To get started, please select the account type that matches your goal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {/* Candidate Card */}
        <Card className="flex flex-col hover:border-primary/50 hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold">Find your next job</CardTitle>
            <CardDescription>
              Submit applications, track status, and coordinate interview schedules.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-6 relative z-10">
            <ul className="space-y-2.5 text-sm text-muted-foreground" aria-label="Candidate features list">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Browse open jobs at top companies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Track application statuses live</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Coordinate calls and interview rounds</span>
              </li>
            </ul>

            <Link
              href="/candidate/signup"
              className={buttonVariants({ className: 'w-full py-6 text-sm font-semibold' })}
            >
              Continue as Candidate
            </Link>
          </CardContent>
        </Card>

        {/* Company Card */}
        <Card className="flex flex-col hover:border-primary/50 hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold">Hire your next employee</CardTitle>
            <CardDescription>
              Create job listings, filter pipelines, and automate team scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-6 relative z-10">
            <ul className="space-y-2.5 text-sm text-muted-foreground" aria-label="Company features list">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Create and distribute job listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Manage applicants with pipeline board</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Invite interviewers and rate scorecard</span>
              </li>
            </ul>

            <Link
              href="/pricing"
              className={buttonVariants({ className: 'w-full py-6 text-sm font-semibold' })}
            >
              Get Started
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
