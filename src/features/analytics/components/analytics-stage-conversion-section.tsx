import { getStageConversionAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import { AnalyticsStageConversion, AnalyticsStageConversionSkeleton } from './analytics-stage-conversion'

interface AnalyticsStageConversionSectionProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsStageConversionSection({ range, dateFrom, dateTo }: AnalyticsStageConversionSectionProps) {
  const result = await getStageConversionAction(range, dateFrom, dateTo)
  return (
    <AnalyticsStageConversion data={result.success ? result.data : []} />
  )
}

export { AnalyticsStageConversionSkeleton }

