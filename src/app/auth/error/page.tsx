import { AuthErrorView } from '@/features/auth/components/auth-error-view'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Authentication Error',
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorView />
    </Suspense>
  )
}
