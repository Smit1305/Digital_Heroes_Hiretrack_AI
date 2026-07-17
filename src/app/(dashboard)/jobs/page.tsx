import { JobsGridSkeleton } from '@/features/jobs/components/job-card-skeleton'
import { JobsFilters } from '@/features/jobs/components/jobs-filters'
import { JobsList } from '@/features/jobs/components/jobs-list'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getJobsAction } from '@/server/actions/jobs'
import { jobFiltersSchema } from '@/validators/job'
import type { EmploymentType, JobStatus } from '@prisma/client'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Jobs — HireTrack AI',
  description: 'Create and manage job postings for your organization.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function JobsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const params = await searchParams

  // Parse and validate filters from URL search params
  const rawFilters = {
    query: typeof params.query === 'string' ? params.query : undefined,
    status: typeof params.status === 'string' ? (params.status as JobStatus) : undefined,
    employmentType:
      typeof params.employmentType === 'string'
        ? (params.employmentType as EmploymentType)
        : undefined,
    page: typeof params.page === 'string' ? Number(params.page) : 1,
    pageSize: 18,
    sortBy: (typeof params.sortBy === 'string' ? params.sortBy : 'createdAt') as
      | 'title'
      | 'createdAt'
      | 'updatedAt'
      | 'status',
    sortOrder: (typeof params.sortOrder === 'string' ? params.sortOrder : 'desc') as
      | 'asc'
      | 'desc',
  }

  const filters = jobFiltersSchema.parse(rawFilters)
  const canCreate = hasPermission(session.user.role, 'jobs:create')

  const result = await getJobsAction(filters)
  const initialData = result.success
    ? result.data
    : { data: [], pagination: { total: 0, page: 1, pageSize: 18, totalPages: 0, hasNextPage: false, hasPrevPage: false } }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your open positions and hiring pipeline.
          </p>
        </div>
      </div>

      {/* Filters — wrapped in Suspense because they use useSearchParams */}
      <Suspense fallback={<div className="h-8 w-full animate-pulse rounded bg-muted" />}>
        <JobsFilters totalCount={initialData.pagination.total} />
      </Suspense>

      {/* List */}
      <Suspense fallback={<JobsGridSkeleton />}>
        <JobsList
          initialData={initialData}
          filters={filters}
          canCreate={canCreate}
        />
      </Suspense>
    </div>
  )
}
