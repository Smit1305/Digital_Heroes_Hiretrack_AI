import { getAnalyticsFunnelAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import { LazyHiringFunnelChart } from '@/components/lazy-charts'
import { HiringFunnelChartSkeleton } from '@/features/dashboard/components/hiring-funnel-chart'

interface AnalyticsFunnelSectionProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsFunnelSection({ range, dateFrom, dateTo }: AnalyticsFunnelSectionProps) {
  const result = await getAnalyticsFunnelAction(range, dateFrom, dateTo)
  return (
    <LazyHiringFunnelChart data={result.success ? result.data : []} />
  )
}

export { HiringFunnelChartSkeleton as AnalyticsFunnelSectionSkeleton }

