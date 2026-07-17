import { CandidateLoginForm } from '@/features/auth/components/candidate-login-form'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Candidate Sign In',
  description: 'Sign in to your HireTrack AI candidate account to track your applications and interviews.',
}

function LoginFormFallback() {
  return (
    <div className="w-full rounded-lg border bg-card p-6 shadow-sm" aria-label="Loading sign in form">
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-24 rounded bg-muted" />
        <div className="h-4 w-64 max-w-full rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <CandidateLoginForm />
    </Suspense>
  )
}
