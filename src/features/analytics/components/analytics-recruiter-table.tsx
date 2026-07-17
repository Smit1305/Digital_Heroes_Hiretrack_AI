import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_LABELS } from '@/lib/permissions'
import { getRecruiterPerformanceAction } from '@/server/actions/analytics'
import type { AnalyticsRange } from '@/types/analytics'

interface AnalyticsRecruiterTableProps {
  range: AnalyticsRange
  dateFrom?: string
  dateTo?: string
}

export async function AnalyticsRecruiterTable({ range, dateFrom, dateTo }: AnalyticsRecruiterTableProps) {
  const result = await getRecruiterPerformanceAction(range, dateFrom, dateTo)

  if (!result.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  const recruiters = result.data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruiter Activity</CardTitle>
        <CardDescription>Pipeline actions and hires per team member</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {recruiters.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-6">
            <p className="text-sm text-muted-foreground">No recruiter activity in this period.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-b-xl">
            <table
              className="w-full text-sm"
              role="table"
              aria-label="Recruiter activity"
            >
              <thead>
                <tr className="border-t bg-muted/30">
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-2.5 text-left text-xs font-medium text-muted-foreground sm:table-cell"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                  >
                    Actions
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground"
                  >
                    Hires
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recruiters.map((rec, rank) => (
                  <tr key={rec.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
                          aria-label={`Rank ${rank + 1}`}
                        >
                          {rank + 1}
                        </span>
                        <span className="font-medium">{rec.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-muted-foreground sm:table-cell">
                      {ROLE_LABELS[rec.role]}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {rec.actionsCount}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                      {rec.hiresCount}
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

export function AnalyticsRecruiterTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
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
