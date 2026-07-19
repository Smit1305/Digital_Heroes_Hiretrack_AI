'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { signUpAction } from '@/server/actions/auth'
import { signUpSchema, type SignUpInput } from '@/validators/auth'

const PASSWORD_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
]

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'github' | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  async function onSubmit(data: SignUpInput) {
    setServerError(null)

    const result = await signUpAction(data)

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof SignUpInput, { message: messages[0] })
        }
      } else {
        setServerError(result.error)
      }
      return
    }

    toast.success('Account created! Check your email to verify it.')
    router.push(`/auth/verify?email=${encodeURIComponent(result.data.email)}`)
    router.refresh()
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setIsOAuthLoading(provider)
    try {
      await signIn(provider, { callbackUrl: '/onboarding' })
    } catch {
      toast.error('OAuth sign-in failed. Please try again.')
      setIsOAuthLoading(null)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Hire Your Next Employee</CardTitle>
        <CardDescription>Create your employer workspace to post jobs & track candidates</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={!!isOAuthLoading || isSubmitting}
            onClick={() => handleOAuth('google')}
            aria-label="Sign up with Google"
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
            aria-label="Sign up with GitHub"
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
            or register with email
          </span>
        </div>

        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Work email</Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="reg-email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">
              Organization name{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="organizationName"
              type="text"
              placeholder="Acme Corp"
              aria-invalid={!!errors.organizationName}
              aria-describedby={errors.organizationName ? 'org-error' : undefined}
              {...register('organizationName')}
            />
            {errors.organizationName && (
              <p id="org-error" className="text-xs text-destructive" role="alert">
                {errors.organizationName.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.password}
                aria-describedby="password-requirements"
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

            {password.length > 0 && (
              <ul
                id="password-requirements"
                className="grid grid-cols-2 gap-1 mt-2"
                aria-label="Password requirements"
              >
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password)
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1 text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                    >
                      <CheckCircle2
                        className={`h-3 w-3 flex-shrink-0 ${met ? 'opacity-100' : 'opacity-30'}`}
                        aria-hidden="true"
                      />
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
            )}

            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="text-xs text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !!isOAuthLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 pt-0 text-xs text-muted-foreground">
        <p>
          Already have an employer account?{' '}
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0 h-auto font-medium text-xs')}
          >
            Sign in
          </Link>
        </p>
        <p className="text-muted-foreground/80">
          Looking for a job?{' '}
          <Link
            href="/candidate/signup"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0 h-auto font-medium text-xs text-primary')}
          >
            Create Candidate Account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
