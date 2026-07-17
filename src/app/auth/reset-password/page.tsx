import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your HireTrack AI account.',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
