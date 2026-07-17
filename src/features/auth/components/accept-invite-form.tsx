'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, CheckCircle2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { acceptInvitationAction } from '@/server/actions/users'

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>

const PASSWORD_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
]

interface AcceptInviteFormProps {
  token: string
  email: string
  orgName: string
  role: string
}

export function AcceptInviteForm({ token, email, orgName, role }: AcceptInviteFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token,
      name: '',
      password: '',
    },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  async function onSubmit(data: AcceptInvitationInput) {
    setServerError(null)

    const result = await acceptInvitationAction(data)

    if (!result.success) {
      setServerError(result.error || 'Failed to accept invitation.')
      return
    }

    toast.success('Invitation accepted successfully!')
    setSuccess(true)
    setTimeout(() => {
      router.push(`/auth/login?email=${encodeURIComponent(email)}`)
    }, 2500)
  }

  if (success) {
    return (
      <Card className="w-full shadow-sm max-w-md mx-auto text-center py-10 px-6 space-y-6">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Configured! 🎉</CardTitle>
          <CardDescription>
            You have successfully joined <strong>{orgName}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Redirecting you to the sign-in page…
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-sm max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">Accept Team Invitation</CardTitle>
        <CardDescription>
          Create your login credentials to join <strong>{orgName}</strong> as a{' '}
          <span className="font-semibold text-foreground">{role.toLowerCase().replace('_', ' ')}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register('token')} />

          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input type="email" value={email} disabled className="bg-muted/40 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-10"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}

            {/* Password strength checklist */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-md border border-dashed">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password)
                return (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${
                        passed ? 'text-green-500' : 'text-muted-foreground/30'
                      }`}
                    />
                    <span className={passed ? 'text-foreground font-medium' : ''}>
                      {rule.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <Button type="submit" className="w-full py-5 text-sm font-semibold mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up account…
              </>
            ) : (
              'Accept & Create Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
