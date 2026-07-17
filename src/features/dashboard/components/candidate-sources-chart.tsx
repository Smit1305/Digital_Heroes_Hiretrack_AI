'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SourceData } from '@/types/database'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

// Greyscale + neutral palette that adapts to dark mode
const PALETTE = [
  'oklch(0.205 0 0)',
  'oklch(0.371 0 0)',
  'oklch(0.439 0 0)',
  'oklch(0.556 0 0)',
  'oklch(0.708 0 0)',
  'oklch(0.87 0 0)',
]

interface CandidateSourcesChartProps {
  data: SourceData[]
}

export function CandidateSourcesChart({ data }: CandidateSourcesChartProps) {
  const hasData = data.some((d) => d.count > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Candidate Sources</CardTitle>
        <CardDescription>Where your candidates are coming from</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {!hasData ? (
          <EmptyState message="No candidate source data yet." />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div aria-label="Candidate sources donut chart" role="img">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="source"
                    paddingAngle={2}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.source}
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
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} (${data.find((d) => d.source === name)?.percentage ?? 0}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <ul className="w-full space-y-1.5" aria-label="Source legend">
              {data.map((item, i) => (
                <li key={item.source} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-foreground">{item.source}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.count} ({item.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CandidateSourcesChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-52 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="h-[180px] w-[180px] animate-pulse rounded-full bg-muted" />
        <div className="w-full space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
