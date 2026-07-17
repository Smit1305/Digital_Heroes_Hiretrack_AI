'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ConversionStep } from '@/types/analytics'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface AnalyticsStageConversionProps {
  data: ConversionStep[]
}

function getRateColour(rate: number): string {
  if (rate >= 60) return 'text-emerald-600 dark:text-emerald-400'
  if (rate >= 30) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

function getBarColour(rate: number): string {
  if (rate >= 60) return 'bg-emerald-500/80'
  if (rate >= 30) return 'bg-amber-500/80'
  return 'bg-red-500/70'
}

export function AnalyticsStageConversion({ data }: AnalyticsStageConversionProps) {
  const hasData = data.some((d) => d.fromCount > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Stage Conversion</CardTitle>
        <CardDescription>Drop-off rate between each pipeline stage</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {!hasData ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">No conversion data for this period.</p>
          </div>
        ) : (
          <ol className="space-y-3" aria-label="Stage conversion rates">
            {data.map((step, i) => (
              <li key={`${step.from}-${step.to}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-medium text-foreground">{step.from}</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    <span className="font-medium text-foreground">{step.to}</span>
                  </span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="text-muted-foreground">
                      {step.toCount}/{step.fromCount}
                    </span>
                    <span className={`font-semibold ${getRateColour(step.rate)}`}>
                      {step.rate}%
                    </span>
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={step.rate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${step.from} to ${step.to}: ${step.rate}% conversion`}
                >
                  <motion.div
                    className={`h-full rounded-full ${getBarColour(step.rate)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${step.rate}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
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

export function AnalyticsStageConversionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
