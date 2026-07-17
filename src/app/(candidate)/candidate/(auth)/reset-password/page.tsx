import { CandidateResetPasswordForm } from '@/features/auth/components/candidate-reset-password-form'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Candidate Reset Password',
  description: 'Set a new password for your HireTrack AI candidate account.',
}

export default function CandidateResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <CandidateResetPasswordForm />
    </Suspense>
  )
}
