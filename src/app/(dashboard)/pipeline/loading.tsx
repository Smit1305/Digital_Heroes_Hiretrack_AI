import { PipelineSkeleton } from '@/features/pipeline/components/pipeline-skeleton'

export default function PipelineLoading() {
  return (
    <div
      className="flex h-[calc(100vh-3.5rem)] flex-col gap-4 p-4 sm:p-6 overflow-hidden"
      aria-busy="true"
      aria-label="Loading pipeline"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="space-y-1.5">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      </div>

      <PipelineSkeleton />
    </div>
  )
}
