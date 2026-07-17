import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Check Your Email',
  description: 'Verify your candidate account.',
}

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string
  }>
}

export default async function CandidateVerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams

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
          . Open it to activate your candidate account.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Didn&apos;t receive an email? Check your spam folder, or try again.
        </p>
        <Link
          href="/candidate/login"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  )
}
