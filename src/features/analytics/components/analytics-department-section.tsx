'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DepartmentAnalyticsRow } from '@/types/analytics'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface AnalyticsDepartmentSectionProps {
  data: DepartmentAnalyticsRow[]
}

export function AnalyticsDepartmentSection({ data }: AnalyticsDepartmentSectionProps) {
  const hasData = data.length > 0 && data.some((d) => d.openJobsCount > 0 || d.applicationCount > 0 || d.hireCount > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Department Analytics</CardTitle>
        <CardDescription>Hiring metrics segmented by company departments</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No departmental hiring statistics found.</p>
          </div>
        ) : (
          <div aria-label="Department hiring metrics bar chart" role="img">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted-foreground/10" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: 'currentColor' }} 
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="department" 
                  tick={{ fontSize: 11, fill: 'currentColor' }} 
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                  cursor={{ fill: 'currentColor', opacity: 0.04 }}
                />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar 
                  dataKey="openJobsCount" 
                  name="Open Jobs" 
                  fill="oklch(0.708 0 0)" // Light gray
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
                <Bar 
                  dataKey="applicationCount" 
                  name="Applications" 
                  fill="oklch(0.371 0 0)" // Dark gray
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
                <Bar 
                  dataKey="hireCount" 
                  name="Hires" 
                  fill="oklch(0.205 0 0)" // Near black
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
