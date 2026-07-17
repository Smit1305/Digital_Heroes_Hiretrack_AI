'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, ShieldCheck, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ContactSalesPage() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [msg, setMsg] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
        <Card className="w-full shadow-sm max-w-md mx-auto text-center py-10 px-6 space-y-6">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Inquiry Sent! 📩</CardTitle>
            <CardDescription>
              Thanks for reaching out! Our enterprise success team will get back to <strong>{email}</strong> within 12 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pricing" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold inline-block">
              Back to Pricing
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <Card className="w-full shadow-sm max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Contact Enterprise Sales</CardTitle>
          <CardDescription>
            Learn about SSO integrations, dedicated SLA metrics, and custom APIs.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="salesName">Full Name</Label>
              <Input
                id="salesName"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salesEmail">Work Email</Label>
              <Input
                id="salesEmail"
                type="email"
                placeholder="john.doe@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salesCompany">Company Name</Label>
              <Input
                id="salesCompany"
                type="text"
                placeholder="Global Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salesMsg">How can our sales team help you?</Label>
              <textarea
                id="salesMsg"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about your team size, custom SSO demands, or volume..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full py-5 text-sm font-semibold mt-4">
              Submit Inquiry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
