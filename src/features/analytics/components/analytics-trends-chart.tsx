'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlyHiringData } from '@/types/database'
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

interface AnalyticsTrendsChartProps {
  data: MonthlyHiringData[]
  title?: string
  description?: string
}

export function AnalyticsTrendsChart({
  data,
  title = 'Hiring Trends',
  description = 'Applications vs hires over the selected period',
}: AnalyticsTrendsChartProps) {
  const hasData = data.some((d) => d.applications > 0 || d.hires > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No trend data for this period.</p>
          </div>
        ) : (
          <div aria-label="Hiring trends line chart" role="img">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={data}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                  cursor={{ stroke: 'currentColor', opacity: 0.08 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'currentColor' }}
                  activeDot={{ r: 5 }}
                  className="text-foreground"
                />
                <Line
                  type="monotone"
                  dataKey="hires"
                  name="Hires"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: 3, fill: 'currentColor' }}
                  activeDot={{ r: 5 }}
                  className="text-foreground/40"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AnalyticsTrendsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
