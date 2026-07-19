import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, Building2, ChevronRight, UserCheck, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Choose Account Type — HireTrack AI',
  description: 'Select whether you are hiring talent for your company or looking for your next job opportunity.',
}

export default function SelectAccountPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to HireTrack AI</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Select how you would like to use the platform to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employer / Owner Card */}
        <Card className="flex flex-col justify-between border-2 hover:border-foreground/40 transition-all shadow-sm hover:shadow-md">
          <CardHeader className="space-y-3 pb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Hire Your Next Employee</CardTitle>
              <CardDescription className="text-xs mt-1">
                For employers, hiring managers, and recruiters building their team.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Post and manage job listings
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Kanban candidate pipeline
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Schedule interviews & scorecards
              </li>
            </ul>

            <div className="space-y-2 pt-2">
              <Link
                href="/auth/register"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full justify-between')}
              >
                <span>Create Employer Account</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full text-xs')}
              >
                Sign in to Workspace
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Card */}
        <Card className="flex flex-col justify-between border-2 hover:border-foreground/40 transition-all shadow-sm hover:shadow-md">
          <CardHeader className="space-y-3 pb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Job Candidate</CardTitle>
              <CardDescription className="text-xs mt-1">
                For job seekers applying to roles and tracking interview progress.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Apply to active career postings
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Upload and manage candidate profile
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Track interview & offer status
              </li>
            </ul>

            <div className="space-y-2 pt-2">
              <Link
                href="/candidate/signup"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full justify-between bg-blue-600 hover:bg-blue-700 text-white')}
              >
                <span>Create Candidate Account</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/candidate/login"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full text-xs')}
              >
                Candidate Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
