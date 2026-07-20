'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
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
import { Separator } from '@/components/ui/separator'
import { GitHubIcon } from '@/features/auth/components/github-icon'
import { GoogleIcon } from '@/features/auth/components/google-icon'
import { cn } from '@/lib/utils'
import { signInSchema, type SignInInput } from '@/validators/auth'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'github' | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(data: SignInInput) {
    setServerError(null)
    try {
      const result = await signIn('credentials', {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setServerError('Invalid email or password. Please try again.')
        return
      }

      toast.success('Welcome back!')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setIsOAuthLoading(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch {
      toast.error('OAuth sign-in failed. Please try again.')
      setIsOAuthLoading(null)
    }
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Employer & Team Sign in</CardTitle>
        <CardDescription>Sign in to manage jobs, hiring pipelines, and interviews</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={!!isOAuthLoading || isSubmitting}
            onClick={() => handleOAuth('google')}
            className="w-full"
            aria-label="Sign in with Google"
          >
            {isOAuthLoading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleIcon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="ml-2">Google</span>
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={!!isOAuthLoading || isSubmitting}
            onClick={() => handleOAuth('github')}
            className="w-full"
            aria-label="Sign in with GitHub"
          >
            {isOAuthLoading === 'github' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <GitHubIcon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="ml-2">GitHub</span>
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>

        {/* Error alert */}
        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Credentials form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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

          <Button type="submit" className="w-full" disabled={isSubmitting || !!isOAuthLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="rounded-md border border-dashed bg-muted/50 p-3 text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground">Demo account</p>
          <p>Email: <span className="font-mono">demo@hiretrack.ai</span></p>
          <p>Password: <span className="font-mono">demo1234</span></p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 pt-0 text-xs text-muted-foreground">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0 h-auto font-medium text-xs')}
          >
            Create Employer Workspace
          </Link>
        </p>
        <p className="text-muted-foreground/80">
          Are you a job applicant?{' '}
          <Link
            href="/candidate/login"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0 h-auto font-medium text-xs text-primary')}
          >
            Sign in as Candidate
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
