'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboardingAction } from '@/server/actions/onboarding'

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Media & Entertainment',
  'Real Estate',
  'Consulting',
  'Other',
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '501-1000', label: '501–1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
]

const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be 100 characters or less')
    .trim(),
  industry: z.string().optional(),
  size: z.string().optional(),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

interface OnboardingFormProps {
  userName: string
}

export function OnboardingForm({ userName }: OnboardingFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const firstName = userName.split(' ')[0] ?? 'there'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
  })

  async function onSubmit(data: OnboardingFormValues) {
    setServerError(null)

    const result = await completeOnboardingAction(data)

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof OnboardingFormValues, { message: messages[0] })
        }
      } else {
        setServerError(result.error)
      }
      return
    }

    toast.success('Workspace created! Welcome to HireTrack AI.')
    // Hard refresh so the session picks up the new organizationId
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-center mb-3 h-12 w-12 rounded-xl bg-primary/10 mx-auto">
          <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl font-semibold text-center">
          Hi {firstName}, let&apos;s set up your workspace
        </CardTitle>
        <CardDescription className="text-center">
          Tell us a bit about your organization — you can always change this later.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError && (
          <Alert variant="destructive" role="alert" className="mb-4">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Organization name */}
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">
              Organization name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="organizationName"
              type="text"
              autoComplete="organization"
              placeholder="Acme Corp"
              autoFocus
              aria-invalid={!!errors.organizationName}
              aria-describedby={errors.organizationName ? 'org-name-error' : undefined}
              {...register('organizationName')}
            />
            {errors.organizationName && (
              <p id="org-name-error" className="text-xs text-destructive" role="alert">
                {errors.organizationName.message}
              </p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <Label htmlFor="industry">
              Industry{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <select
              id="industry"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              aria-describedby={errors.industry ? 'industry-error' : undefined}
              {...register('industry')}
            >
              <option value="">Select an industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p id="industry-error" className="text-xs text-destructive" role="alert">
                {errors.industry.message}
              </p>
            )}
          </div>

          {/* Company size */}
          <div className="space-y-1.5">
            <Label htmlFor="size">
              Company size{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <select
              id="size"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              aria-describedby={errors.size ? 'size-error' : undefined}
              {...register('size')}
            >
              <option value="">Select company size…</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.size && (
              <p id="size-error" className="text-xs text-destructive" role="alert">
                {errors.size.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Creating workspace…
              </>
            ) : (
              <>
                Create workspace
                <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
