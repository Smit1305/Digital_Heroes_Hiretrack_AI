'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a server configuration issue. Please contact support.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'This verification link has expired or has already been used.',
  OAuthSignin: 'Could not initiate sign in with this provider.',
  OAuthCallback: 'Could not complete sign in with this provider.',
  OAuthCreateAccount: 'Could not create an account using this provider.',
  EmailCreateAccount: 'Could not create an account with this email address.',
  Callback: 'An error occurred during sign in.',
  OAuthAccountNotLinked:
    'This email is already associated with another sign-in method. Please use your original sign-in method.',
  CredentialsSignin: 'Invalid email or password.',
  SessionRequired: 'You must be signed in to access this page.',
  Default: 'An unexpected error occurred. Please try again.',
}

export function AuthErrorView() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error') ?? 'Default'
  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Authentication error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/auth/login" className={cn(buttonVariants(), 'w-full')}>
          Try signing in again
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
          Go home
        </Link>
      </CardContent>
    </Card>
  )
}
