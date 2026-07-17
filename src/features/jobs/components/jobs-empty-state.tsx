'use client'

import { Button } from '@/components/ui/button'
import { Briefcase, Plus } from 'lucide-react'

interface JobsEmptyStateProps {
  hasFilters: boolean
  onCreateClick: () => void
}

export function JobsEmptyState({ hasFilters, onCreateClick }: JobsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
        aria-hidden="true"
      >
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasFilters ? 'No jobs match your filters' : 'No jobs yet'}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {hasFilters
            ? 'Try adjusting your search or clearing the filters to see more results.'
            : 'Create your first job posting to start tracking candidates through the hiring pipeline.'}
        </p>
      </div>
      {!hasFilters && (
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Create job
        </Button>
      )}
    </div>
  )
}
