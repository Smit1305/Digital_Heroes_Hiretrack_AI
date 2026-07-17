'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerCompanyAction } from '@/server/actions/company'
import { type CompanyRegisterInput } from '@/validators/company'
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const PLAN_AMOUNTS: Record<string, Record<string, string>> = {
  STARTER: {
    MONTHLY: '$29.00',
    YEARLY: '$279.00',
  },
  PRO: {
    MONTHLY: '$99.00',
    YEARLY: '$949.00',
  },
  ENTERPRISE: {
    MONTHLY: '$0.00',
    YEARLY: '$0.00',
  },
}

export function CheckoutView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParamRaw = searchParams.get('plan') ?? 'STARTER'
  const planParam = (planParamRaw.toLowerCase() === 'pro' ? 'PRO' : planParamRaw.toUpperCase())
  const billingParam = (searchParams.get('billing') ?? 'MONTHLY').toUpperCase()

  const [regData, setRegData] = useState<CompanyRegisterInput | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Card input states (simulated)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  useEffect(() => {
    try {
      const dataStr = sessionStorage.getItem('hiretrack_temp_company_reg')
      if (dataStr) {
        const parsed = JSON.parse(dataStr) as CompanyRegisterInput
        setRegData(parsed)
        setCardName(parsed.fullName)
      }
    } catch (e) {
      console.error('Failed to load temporary registration data:', e)
    }
  }, [])

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!regData) return

    if (!cardNumber || !cardExpiry || !cardCvc) {
      toast.error('Please enter card details to complete payment.')
      return
    }

    setLoading(true)
    setServerError(null)
    const toastId = toast.loading('Simulating transaction via payment processor…')

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      const result = await registerCompanyAction(regData)

      if (!result.success) {
        setServerError(result.error || 'Failed to complete registration.')
        toast.error('Payment rejected. Please try again.', { id: toastId })
        setLoading(false)
        return
      }

      toast.success('Payment completed successfully!', { id: toastId })
      setSuccess(true)
      sessionStorage.removeItem('hiretrack_temp_company_reg')
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(result.data.email)}`)
      }, 3000)
    } catch {
      setServerError('An unexpected network error occurred.')
      setLoading(false)
    }
  }

  if (!regData) {
    return (
      <Card className="w-full shadow-sm max-w-md mx-auto text-center p-6">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Onboarding session expired</CardTitle>
          <CardDescription>
            We could not find your organization details. Please complete the registration form first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/pricing" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold inline-block">
            View Pricing & Register
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full shadow-sm max-w-md mx-auto text-center py-10 px-6 space-y-6">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Workspace Ready! 🎉</CardTitle>
          <CardDescription>
            Your payment succeeded and the organization workspace for <strong>{regData.companyName}</strong> has been configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Redirecting you to the login screen to activate your session…
        </CardContent>
      </Card>
    )
  }

  const billingRates = PLAN_AMOUNTS[planParam] ?? PLAN_AMOUNTS.STARTER
  const amount = billingRates[billingParam] ?? billingRates.MONTHLY

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-4xl mx-auto items-start">
      {/* Plan summary */}
      <Card className="md:col-span-2 shadow-sm bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base font-bold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Plan tier</span>
            <span className="font-semibold uppercase text-foreground">{regData.plan}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Owner email</span>
            <span className="font-semibold text-foreground truncate max-w-[120px]">{regData.email}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Company name</span>
            <span className="font-semibold text-foreground">{regData.companyName}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>Due Now</span>
            <span className="text-primary">{amount}</span>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground flex items-start gap-1.5 pt-0">
          <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span>Secured payment processing simulation. No real money will be charged.</span>
        </CardFooter>
      </Card>

      {/* Simulated credit card form */}
      <Card className="md:col-span-3 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Enter payment card details below to activate subscription.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {serverError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                maxLength={19}
                placeholder="4242 •••• •••• 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cardExpiry">Expiration Date</Label>
                <Input
                  id="cardExpiry"
                  type="text"
                  maxLength={5}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  type="text"
                  maxLength={3}
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-5 text-sm font-semibold mt-4" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing payment…
                </>
              ) : (
                `Pay ${amount}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
