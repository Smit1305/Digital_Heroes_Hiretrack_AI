import {
    AnalyticsFunnelSectionSkeleton,
    AnalyticsInterviewStatsSkeleton,
    AnalyticsRecruiterTableSkeleton,
    AnalyticsSourceSectionSkeleton,
    AnalyticsStageConversionSkeleton,
    AnalyticsTopJobsTableSkeleton,
    AnalyticsTrendsSectionSkeleton,
    KpiGridSkeleton,
} from '@/features/analytics/components'

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Loading analytics">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-60 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* KPIs */}
      <KpiGridSkeleton />

      {/* Trends + Funnel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsTrendsSectionSkeleton />
        <AnalyticsFunnelSectionSkeleton />
      </div>

      {/* Stage Conversion + Sources */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsStageConversionSkeleton />
        <AnalyticsSourceSectionSkeleton />
      </div>

      {/* Interview Stats */}
      <AnalyticsInterviewStatsSkeleton />

      {/* Top Jobs + Recruiters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsTopJobsTableSkeleton />
        <AnalyticsRecruiterTableSkeleton />
      </div>
    </div>
  )
}
