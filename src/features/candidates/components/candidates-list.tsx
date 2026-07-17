'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getCandidatesAction } from '@/server/actions/candidates'
import type { PaginatedResponse } from '@/types/api'
import type { CandidateWithApplications } from '@/types/database'
import type { CandidateFiltersInput } from '@/validators/candidate'
import { CandidateCard } from './candidate-card'
import { CandidatesGridSkeleton } from './candidate-card-skeleton'
import { CandidateForm } from './candidate-form'
import { CandidatesEmptyState } from './candidates-empty-state'
import { CandidatesPagination } from './candidates-pagination'

interface CandidatesListProps {
  initialData: PaginatedResponse<CandidateWithApplications>
  filters: Partial<CandidateFiltersInput>
  canCreate: boolean
}

export function CandidatesList({ initialData, filters, canCreate }: CandidatesListProps) {
  const [data, setData] = useState(initialData)
  const [createOpen, setCreateOpen] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const result = await getCandidatesAction(filters)
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Failed to refresh candidates.')
      }
    })
  }, [filters])

  const hasFilters = Boolean(filters.query || filters.status || filters.source)

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRefreshing && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Add candidate
          </Button>
        )}
      </div>

      {/* Grid */}
      {isRefreshing ? (
        <CandidatesGridSkeleton count={data.data.length || 6} />
      ) : data.data.length === 0 ? (
        <CandidatesEmptyState
          hasFilters={hasFilters}
          onCreateClick={() => setCreateOpen(true)}
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Candidates list"
        >
          {data.data.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} onMutated={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <CandidatesPagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        hasNextPage={data.pagination.hasNextPage}
        hasPrevPage={data.pagination.hasPrevPage}
      />

      {/* Create dialog */}
      {canCreate && (
        <CandidateForm
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={refresh}
        />
      )}
    </>
  )
}
