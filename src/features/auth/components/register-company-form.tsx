'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { companyRegisterSchema, type CompanyRegisterInput } from '@/validators/company'
import { OrgPlan } from '@/types/enums'

const PASSWORD_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
]

export function RegisterCompanyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Normalize plan names: pro -> PRO, starter -> STARTER
  const planParamRaw = searchParams.get('plan') ?? 'STARTER'
  const planParam = (planParamRaw.toLowerCase() === 'pro' ? 'PRO' : planParamRaw.toUpperCase()) as OrgPlan
  const billingParam = (searchParams.get('billing') ?? 'monthly').toUpperCase() as 'MONTHLY' | 'YEARLY'

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompanyRegisterInput>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: '',
      companySize: '',
      industry: '',
      fullName: '',
      email: '',
      password: '',
      plan: planParam,
      billingPeriod: billingParam,
    },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''
  const selectedPlan = useWatch({ control, name: 'plan' }) ?? planParam
  const selectedBilling = useWatch({ control, name: 'billingPeriod' }) ?? billingParam

  // Keep plan updated if URL changes
  useEffect(() => {
    if (Object.values(OrgPlan).includes(planParam)) {
      setValue('plan', planParam)
    }
    if (['MONTHLY', 'YEARLY'].includes(billingParam)) {
      setValue('billingPeriod', billingParam)
    }
  }, [planParam, billingParam, setValue])

  async function onSubmit(data: CompanyRegisterInput) {
    setServerError(null)

    // 1. Client-side check: does email already exist?
    try {
      const checkRes = await fetch(`/api/auth/check-email?email=${encodeURIComponent(data.email)}`)
      const checkData = await checkRes.json()
      if (checkData.exists) {
        setError('email', { message: 'An account with this email already exists.' })
        return
      }
    } catch {
      // Allow fallback if endpoint isn't fully compiled yet
    }

    // 2. Save registration data in sessionStorage
    try {
      sessionStorage.setItem('hiretrack_temp_company_reg', JSON.stringify(data))
      toast.success('Registration details saved. Redirecting to checkout…')
      router.push(`/checkout?plan=${data.plan.toLowerCase()}&billing=${data.billingPeriod.toLowerCase()}`)
    } catch {
      setServerError('Failed to process registration details. Please try again.')
    }
  }

  return (
    <Card className="w-full shadow-sm max-w-lg mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Register Your Organization</CardTitle>
        <CardDescription>
          Onboard your company workspace and configure owner admin credentials.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Plan Choice Display */}
          <div className="bg-muted/40 p-3 rounded-lg border flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-foreground">Plan Selected:</span>
              <span className="ml-1 text-primary font-bold uppercase">{selectedPlan}</span>
              <span className="ml-2 bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-primary/20">
                {selectedBilling}
              </span>
            </div>
            <Link href="/pricing" className="text-xs text-primary font-semibold hover:underline">
              Change Plan
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm border-b pb-1">Company Details</h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Acme Corp"
                aria-invalid={!!errors.companyName}
                {...register('companyName')}
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  onValueChange={(val) => setValue('companySize', val ?? '', { shouldValidate: true })}
                  defaultValue=""
                >
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <p className="text-xs text-destructive">{errors.companySize.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  type="text"
                  placeholder="Technology"
                  aria-invalid={!!errors.industry}
                  {...register('industry')}
                />
                {errors.industry && (
                  <p className="text-xs text-destructive">{errors.industry.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-sm border-b pb-1">Company Owner Details</h3>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                aria-invalid={!!errors.fullName}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@acme.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
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
          </div>

          <Button type="submit" className="w-full py-5 text-sm font-semibold mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              'Proceed to Checkout'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
