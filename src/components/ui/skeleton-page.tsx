/**
 * Full-page skeleton used as Suspense fallback for dashboard pages.
 */
export function SkeletonPage() {
  return (
    <div className="animate-pulse p-4 sm:p-6 lg:p-8 space-y-6" aria-busy="true" aria-label="Loading page content">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-muted" />
        <div className="h-4 w-80 rounded-md bg-muted/60" />
      </div>

      {/* Action bar skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-32 rounded-md bg-muted" />
        <div className="h-9 w-24 rounded-md bg-muted/60" />
        <div className="ml-auto h-9 w-28 rounded-md bg-muted" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted/80" />
            <div className="h-2 w-28 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b bg-muted/20 px-4 py-3">
          <div className="h-3 w-6 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="ml-auto h-3 w-16 rounded bg-muted" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b last:border-0 px-4 py-3.5">
            <div className="h-4 w-4 rounded bg-muted/60" />
            <div className="h-4 w-40 rounded bg-muted/50" />
            <div className="h-4 w-28 rounded bg-muted/40" />
            <div className="h-4 w-20 rounded bg-muted/30" />
            <div className="ml-auto h-4 w-16 rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
