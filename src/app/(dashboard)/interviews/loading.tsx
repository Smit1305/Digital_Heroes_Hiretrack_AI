import { InterviewsGridSkeleton } from '@/features/interviews/components/interview-card-skeleton'

export default function InterviewsLoading() {
  return (
    <div className="space-y-5 p-4 sm:p-6" aria-busy="true" aria-label="Loading interviews">
      <div className="space-y-1.5">
        <div className="h-7 w-28 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-4 border-b pb-1">
        <div className="h-7 w-14 animate-pulse rounded bg-muted" />
        <div className="h-7 w-20 animate-pulse rounded bg-muted" />
      </div>
      {/* Filters skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-60 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
        <div className="ml-auto h-8 w-36 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      <InterviewsGridSkeleton />
    </div>
  )
}
