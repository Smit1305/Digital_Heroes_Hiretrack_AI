'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { HiringFunnelData } from '@/types/database'
import { motion } from 'framer-motion'

interface HiringFunnelChartProps {
  data: HiringFunnelData[]
}

// Fixed colour scale matching the css chart variables (greyscale + accent)
const BAR_COLOURS = [
  'bg-foreground/90',
  'bg-foreground/75',
  'bg-foreground/60',
  'bg-foreground/50',
  'bg-foreground/40',
  'bg-foreground/30',
  'bg-foreground/20',
]

export function HiringFunnelChart({ data }: HiringFunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
        <CardDescription>Candidate progression through pipeline stages</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {data.length === 0 || data.every((d) => d.count === 0) ? (
          <EmptyState message="No applications in the pipeline yet." />
        ) : (
          <ol className="space-y-2.5" aria-label="Hiring funnel stages">
            {data.map((item, i) => (
              <li key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${item.label}: ${item.count} candidates`}
                >
                  <motion.div
                    className={`h-full rounded-full ${BAR_COLOURS[i] ?? 'bg-foreground/20'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

export function HiringFunnelChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
