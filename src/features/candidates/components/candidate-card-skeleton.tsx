import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function CandidateCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex gap-1">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-10 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex justify-between pt-1">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CandidatesGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CandidateCardSkeleton key={i} />
      ))}
    </div>
  )
}
