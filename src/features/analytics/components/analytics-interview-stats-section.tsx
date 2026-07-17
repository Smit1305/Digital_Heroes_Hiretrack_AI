import { getInterviewStatsAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import { LazyAnalyticsInterviewStats } from '@/components/lazy-charts'
import { AnalyticsInterviewStatsSkeleton } from './analytics-interview-stats'

interface AnalyticsInterviewStatsSectionProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsInterviewStatsSection({ range, dateFrom, dateTo }: AnalyticsInterviewStatsSectionProps) {
  const result = await getInterviewStatsAction(range, dateFrom, dateTo)

  if (!result.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Failed to load interview stats: {result.error}
      </div>
    )
  }

  return <LazyAnalyticsInterviewStats data={result.data} />
}

export { AnalyticsInterviewStatsSkeleton }

