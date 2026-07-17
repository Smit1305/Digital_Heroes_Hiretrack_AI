import { getDashboardStatsAction } from '@/server/actions/dashboard'
import {
    Briefcase,
    Calendar,
    CheckCircle,
    Gift,
    TrendingUp,
    Users,
} from 'lucide-react'
import { StatCard } from './stat-card'

export async function DashboardStatsGrid() {
  const result = await getDashboardStatsAction()

  if (!result.success) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        Failed to load stats: {result.error}
      </div>
    )
  }

  const stats = result.data

  const cards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      description: `${stats.openPositions} open position${stats.openPositions !== 1 ? 's' : ''}`,
      icon: Briefcase,
      delay: 0,
    },
    {
      title: 'Open Positions',
      value: stats.openPositions,
      description: 'Currently accepting applications',
      icon: TrendingUp,
      delay: 0.05,
    },
    {
      title: 'Candidates',
      value: stats.totalCandidates,
      description: 'Active in your pipeline',
      icon: Users,
      delay: 0.1,
    },
    {
      title: 'Interviews',
      value: stats.scheduledInterviews,
      description: 'Upcoming scheduled',
      icon: Calendar,
      delay: 0.15,
    },
    {
      title: 'Offers',
      value: stats.offers,
      description: 'Pending offer stage',
      icon: Gift,
      delay: 0.2,
    },
    {
      title: 'Hires',
      value: stats.hires,
      description: `${stats.conversionRate}% conversion rate`,
      icon: CheckCircle,
      delay: 0.25,
    },
  ]

  return (
    <section aria-label="Key hiring metrics">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  )
}
