'use client'

import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'

interface CandidatesEmptyStateProps {
  hasFilters: boolean
  onCreateClick: () => void
}

export function CandidatesEmptyState({ hasFilters, onCreateClick }: CandidatesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted" aria-hidden="true">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasFilters ? 'No candidates match your filters' : 'No candidates yet'}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {hasFilters
            ? 'Try adjusting your search or clearing filters.'
            : 'Add your first candidate to start building your talent pipeline.'}
        </p>
      </div>
      {!hasFilters && (
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add candidate
        </Button>
      )}
    </div>
  )
}
