'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { RecentApplication } from '@/server/actions/dashboard'
import { ApplicationStage } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

const STAGE_STYLES: Record<ApplicationStage, string> = {
  APPLIED: 'bg-muted text-muted-foreground',
  SCREENING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  INTERVIEW: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  TECHNICAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  HR_ROUND: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  OFFER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  HIRED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  WITHDRAWN: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900/30 dark:text-zinc-400',
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  TECHNICAL: 'Technical',
  HR_ROUND: 'HR Round',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

interface RecentApplicationsTableProps {
  data: RecentApplication[]
}

export function RecentApplicationsTable({ data }: RecentApplicationsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>Latest candidates who applied to your open positions</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {data.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              No applications yet. Share your job postings to start receiving candidates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Recent applications">
              <thead>
                <tr className="border-b">
                  <th
                    scope="col"
                    className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground"
                  >
                    Candidate
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                  >
                    Position
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                  >
                    Stage
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground pr-6"
                  >
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((app) => (
                  <tr
                    key={app.id}
                    className="transition-colors hover:bg-muted/40 focus-within:bg-muted/40"
                  >
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium leading-tight">{app.candidateName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {app.candidateEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="font-medium leading-tight truncate max-w-[160px]">
                          {app.jobTitle}
                        </p>
                        {app.department && (
                          <p className="text-xs text-muted-foreground">{app.department}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        className={cn(
                          'text-[11px] font-medium border-0',
                          STAGE_STYLES[app.stage]
                        )}
                      >
                        {STAGE_LABELS[app.stage]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 pr-6 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
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

export function RecentApplicationsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['Candidate', 'Position', 'Stage', 'Applied'].map((h) => (
                  <th key={h} className="px-6 py-2.5 text-left">
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="mt-1 h-3 w-40 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-3 py-3 pr-6 text-right">
                    <div className="ml-auto h-3 w-20 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
