export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-36 rounded bg-muted/60" />
        <div className="h-4 w-64 rounded bg-muted/60" />
      </div>

      {/* Tabs / Sub-nav Skeleton */}
      <div className="flex space-x-6 border-b pb-px">
        <div className="h-8 w-28 rounded-t bg-muted/60" />
        <div className="h-8 w-28 rounded-t bg-muted/60" />
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Panel Card Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-96 rounded-xl border border-border/40 bg-muted/10 p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-1/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/60" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-full rounded bg-muted/60" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 w-full rounded bg-muted/60" />
                <div className="h-10 w-full rounded bg-muted/60" />
              </div>
              <div className="h-10 w-full rounded bg-muted/60" />
            </div>
          </div>
        </div>

        {/* Sidebar Info Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="h-72 rounded-xl border border-border/40 bg-muted/10 p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted/60" />
              <div className="h-3 w-2/3 rounded bg-muted/60" />
            </div>
            <div className="space-y-4">
              <div className="h-12 w-full rounded bg-muted/60" />
              <div className="h-12 w-full rounded bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
