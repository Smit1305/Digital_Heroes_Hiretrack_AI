import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAnalyticsKPIsAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import {
    Award,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  highlight?: boolean
}

function KpiCard({ title, value, description, icon: Icon, highlight }: KpiCardProps) {
  return (
    <Card className={highlight ? 'border-foreground/20' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight" aria-label={`${title}: ${value}`}>
          {value}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-1.5 h-3 w-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface AnalyticsKpiGridProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsKpiGrid({ range, dateFrom, dateTo }: AnalyticsKpiGridProps) {
  const result = await getAnalyticsKPIsAction(range, dateFrom, dateTo)

  if (!result.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Failed to load KPI data: {result.error}
      </div>
    )
  }

  const kpis = result.data

  const cards: KpiCardProps[] = [
    {
      title: 'Applications',
      value: kpis.totalApplications,
      description: 'Received in period',
      icon: Briefcase,
    },
    {
      title: 'Hires',
      value: kpis.hires,
      description: 'Candidates hired',
      icon: CheckCircle2,
      highlight: true,
    },
    {
      title: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      description: 'Applied → Hired',
      icon: TrendingUp,
    },
    {
      title: 'Avg. Time to Hire',
      value: kpis.avgTimeToHireDays === 0 ? '—' : `${kpis.avgTimeToHireDays}d`,
      description: 'Days from apply to hire',
      icon: Clock,
    },
    {
      title: 'Interviews',
      value: kpis.totalInterviews,
      description: 'Scheduled in period',
      icon: Calendar,
    },
    {
      title: 'Completion Rate',
      value: `${kpis.interviewCompletionRate}%`,
      description: 'Interviews completed',
      icon: Award,
    },
    {
      title: 'Offer Acceptance',
      value: `${kpis.offerAcceptanceRate}%`,
      description: 'Offers accepted',
      icon: Users,
    },
    {
      title: 'Avg. Rating',
      value: kpis.avgInterviewRating ? `${kpis.avgInterviewRating}/5` : '—',
      description: 'Interview feedback score',
      icon: Star,
    },
  ]

  return (
    <section aria-label="Key performance indicators">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  )
}
