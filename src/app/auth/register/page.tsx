import { RegisterCompanyForm } from '@/features/auth/components/register-company-form'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Register Company / Organization — HireTrack AI',
  description: 'Onboard your company workspace and setup administrative owner details.',
}

function RegisterFallback() {
  return (
    <div className="w-full rounded-lg border bg-card p-6 shadow-sm max-w-lg mx-auto animate-pulse">
      <div className="space-y-4">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="h-4 w-64 max-w-full rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterCompanyForm />
    </Suspense>
  )
}
