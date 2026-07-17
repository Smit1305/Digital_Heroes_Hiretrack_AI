'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getJobsAction } from '@/server/actions/jobs'
import type { PaginatedResponse } from '@/types/api'
import type { JobWithRelations } from '@/types/database'
import type { JobFiltersInput } from '@/validators/job'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { JobCard } from './job-card'
import { JobsGridSkeleton } from './job-card-skeleton'
import { JobForm } from './job-form'
import { JobsEmptyState } from './jobs-empty-state'
import { JobsPagination } from './jobs-pagination'

interface JobsListProps {
  initialData: PaginatedResponse<JobWithRelations>
  filters: Partial<JobFiltersInput>
  canCreate: boolean
}

export function JobsList({ initialData, filters, canCreate }: JobsListProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === 'true')
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open && searchParams.get('create') === 'true') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('create')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const result = await getJobsAction(filters)
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Failed to refresh jobs.')
      }
    })
  }, [filters])

  const hasFilters = Boolean(
    filters.query || filters.status || filters.employmentType || filters.isRemote
  )

  return (
    <>
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRefreshing && (
            <RefreshCw
              className="h-4 w-4 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            New job
          </Button>
        )}
      </div>

      {/* Grid */}
      {isRefreshing ? (
        <JobsGridSkeleton count={data.data.length || 6} />
      ) : data.data.length === 0 ? (
        <JobsEmptyState
          hasFilters={hasFilters}
          onCreateClick={() => setCreateOpen(true)}
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Jobs list"
        >
          {data.data.map((job) => (
            <JobCard key={job.id} job={job} onMutated={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <JobsPagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        hasNextPage={data.pagination.hasNextPage}
        hasPrevPage={data.pagination.hasPrevPage}
      />

      {/* Create dialog */}
      {canCreate && (
        <JobForm
          open={createOpen}
          onOpenChange={handleOpenChange}
          onSuccess={refresh}
        />
      )}
    </>
  )
}
