import { getAnalyticsTrendsAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import { LazyAnalyticsTrendsChart } from '@/components/lazy-charts'
import { AnalyticsTrendsChartSkeleton } from './analytics-trends-chart'

interface AnalyticsTrendsSectionProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsTrendsSection({ range, dateFrom, dateTo }: AnalyticsTrendsSectionProps) {
  const result = await getAnalyticsTrendsAction(range, dateFrom, dateTo)
  return (
    <LazyAnalyticsTrendsChart
      data={result.success ? result.data : []}
      title="Hiring Trends"
      description="Applications vs hires over the selected period"
    />
  )
}

export { AnalyticsTrendsChartSkeleton as AnalyticsTrendsSectionSkeleton }

