'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Check, X, ArrowRight, Sparkles, Building2, HelpCircle } from 'lucide-react'

// Plan specifications
const PLANS = {
  starter: {
    name: 'Starter',
    badge: 'For startups',
    monthlyPrice: 29,
    yearlyPrice: 279,
    description: 'Perfect for small growing teams.',
    features: [
      { label: '5 team members', included: true },
      { label: '20 active jobs', included: true },
      { label: '500 candidates', included: true },
      { label: 'Candidate pipeline', included: true },
      { label: 'Resume uploads', included: true },
      { label: 'Email notifications', included: true },
      { label: 'Basic analytics', included: true },
      { label: 'Team collaboration', included: true },
      { label: 'Advanced analytics', included: false },
      { label: 'Custom branding', included: false },
      { label: 'API access', included: false },
    ],
    buttonText: 'Start Free Trial',
    popular: false,
  },
  professional: {
    name: 'Professional',
    badge: 'Most Popular',
    monthlyPrice: 99,
    yearlyPrice: 949,
    description: 'Advanced pipeline tracking and reports.',
    features: [
      { label: 'Unlimited team members', included: true },
      { label: 'Unlimited jobs', included: true },
      { label: 'Unlimited candidates', included: true },
      { label: 'Kanban pipeline', included: true },
      { label: 'Interview scheduling', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Reports export', included: true },
      { label: 'Role management', included: true },
      { label: 'Custom workflows', included: true },
      { label: 'Team permissions', included: true },
      { label: 'Email templates', included: true },
      { label: 'SSO', included: false },
      { label: 'White-label', included: false },
    ],
    buttonText: 'Get Started',
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    badge: 'For large organizations',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    description: 'Custom security controls and SLAs.',
    features: [
      { label: 'Everything in Professional', included: true },
      { label: 'SSO (Google/Microsoft)', included: true },
      { label: 'API access', included: true },
      { label: 'White-label branding', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Advanced security', included: true },
      { label: 'Audit logs', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'SLA', included: true },
      { label: 'Priority support', included: true },
    ],
    buttonText: 'Contact Sales',
    popular: false,
  },
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 space-y-20 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="bg-primary/10 text-primary text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-primary/20">
          Flexible Pricing
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
          Simple pricing for growing hiring teams
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Everything you need to manage candidates, schedule interviews, and hire faster.
        </p>

        {/* Billing Period Selector Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(v => v === 'monthly' ? 'yearly' : 'monthly')}
            className="h-6 w-11 rounded-full bg-muted border p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary relative"
            aria-label="Toggle billing period"
          >
            <span
              className={`h-4.5 w-4.5 rounded-full bg-foreground block shadow transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-200 dark:border-green-900 font-bold">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Starter Plan */}
        <Card className="flex flex-col relative hover:border-foreground/30 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {PLANS.starter.badge}
            </span>
            <CardTitle className="text-2xl font-bold mt-1">{PLANS.starter.name}</CardTitle>
            <CardDescription>{PLANS.starter.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline text-foreground">
              <span className="text-4xl font-extrabold tracking-tight">
                {billingPeriod === 'monthly' ? `$${PLANS.starter.monthlyPrice}` : `$${PLANS.starter.yearlyPrice}`}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                {billingPeriod === 'monthly' ? '/month' : '/year'}
              </span>
            </div>

            <ul className="space-y-2.5 text-sm text-muted-foreground" aria-label="Starter Plan features">
              {PLANS.starter.features.map((feat) => (
                <li key={feat.label} className="flex items-center gap-2">
                  {feat.included ? (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={feat.included ? 'text-foreground/90' : 'text-muted-foreground/50 line-through'}>
                    {feat.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link
              href={`/register-company?plan=starter&billing=${billingPeriod}`}
              className={buttonVariants({ variant: 'outline', className: 'w-full py-5 text-sm font-semibold' })}
            >
              {PLANS.starter.buttonText}
            </Link>
          </CardFooter>
        </Card>

        {/* Professional Plan (Recommended) */}
        <Card className="flex flex-col relative border-primary hover:shadow-lg transition-all duration-300 ring-4 ring-primary/5 bg-background scale-102 z-10">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest px-3.5 py-1 rounded-full border border-primary flex items-center gap-1 shadow-sm">
            <Sparkles className="h-3 w-3" />
            {PLANS.professional.badge}
          </span>
          <CardHeader className="pb-4 pt-7">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
              For scaling teams
            </span>
            <CardTitle className="text-2xl font-bold mt-1">{PLANS.professional.name}</CardTitle>
            <CardDescription>{PLANS.professional.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline text-foreground">
              <span className="text-4xl font-extrabold tracking-tight">
                {billingPeriod === 'monthly' ? `$${PLANS.professional.monthlyPrice}` : `$${PLANS.professional.yearlyPrice}`}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                {billingPeriod === 'monthly' ? '/month' : '/year'}
              </span>
            </div>

            <ul className="space-y-2.5 text-sm text-muted-foreground" aria-label="Professional Plan features">
              {PLANS.professional.features.map((feat) => (
                <li key={feat.label} className="flex items-center gap-2">
                  {feat.included ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={feat.included ? 'text-foreground/90 font-medium' : 'text-muted-foreground/50 line-through'}>
                    {feat.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link
              href={`/register-company?plan=pro&billing=${billingPeriod}`}
              className={buttonVariants({ className: 'w-full py-5 text-sm font-semibold' })}
            >
              {PLANS.professional.buttonText}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="flex flex-col relative hover:border-foreground/30 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {PLANS.enterprise.badge}
            </span>
            <CardTitle className="text-2xl font-bold mt-1">{PLANS.enterprise.name}</CardTitle>
            <CardDescription>{PLANS.enterprise.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline text-foreground">
              <span className="text-4xl font-extrabold tracking-tight">
                {PLANS.enterprise.monthlyPrice}
              </span>
            </div>

            <ul className="space-y-2.5 text-sm text-muted-foreground" aria-label="Enterprise Plan features">
              {PLANS.enterprise.features.map((feat) => (
                <li key={feat.label} className="flex items-center gap-2">
                  {feat.included ? (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={feat.included ? 'text-foreground/90' : 'text-muted-foreground/50 line-through'}>
                    {feat.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Link
              href="/contact-sales"
              className={buttonVariants({ variant: 'outline', className: 'w-full py-5 text-sm font-semibold' })}
            >
              {PLANS.enterprise.buttonText}
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Trust & statistics panel */}
      <div className="border bg-card/60 p-8 rounded-2xl shadow-sm space-y-8 text-center">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">
            Platform Activity
          </span>
          <h2 className="text-xl font-bold mt-1.5">Trusted by growing teams globally</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-primary">10,000+</div>
            <div className="text-xs text-muted-foreground">Candidates processed</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-primary">500+</div>
            <div className="text-xs text-muted-foreground">Active corporate spaces</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-primary">50,000+</div>
            <div className="text-xs text-muted-foreground">Interviews scheduled</div>
          </div>
        </div>

        {/* Fake logos */}
        <div className="pt-4 flex flex-wrap justify-center items-center gap-x-10 gap-y-4 opacity-40 grayscale text-sm font-semibold tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> ACME CLOUD</span>
          <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> VECORP</span>
          <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> LINEARIX</span>
          <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> GLOBEX</span>
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center sm:text-2xl">Compare subscription features</h2>
        <div className="border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <th className="p-4 w-1/3">Feature</th>
                <th className="p-4 text-center">Starter</th>
                <th className="p-4 text-center">Professional</th>
                <th className="p-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 font-medium">Team members</td>
                <td className="p-4 text-center text-muted-foreground">5</td>
                <td className="p-4 text-center font-semibold text-primary">Unlimited</td>
                <td className="p-4 text-center font-semibold text-primary">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Active jobs limit</td>
                <td className="p-4 text-center text-muted-foreground">20</td>
                <td className="p-4 text-center font-semibold text-primary">Unlimited</td>
                <td className="p-4 text-center font-semibold text-primary">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Candidates limit</td>
                <td className="p-4 text-center text-muted-foreground">500</td>
                <td className="p-4 text-center font-semibold text-primary">Unlimited</td>
                <td className="p-4 text-center font-semibold text-primary">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Resume uploads</td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Interview scheduling</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Analytics reports</td>
                <td className="p-4 text-center text-muted-foreground">Basic</td>
                <td className="p-4 text-center text-muted-foreground">Advanced</td>
                <td className="p-4 text-center text-muted-foreground">Advanced</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Team permissions / roles</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium">SSO Security</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium">API access & webhooks</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 font-medium">White-label branding</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-muted-foreground/30 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-center sm:text-2xl flex items-center justify-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1.5 border p-4.5 rounded-xl bg-card">
            <h4 className="font-bold text-foreground">Can I change my plan later?</h4>
            <p className="text-muted-foreground leading-relaxed">
              Yes, you can upgrade or downgrade your team subscription plan at any time directly in your organization settings dashboard.
            </p>
          </div>
          <div className="space-y-1.5 border p-4.5 rounded-xl bg-card">
            <h4 className="font-bold text-foreground">Is there a free trial?</h4>
            <p className="text-muted-foreground leading-relaxed">
              Yes, all plans (Starter and Professional) come with a full 14-day free trial so your team can test-drive features.
            </p>
          </div>
          <div className="space-y-1.5 border p-4.5 rounded-xl bg-card">
            <h4 className="font-bold text-foreground">What payment methods are supported?</h4>
            <p className="text-muted-foreground leading-relaxed">
              We support standard credit cards (Visa, MasterCard, Amex) for all plans. Invoice billing is available for Enterprise clients.
            </p>
          </div>
          <div className="space-y-1.5 border p-4.5 rounded-xl bg-card">
            <h4 className="font-bold text-foreground">Can I cancel anytime?</h4>
            <p className="text-muted-foreground leading-relaxed">
              Yes. If you choose to cancel, your active subscription benefits will remain active until the end of your current billing cycle.
            </p>
          </div>
          <div className="space-y-1.5 border p-4.5 rounded-xl bg-card sm:col-span-2">
            <h4 className="font-bold text-foreground">What happens after the trial ends?</h4>
            <p className="text-muted-foreground leading-relaxed">
              After 14 days, you can choose to activate invoice payments or subscribe using a card to continue accessing your candidate pipelines and posting jobs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
