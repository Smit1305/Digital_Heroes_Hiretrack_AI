import { OnboardingForm } from '@/features/auth/components/onboarding-form'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Set Up Your Workspace',
  description: 'Complete your HireTrack AI workspace setup.',
  robots: { index: false, follow: false },
}

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user || !session.user.email) {
    redirect('/auth/login')
  }

  // If user already has an org, skip onboarding
  if (session.user.organizationId) {
    redirect('/dashboard')
  }

  // Check if the logged-in user is a candidate
  const candidate = await db.candidate.findFirst({
    where: { email: session.user.email, deletedAt: null },
    include: {
      applications: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (candidate && candidate.applications.length > 0) {
    redirect(`/careers/applications/${candidate.applications[0].id}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background text-sm font-bold">H</span>
          </div>
          <span className="font-semibold">HireTrack AI</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Set up your workspace</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          You&apos;re almost there. Create your organization to get started.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <OnboardingForm userName={session.user.name ?? ''} />
      </div>
    </div>
  )
}
