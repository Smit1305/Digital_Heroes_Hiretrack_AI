'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { forgotPasswordAction } from '@/server/actions/auth'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/validators/auth'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    await forgotPasswordAction(data)
    setSubmittedEmail(data.email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists for{' '}
            <span className="font-medium text-foreground">{submittedEmail}</span>, you will receive
            a password reset link shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="fp-email">Email address</Label>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'fp-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="fp-email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Sending link…
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-0">
        <Link
          href="/auth/login"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
