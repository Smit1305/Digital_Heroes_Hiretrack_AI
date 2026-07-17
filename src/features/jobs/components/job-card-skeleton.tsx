import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function JobCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="flex justify-between pt-1">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function JobsGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  )
}
