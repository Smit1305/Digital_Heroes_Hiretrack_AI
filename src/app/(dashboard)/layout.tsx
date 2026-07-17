import { AppShell } from '@/components/app-shell'
import { SkeletonPage } from '@/components/ui/skeleton-page'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

/**
 * Instructs crawlers not to index any authenticated dashboard route.
 * Individual pages may override this, but the default is noindex.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * All routes under (dashboard) require authentication + an organization.
 * The middleware handles the unauthenticated redirect, but we do a
 * server-side org check here so every protected page inherits it.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || !session.user.email) {
    redirect('/auth/login')
  }

  if (!session.user.organizationId) {
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

    redirect('/onboarding')
  }

  return (
    <AppShell user={session.user}>
      <Suspense fallback={<SkeletonPage />}>
        {children}
      </Suspense>
    </AppShell>
  )
}

