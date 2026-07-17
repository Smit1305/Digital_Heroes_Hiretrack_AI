import { CheckoutView } from '@/features/auth/components/checkout-view'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Billing Checkout',
  description: 'Simulated checkout processing to activate company ATS subscriptions.',
}

function CheckoutFallback() {
  return (
    <div className="w-full max-w-lg mx-auto py-12 text-center animate-pulse">
      <div className="h-6 w-32 rounded bg-muted mx-auto mb-4" />
      <div className="h-4 w-64 rounded bg-muted mx-auto" />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Suspense fallback={<CheckoutFallback />}>
        <CheckoutView />
      </Suspense>
    </div>
  )
}
