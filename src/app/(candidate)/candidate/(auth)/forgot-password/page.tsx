import { CandidateForgotPasswordForm } from '@/features/auth/components/candidate-forgot-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Candidate Forgot Password',
  description: 'Request a password reset link for your candidate account.',
}

export default function CandidateForgotPasswordPage() {
  return <CandidateForgotPasswordForm />
}
