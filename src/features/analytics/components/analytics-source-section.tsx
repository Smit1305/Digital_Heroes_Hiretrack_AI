import { getAnalyticsSourcesAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import { LazyCandidateSourcesChart } from '@/components/lazy-charts'
import { CandidateSourcesChartSkeleton } from '@/features/dashboard/components/candidate-sources-chart'

interface AnalyticsSourceSectionProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsSourceSection({ range, dateFrom, dateTo }: AnalyticsSourceSectionProps) {
  const result = await getAnalyticsSourcesAction(range, dateFrom, dateTo)
  return (
    <LazyCandidateSourcesChart data={result.success ? result.data : []} />
  )
}

export { CandidateSourcesChartSkeleton as AnalyticsSourceSectionSkeleton }

