import { CandidatesGridSkeleton } from '@/features/candidates/components/candidate-card-skeleton'

export default function CandidatesLoading() {
  return (
    <div className="space-y-5 p-4 sm:p-6" aria-busy="true" aria-label="Loading candidates">
      <div className="space-y-1.5">
        <div className="h-7 w-28 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
        <div className="ml-auto h-8 w-36 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      <CandidatesGridSkeleton />
    </div>
  )
}
