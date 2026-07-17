'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlyHiringData } from '@/types/database'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

interface MonthlyHiringChartProps {
  data: MonthlyHiringData[]
}

export function MonthlyHiringChart({ data }: MonthlyHiringChartProps) {
  const hasData = data.some((d) => d.applications > 0 || d.hires > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
        <CardDescription>Applications vs hires over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {!hasData ? (
          <EmptyState message="No activity data yet. Applications will appear here once candidates start applying." />
        ) : (
          <div aria-label="Monthly hiring bar chart" role="img">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barCategoryGap="30%"
                barGap={4}
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
                  cursor={{ fill: 'currentColor', opacity: 0.04 }}
                />
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />
                <Bar
                  dataKey="applications"
                  name="Applications"
                  fill="currentColor"
                  className="text-foreground/70"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="hires"
                  name="Hires"
                  fill="currentColor"
                  className="text-foreground/30"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MonthlyHiringChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-60 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center px-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
