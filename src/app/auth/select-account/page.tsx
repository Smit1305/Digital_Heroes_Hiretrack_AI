import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ChevronRight, UserCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Choose Account Type — HireTrack AI',
  description: 'Select whether you are hiring talent for your company or looking for your next job opportunity.',
}

export default function SelectAccountPage() {
  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          Welcome to HireTrack AI
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Select how you would like to use the platform to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Employer / Owner Card */}
        <Card className="flex flex-col justify-between border-2 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-lg p-6 sm:p-8 rounded-2xl bg-card">
          <div>
            <CardHeader className="space-y-4 p-0 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-8 ring-primary/5">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  Hire Your Next Employee
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  For employers, hiring managers, and recruiters building their dream team.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              <ul className="text-sm text-muted-foreground space-y-3 border-t border-b border-border/50 py-5">
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Post and manage active job listings</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Kanban candidate pipeline tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Schedule interviews & scorecards</span>
                </li>
              </ul>
            </CardContent>
          </div>

          <div className="space-y-3 pt-6">
            <Link
              href="/register-company"
              className="w-full h-auto min-h-[44px] py-3 px-5 flex items-center justify-between gap-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm group text-left"
            >
              <span className="leading-snug break-words">Register Company / Organization</span>
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="w-full h-auto min-h-[40px] py-2.5 px-5 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              Sign in to Workspace
            </Link>
          </div>
        </Card>

        {/* Candidate Card */}
        <Card className="flex flex-col justify-between border-2 hover:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-lg p-6 sm:p-8 rounded-2xl bg-card">
          <div>
            <CardHeader className="space-y-4 p-0 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 ring-8 ring-blue-500/5">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  Job Candidate
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  For job seekers applying to open roles and tracking interview progress.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              <ul className="text-sm text-muted-foreground space-y-3 border-t border-b border-border/50 py-5">
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Apply to active career postings</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Upload and manage candidate profile</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Track interview & offer status</span>
                </li>
              </ul>
            </CardContent>
          </div>

          <div className="space-y-3 pt-6">
            <Link
              href="/candidate/signup"
              className="w-full h-auto min-h-[44px] py-3 px-5 flex items-center justify-between gap-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm group text-left"
            >
              <span className="leading-snug break-words">Create Candidate Account</span>
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/candidate/login"
              className="w-full h-auto min-h-[40px] py-2.5 px-5 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              Candidate Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
