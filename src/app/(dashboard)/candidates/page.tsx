import { CandidatesGridSkeleton } from '@/features/candidates/components/candidate-card-skeleton'
import { CandidatesFilters } from '@/features/candidates/components/candidates-filters'
import { CandidatesList } from '@/features/candidates/components/candidates-list'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getCandidatesAction, getCandidateSourcesListAction } from '@/server/actions/candidates'
import { candidateFiltersSchema } from '@/validators/candidate'
import type { CandidateStatus } from '@prisma/client'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Candidates — HireTrack AI',
  description: 'Manage your talent pipeline and candidate profiles.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CandidatesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const params = await searchParams

  const rawFilters = {
    query: typeof params.query === 'string' ? params.query : undefined,
    status: typeof params.status === 'string' ? (params.status as CandidateStatus) : undefined,
    source: typeof params.source === 'string' ? params.source : undefined,
    page: typeof params.page === 'string' ? Number(params.page) : 1,
    pageSize: 18,
    sortBy: (typeof params.sortBy === 'string' ? params.sortBy : 'createdAt') as
      | 'firstName'
      | 'lastName'
      | 'createdAt'
      | 'updatedAt'
      | 'email',
    sortOrder: (typeof params.sortOrder === 'string' ? params.sortOrder : 'desc') as
      | 'asc'
      | 'desc',
  }

  const filters = candidateFiltersSchema.parse(rawFilters)
  const canCreate = hasPermission(session.user.role, 'candidates:create')

  const [result, sourcesResult] = await Promise.all([
    getCandidatesAction(filters),
    getCandidateSourcesListAction(),
  ])

  const initialData = result.success
    ? result.data
    : {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 18,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }

  const sources = sourcesResult.success ? sourcesResult.data : []

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Candidates</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track and manage your talent pipeline.
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-8 w-full animate-pulse rounded bg-muted" />}>
        <CandidatesFilters
          totalCount={initialData.pagination.total}
          sources={sources}
        />
      </Suspense>

      {/* List */}
      <Suspense fallback={<CandidatesGridSkeleton />}>
        <CandidatesList
          initialData={initialData}
          filters={filters}
          canCreate={canCreate}
        />
      </Suspense>
    </div>
  )
}
