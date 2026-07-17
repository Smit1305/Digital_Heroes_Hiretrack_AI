'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateSubscriptionAction } from '@/server/actions/subscription'
import { CreditCard, Sparkles, Check, Loader2 } from 'lucide-react'

interface BillingViewProps {
  currentSubscription: {
    planName: string
    billingPeriod: string
    currentPeriodEnd: Date
    status: string
  }
  availablePlans: Array<{
    name: string
    monthlyPrice: number
    yearlyPrice: number
    features: string[]
  }>
}

export function BillingView({ currentSubscription, availablePlans }: BillingViewProps) {
  const router = useRouter()
  const [loadingName, setLoadingName] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>(
    (currentSubscription.billingPeriod as 'MONTHLY' | 'YEARLY') ?? 'MONTHLY'
  )

  async function handlePlanUpdate(targetPlanName: string) {
    if (targetPlanName === currentSubscription.planName && billingPeriod === currentSubscription.billingPeriod) {
      toast.info('You are already subscribed to this tier.')
      return
    }

    setLoadingName(targetPlanName)
    const toastId = toast.loading('Modifying subscription tier…')

    try {
      const result = await updateSubscriptionAction(
        targetPlanName as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
        billingPeriod
      )
      setLoadingName(null)

      if (result.success) {
        toast.success(result.message || 'Subscription updated successfully!', { id: toastId })
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update subscription.', { id: toastId })
      }
    } catch {
      toast.error('An unexpected error occurred.', { id: toastId })
      setLoadingName(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current plan detail */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Active Subscription
          </CardTitle>
          <CardDescription>Review billing specs and cycle settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase block">Plan Tier</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold uppercase text-foreground">{currentSubscription.planName}</span>
              <Badge className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-[10px] uppercase font-bold py-0.5 border-transparent">
                {currentSubscription.status}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase block">Billing Period</span>
            <span className="font-medium text-foreground mt-1 block uppercase">
              {currentSubscription.billingPeriod} Billing
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase block">Renews / Expires</span>
            <span className="font-medium text-foreground mt-1 block">
              {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade / Downgrade Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Modify Subscription Plan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Switch your workspace capabilities dynamically.</p>
          </div>

          {/* Settings Billing toggle */}
          <div className="flex bg-muted/60 p-0.5 border rounded-lg text-xs font-semibold">
            <button
              onClick={() => setBillingPeriod('MONTHLY')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                billingPeriod === 'MONTHLY' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('YEARLY')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                billingPeriod === 'YEARLY' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {availablePlans
            .filter((p) => p.name !== 'ENTERPRISE')
            .map((plan) => {
              const price = billingPeriod === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice
              const isCurrent =
                plan.name === currentSubscription.planName && billingPeriod === currentSubscription.billingPeriod
              const isPro = plan.name === 'PROFESSIONAL'

              return (
                <Card
                  key={plan.name}
                  className={`flex flex-col justify-between relative hover:border-foreground/30 transition-all ${
                    isCurrent ? 'border-primary ring-2 ring-primary/5 bg-primary/5' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                      {isCurrent && (
                        <Badge className="bg-primary/20 text-primary border-transparent text-[10px] uppercase font-bold">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-extrabold">${price}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {billingPeriod === 'MONTHLY' ? '/mo' : '/yr'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="border-t pt-4 bg-muted/5">
                    <Button
                      onClick={() => handlePlanUpdate(plan.name)}
                      disabled={loadingName !== null || isCurrent}
                      className="w-full text-xs font-semibold"
                      variant={isPro ? 'default' : 'outline'}
                    >
                      {loadingName === plan.name ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Updating…
                        </>
                      ) : isCurrent ? (
                        'Active Sub'
                      ) : (
                        'Switch Plan'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
        </div>
      </div>
    </div>
  )
}
