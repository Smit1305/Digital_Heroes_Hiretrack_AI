import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { verifyEmailAction } from '@/server/actions/auth'
import { CheckCircle2, Mail, TriangleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Check Your Email',
}

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string
    token?: string
  }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email, token } = await searchParams

  if (token) {
    const result = await verifyEmailAction({ token })

    if (result.success) {
      return (
        <Card className="w-full shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">Email verified</CardTitle>
            <CardDescription>
              Your email address has been verified. You can now sign in to HireTrack AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={result.data.role === 'CANDIDATE' ? "/candidate/login" : "/auth/login"}
              className={cn(buttonVariants(), 'w-full')}
            >
              Sign in
            </Link>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Verification failed</CardTitle>
          <CardDescription>{result.error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We sent a verification link
          {email ? (
            <>
              {' '}
              to <span className="font-medium text-foreground">{email}</span>
            </>
          ) : null}
          . Open it to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Didn&apos;t receive an email? Check your spam folder, or try again.
        </p>
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  )
}
