'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Plus } from 'lucide-react'

interface InterviewsEmptyStateProps {
  hasFilters: boolean
  onScheduleClick: () => void
  canCreate: boolean
}

export function InterviewsEmptyState({
  hasFilters,
  onScheduleClick,
  canCreate,
}: InterviewsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
        aria-hidden="true"
      >
        <Calendar className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasFilters ? 'No interviews match your filters' : 'No interviews yet'}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {hasFilters
            ? 'Try adjusting your search or clearing filters to see more results.'
            : 'Schedule your first interview to start tracking candidate assessments.'}
        </p>
      </div>
      {!hasFilters && canCreate && (
        <Button size="sm" onClick={onScheduleClick}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Schedule interview
        </Button>
      )}
    </div>
  )
}
