import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@prisma/client';

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  OPEN: {
    label: 'Open',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400',
  },
}

interface JobStatusBadgeProps {
  status: JobStatus
  className?: string
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn('border-0 font-medium', config.className, className)}>
      {config.label}
    </Badge>
  )
}
