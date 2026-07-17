import {
    CandidateSourcesChartSkeleton,
    HiringFunnelChartSkeleton,
    MonthlyHiringChartSkeleton,
    RecentApplicationsTableSkeleton,
    StatCardSkeleton,
    UpcomingInterviewsTableSkeleton,
} from '@/features/dashboard/components'
import { DashboardChartsRow } from '@/features/dashboard/components/dashboard-charts-row'
import { DashboardStatsGrid } from '@/features/dashboard/components/dashboard-stats-grid'
import { DashboardTablesRow } from '@/features/dashboard/components/dashboard-tables-row'
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Dashboard — HireTrack AI',
  description: 'Overview of your hiring pipeline, key metrics, and recent activity.',
}

// Revalidate dashboard data every 2 minutes
export const revalidate = 120

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userName = session.user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Good {getGreeting()}, {userName} 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your hiring pipeline today.
        </p>
      </div>

      {/* Stats — Suspense allows other sections to load in parallel */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStatsGrid />
      </Suspense>

      {/* Charts */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <HiringFunnelChartSkeleton />
            <MonthlyHiringChartSkeleton />
            <CandidateSourcesChartSkeleton />
          </div>
        }
      >
        <DashboardChartsRow />
      </Suspense>

      {/* Recent activity tables */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentApplicationsTableSkeleton />
            <UpcomingInterviewsTableSkeleton />
          </div>
        }
      >
        <DashboardTablesRow />
      </Suspense>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
