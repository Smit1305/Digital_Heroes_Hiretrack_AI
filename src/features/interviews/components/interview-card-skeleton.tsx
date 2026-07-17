import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function InterviewCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

export function InterviewsGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <InterviewCardSkeleton key={i} />
      ))}
    </div>
  )
}
