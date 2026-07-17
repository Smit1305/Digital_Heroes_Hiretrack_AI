import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your HireTrack AI password.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
