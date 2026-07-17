import { JobsGridSkeleton } from '@/features/jobs/components/job-card-skeleton'

export default function JobsLoading() {
  return (
    <div className="space-y-5 p-4 sm:p-6" aria-busy="true" aria-label="Loading jobs">
      {/* Header skeleton */}
      <div className="space-y-1.5">
        <div className="h-7 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Search bar skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
        <div className="ml-auto h-8 w-36 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="h-3 w-24 animate-pulse rounded bg-muted" />

      {/* Grid skeleton */}
      <JobsGridSkeleton />
    </div>
  )
}
