'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { InterviewSuccessRow } from '@/types/analytics'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'

interface AnalyticsInterviewSuccessProps {
  data: InterviewSuccessRow[]
}

const COLORS: Record<string, string> = {
  'STRONG HIRE': 'oklch(0.205 0 0)',     // Deep Charcoal / Dark Black
  'HIRE': 'oklch(0.371 0 0)',            // Charcoal Grey
  'NEUTRAL': 'oklch(0.556 0 0)',         // Grey
  'NO HIRE': 'oklch(0.708 0 0)',         // Light Grey
  'STRONG NO HIRE': 'oklch(0.87 0 0)',   // Very Light Grey
}

export function AnalyticsInterviewSuccess({ data }: AnalyticsInterviewSuccessProps) {
  const totalRecommendations = data.reduce((sum, item) => sum + item.count, 0)
  const hasData = totalRecommendations > 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Interview Success</CardTitle>
        <CardDescription>Distribution of scorecard recommendations</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No scorecard evaluations found in this range.</p>
          </div>
        ) : (
          <div aria-label="Scorecard recommendation ratings distribution chart" role="img" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
              {data.map((item) => (
                <div key={item.recommendation} className="rounded-lg border bg-muted/20 px-2 py-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase leading-none truncate">
                    {item.recommendation}
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums">
                    {item.count}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums leading-none">
                    {item.percentage}%
                  </p>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="recommendation" 
                  tick={{ fontSize: 10, fill: 'currentColor' }} 
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'currentColor' }} 
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
                    fontSize: '11px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                  cursor={{ stroke: 'currentColor', opacity: 0.05 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.recommendation.toUpperCase()] || 'oklch(0.556 0 0)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
