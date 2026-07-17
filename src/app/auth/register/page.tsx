import { RegisterForm } from '@/features/auth/components/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free HireTrack AI account and start managing your hiring pipeline.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
