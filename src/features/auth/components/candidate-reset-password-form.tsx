'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { resetPasswordAction } from '@/server/actions/auth'
import { resetPasswordSchema, type ResetPasswordInput } from '@/validators/auth'

export function CandidateResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null)
    const result = await resetPasswordAction(data)
    if (!result.success) {
      setServerError(result.error)
      return
    }
    setSuccess(true)
    toast.success('Password updated. Please sign in with your new password.')
    setTimeout(() => router.push('/candidate/login'), 2000)
  }

  if (!token) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Invalid reset link</CardTitle>
          <CardDescription>
            This password reset link is missing or invalid. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link
            href="/candidate/forgot-password"
            className={cn(buttonVariants(), 'w-full')}
          >
            Request new link
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Password updated</CardTitle>
          <CardDescription>
            Your password has been updated successfully. Redirecting to sign in…
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/candidate/login" className={cn(buttonVariants(), 'w-full')}>
            Sign in now
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Set new password</CardTitle>
        <CardDescription>Choose a strong password for your candidate account.</CardDescription>
      </CardHeader>

      <CardContent>
        {serverError && (
          <Alert variant="destructive" role="alert" className="mb-4">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register('token')} />

          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-xs text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Updating password…
              </>
            ) : (
              'Reset password'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-0">
        <Link
          href="/candidate/login"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
