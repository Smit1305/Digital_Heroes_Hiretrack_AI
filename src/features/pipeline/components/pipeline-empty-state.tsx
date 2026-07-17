import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Kanban } from 'lucide-react'
import Link from 'next/link'

interface PipelineEmptyStateProps {
  hasJobFilter: boolean
}

export function PipelineEmptyState({ hasJobFilter }: PipelineEmptyStateProps) {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
        aria-hidden="true"
      >
        <Kanban className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasJobFilter ? 'No candidates for this job' : 'Pipeline is empty'}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {hasJobFilter
            ? 'No applications have been submitted for this job yet.'
            : 'Add candidates to jobs to start managing your hiring pipeline.'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/candidates"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          View candidates
        </Link>
        <Link
          href="/jobs"
          className={cn(buttonVariants({ size: 'sm' }))}
        >
          View jobs
        </Link>
      </div>
    </div>
  )
}
