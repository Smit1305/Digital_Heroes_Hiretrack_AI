'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getInterviewsAction, type InterviewFiltersInput, type InterviewerOption, type SchedulableApplication } from '@/server/actions/interviews'
import type { PaginatedResponse } from '@/types/api'
import type { InterviewWithDetails } from '@/types/database'
import { InterviewCard } from './interview-card'
import { InterviewsGridSkeleton } from './interview-card-skeleton'
import { InterviewForm } from './interview-form'
import { InterviewsEmptyState } from './interviews-empty-state'
import { InterviewsPagination } from './interviews-pagination'

interface InterviewsListProps {
  initialData: PaginatedResponse<InterviewWithDetails>
  filters: Partial<InterviewFiltersInput>
  interviewers: InterviewerOption[]
  applications: SchedulableApplication[]
  canCreate: boolean
  canEdit: boolean
  canFeedback: boolean
  canDelete: boolean
}

export function InterviewsList({
  initialData,
  filters,
  interviewers,
  applications,
  canCreate,
  canEdit,
  canFeedback,
  canDelete,
}: InterviewsListProps) {
  const [data, setData] = useState(initialData)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const result = await getInterviewsAction(filters)
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Failed to refresh interviews.')
      }
    })
  }, [filters])

  const hasFilters = Boolean(filters.query || filters.status || filters.type)

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
          <Button size="sm" onClick={() => setScheduleOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Schedule interview
          </Button>
        )}
      </div>

      {/* Grid */}
      {isRefreshing ? (
        <InterviewsGridSkeleton count={data.data.length || 6} />
      ) : data.data.length === 0 ? (
        <InterviewsEmptyState
          hasFilters={hasFilters}
          onScheduleClick={() => setScheduleOpen(true)}
          canCreate={canCreate}
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Interviews list"
        >
          {data.data.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              interviewers={interviewers}
              applications={applications}
              onMutated={refresh}
              canEdit={canEdit}
              canFeedback={canFeedback}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <InterviewsPagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        hasNextPage={data.pagination.hasNextPage}
        hasPrevPage={data.pagination.hasPrevPage}
      />

      {/* Schedule dialog */}
      {canCreate && (
        <InterviewForm
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          interviewers={interviewers}
          applications={applications}
          onSuccess={refresh}
        />
      )}
    </>
  )
}
