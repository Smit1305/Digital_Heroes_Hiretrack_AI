import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { AnimatedStatCard } from './animated-stat-card'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <AnimatedStatCard delay={delay}>
      <Card className={cn('relative overflow-hidden', className)}>
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
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                'mt-1.5 flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              )}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedStatCard>
  )
}

// ─── Skeleton variant ─────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-3 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
