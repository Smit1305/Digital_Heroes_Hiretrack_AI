import { PipelineBoard } from '@/features/pipeline/components/pipeline-board'
import { PipelineEmptyState } from '@/features/pipeline/components/pipeline-empty-state'
import { PipelineJobFilter } from '@/features/pipeline/components/pipeline-job-filter'
import { PipelineSkeleton } from '@/features/pipeline/components/pipeline-skeleton'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getPipelineAction, getPipelineJobsAction } from '@/server/actions/pipeline'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Pipeline — HireTrack AI',
  description: 'Drag-and-drop hiring pipeline to track candidates through every stage.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PipelinePage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  if (!hasPermission(session.user.role, 'applications:read')) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const jobId = typeof params.jobId === 'string' ? params.jobId : undefined

  const [pipelineResult, jobsResult] = await Promise.all([
    getPipelineAction(jobId),
    getPipelineJobsAction(),
  ])

  const columns = pipelineResult.success ? pipelineResult.data : []
  const jobs = jobsResult.success ? jobsResult.data : []

  const hasApplications = columns.some((c) => c.applications.length > 0)

  return (
    // Full-height layout — override the page scroll, board scrolls internally
    <div className="flex h-[calc(100vh-3.5rem)] flex-col gap-4 p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Drag candidates between stages to move them through the hiring pipeline.
          </p>
        </div>

        {/* Job filter */}
        <Suspense fallback={<div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />}>
          <PipelineJobFilter jobs={jobs} selectedJobId={jobId} />
        </Suspense>
      </div>

      {/* Board or empty state */}
      {!hasApplications ? (
        <PipelineEmptyState hasJobFilter={Boolean(jobId)} />
      ) : (
        <Suspense fallback={<PipelineSkeleton />}>
          <PipelineBoard initialColumns={columns} jobId={jobId} />
        </Suspense>
      )}
    </div>
  )
}
