'use client'

import { cn } from '@/lib/utils'
import type { AnalyticsRange } from '@/types/analytics'
import { RANGE_LABELS } from '@/types/analytics'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

const RANGES: AnalyticsRange[] = ['7d', '30d', '90d', '1y']

interface AnalyticsTimeRangeFilterProps {
  currentRange: AnalyticsRange
}

export function AnalyticsTimeRangeFilter({ currentRange }: AnalyticsTimeRangeFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(range: AnalyticsRange) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', range)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div
      className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5"
      role="group"
      aria-label="Time range filter"
    >
      {RANGES.map((range) => (
        <button
          key={range}
          onClick={() => handleChange(range)}
          disabled={isPending}
          aria-pressed={currentRange === range}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:pointer-events-none disabled:opacity-50',
            currentRange === range
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {RANGE_LABELS[range]}
        </button>
      ))}
    </div>
  )
}
