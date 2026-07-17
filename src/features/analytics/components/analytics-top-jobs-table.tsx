import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTopJobsAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'
import type { JobStatus } from '@prisma/client'
import Link from 'next/link'

const STATUS_STYLES: Record<JobStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PAUSED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  CLOSED: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-muted text-muted-foreground',
}

interface AnalyticsTopJobsTableProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsTopJobsTable({ range, dateFrom, dateTo }: AnalyticsTopJobsTableProps) {
  const result = await getTopJobsAction(range, dateFrom, dateTo)

  if (!result.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  const jobs = result.data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Jobs</CardTitle>
        <CardDescription>Jobs with the most applications in this period</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {jobs.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-6">
            <p className="text-sm text-muted-foreground">No job activity in this period.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-b-xl">
            <table
              className="w-full text-sm"
              role="table"
              aria-label="Top performing jobs"
            >
              <thead>
                <tr className="border-t bg-muted/30">
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                  >
                    Job
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-2.5 text-left text-xs font-medium text-muted-foreground sm:table-cell"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                  >
                    Applications
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                  >
                    Hires
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-2.5 text-right text-xs font-medium text-muted-foreground md:table-cell"
                  >
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-2.5">
                      <div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          {job.title}
                        </Link>
                        {job.department && (
                          <p className="text-xs text-muted-foreground">{job.department}</p>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <Badge
                        className={`border-0 text-xs font-medium ${STATUS_STYLES[job.status]}`}
                      >
                        {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {job.applicationCount}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                      {job.hireCount}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-muted-foreground md:table-cell">
                      {job.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AnalyticsTopJobsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-60 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-6">
              <div className="h-4 w-10 animate-pulse rounded bg-muted" />
              <div className="h-4 w-10 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
