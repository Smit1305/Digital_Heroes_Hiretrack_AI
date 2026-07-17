import {
    CandidateSourcesChartSkeleton,
    HiringFunnelChartSkeleton,
    MonthlyHiringChartSkeleton,
    RecentApplicationsTableSkeleton,
    StatCardSkeleton,
    UpcomingInterviewsTableSkeleton,
} from '@/features/dashboard/components'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Loading dashboard">
      {/* Header skeleton */}
      <div className="space-y-1">
        <div className="h-7 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HiringFunnelChartSkeleton />
        <MonthlyHiringChartSkeleton />
        <CandidateSourcesChartSkeleton />
      </div>

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentApplicationsTableSkeleton />
        <UpcomingInterviewsTableSkeleton />
      </div>
    </div>
  )
}
