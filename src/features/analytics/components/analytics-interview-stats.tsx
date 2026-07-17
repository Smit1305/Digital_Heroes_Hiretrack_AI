'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { InterviewStats } from '@/types/analytics'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
  RESCHEDULED: 'Rescheduled',
}

const TYPE_LABELS: Record<string, string> = {
  PHONE: 'Phone',
  VIDEO: 'Video',
  ONSITE: 'On-site',
  TECHNICAL: 'Technical',
  HR: 'HR',
  PANEL: 'Panel',
}

// Neutral greyscale palette
const PALETTE = [
  'oklch(0.205 0 0)',
  'oklch(0.371 0 0)',
  'oklch(0.439 0 0)',
  'oklch(0.556 0 0)',
  'oklch(0.708 0 0)',
  'oklch(0.87 0 0)',
]

interface AnalyticsInterviewStatsProps {
  data: InterviewStats
}

export function AnalyticsInterviewStats({ data }: AnalyticsInterviewStatsProps) {
  const statusData = data.byStatus.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    percentage: s.percentage,
  }))

  const typeData = data.byType.map((t) => ({
    name: TYPE_LABELS[t.type] ?? t.type,
    value: t.count,
    percentage: t.percentage,
  }))

  const hasData = data.total > 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Interview Statistics</CardTitle>
        <CardDescription>Breakdown of interview outcomes and types</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!hasData ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">No interview data for this period.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total', value: data.total },
                { label: 'Completion', value: `${data.completionRate}%` },
                {
                  label: 'Avg Rating',
                  value: data.avgRating ? `${data.avgRating}/5` : '—',
                },
                {
                  label: 'Avg Duration',
                  value: data.avgDurationMinutes ? `${data.avgDurationMinutes}m` : '—',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border bg-muted/30 px-3 py-2.5 text-center"
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Status donut */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">By Status</p>
                <div className="flex items-center gap-4" aria-label="Interviews by status chart" role="img">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={46}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {statusData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PALETTE[index % PALETTE.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(v: any, name: any) => [
                          `${v} (${statusData.find((d) => d.name === name)?.percentage ?? 0}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex-1 space-y-1" aria-label="Status legend">
                    {statusData.map((item, i) => (
                      <li key={item.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                            aria-hidden="true"
                          />
                          {item.name}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {item.value} ({item.percentage}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Type donut */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">By Type</p>
                <div className="flex items-center gap-4" aria-label="Interviews by type chart" role="img">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={46}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {typeData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PALETTE[index % PALETTE.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(v: any, name: any) => [
                          `${v} (${typeData.find((d) => d.name === name)?.percentage ?? 0}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex-1 space-y-1" aria-label="Type legend">
                    {typeData.map((item, i) => (
                      <li key={item.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                            aria-hidden="true"
                          />
                          {item.name}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {item.value} ({item.percentage}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AnalyticsInterviewStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-[120px] animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
