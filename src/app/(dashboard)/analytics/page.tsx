import {
  AnalyticsFunnelSectionSkeleton,
  AnalyticsInterviewStatsSkeleton,
  AnalyticsKpiGrid,
  AnalyticsRecruiterTableSkeleton,
  AnalyticsSourceSectionSkeleton,
  AnalyticsStageConversionSkeleton,
  AnalyticsTimeRangeFilter,
  AnalyticsTopJobsTableSkeleton,
  AnalyticsTrendsSectionSkeleton,
  KpiGridSkeleton,
  AnalyticsCustomDateFilter,
  AnalyticsExportDialog,
  AnalyticsDepartmentSection,
  AnalyticsInterviewSuccess,
} from '@/features/analytics/components'
import { AnalyticsFunnelSection } from '@/features/analytics/components/analytics-funnel-section'
import { AnalyticsInterviewStatsSection } from '@/features/analytics/components/analytics-interview-stats-section'
import { AnalyticsRecruiterTable } from '@/features/analytics/components/analytics-recruiter-table'
import { AnalyticsSourceSection } from '@/features/analytics/components/analytics-source-section'
import { AnalyticsStageConversionSection } from '@/features/analytics/components/analytics-stage-conversion-section'
import { AnalyticsTopJobsTable } from '@/features/analytics/components/analytics-top-jobs-table'
import { AnalyticsTrendsSection } from '@/features/analytics/components/analytics-trends-section'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getDepartmentAnalyticsAction, getInterviewSuccessAction } from '@/server/actions/analytics'
import { analyticsRangeSchema, type AnalyticsRange, RANGE_LABELS } from '@/types/analytics'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const revalidate = 0 // Disable cache to allow real-time filtering via query params

export const metadata: Metadata = {
  title: 'Analytics — HireTrack AI',
  description: 'Deep-dive into your hiring pipeline performance, funnel metrics, and team activity.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Inline Container Components for new sections to leverage Next.js Server Components Suspense architecture
async function DepartmentSectionContainer({ range, dateFrom, dateTo }: { range: AnalyticsRange; dateFrom?: string; dateTo?: string }) {
  const result = await getDepartmentAnalyticsAction(range, dateFrom, dateTo)
  return <AnalyticsDepartmentSection data={result.success ? result.data : []} />
}

async function InterviewSuccessContainer({ range, dateFrom, dateTo }: { range: AnalyticsRange; dateFrom?: string; dateTo?: string }) {
  const result = await getInterviewSuccessAction(range, dateFrom, dateTo)
  return <AnalyticsInterviewSuccess data={result.success ? result.data : []} />
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  if (!hasPermission(session.user.role, 'analytics:read')) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const rawRange = typeof params.range === 'string' ? params.range : '30d'
  const rangeParsed = analyticsRangeSchema.safeParse(rawRange)
  const range: AnalyticsRange = rangeParsed.success ? rangeParsed.data : '30d'

  const dateFrom = typeof params.dateFrom === 'string' ? params.dateFrom : undefined
  const dateTo = typeof params.dateTo === 'string' ? params.dateTo : undefined
  const isCustomRangeActive = !!(dateFrom && dateTo)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:flex-row print:items-center print:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isCustomRangeActive ? `Custom Range (${dateFrom} to ${dateTo})` : RANGE_LABELS[range]} · Hiring pipeline performance overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Suspense fallback={null}>
            <AnalyticsCustomDateFilter />
          </Suspense>
          <Suspense fallback={null}>
            <AnalyticsTimeRangeFilter currentRange={range} />
          </Suspense>
          <AnalyticsExportDialog range={range} />
        </div>
      </div>

      {/* KPI Grid */}
      <Suspense fallback={<KpiGridSkeleton />}>
        <AnalyticsKpiGrid range={range} dateFrom={dateFrom} dateTo={dateTo} />
      </Suspense>

      {/* Trends + Funnel */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Hiring trends and funnel"
      >
        <Suspense fallback={<AnalyticsTrendsSectionSkeleton />}>
          <AnalyticsTrendsSection range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
        <Suspense fallback={<AnalyticsFunnelSectionSkeleton />}>
          <AnalyticsFunnelSection range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </section>

      {/* Stage Conversion + Source Breakdown */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Stage conversion and candidate sources"
      >
        <Suspense fallback={<AnalyticsStageConversionSkeleton />}>
          <AnalyticsStageConversionSection range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
        <Suspense fallback={<AnalyticsSourceSectionSkeleton />}>
          <AnalyticsSourceSection range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </section>

      {/* Interview Stats + Success Ratings Chart */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Interview outcomes and evaluation ratings success"
      >
        <Suspense fallback={<AnalyticsInterviewStatsSkeleton />}>
          <AnalyticsInterviewStatsSection range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
        <Suspense fallback={<div className="h-[300px] animate-pulse bg-muted rounded-xl" />}>
          <InterviewSuccessContainer range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </section>

      {/* Department Analytics + Top Jobs + Recruiter Activity */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        aria-label="Department analytics, jobs, and recruiters performance"
      >
        <Suspense fallback={<div className="h-[350px] animate-pulse bg-muted rounded-xl" />}>
          <DepartmentSectionContainer range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
        <Suspense fallback={<AnalyticsTopJobsTableSkeleton />}>
          <AnalyticsTopJobsTable range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
        <Suspense fallback={<AnalyticsRecruiterTableSkeleton />}>
          <AnalyticsRecruiterTable range={range} dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </section>
    </div>
  )
}
