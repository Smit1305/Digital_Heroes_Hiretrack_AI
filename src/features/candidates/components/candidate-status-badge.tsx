import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CandidateStatus } from '@prisma/client';

const STATUS_CONFIG: Record<CandidateStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground',
  },
  BLACKLISTED: {
    label: 'Blacklisted',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
}

const STAGE_CONFIG: Record<string, { label: string; className: string }> = {
  APPLIED: { label: 'Applied', className: 'bg-muted text-muted-foreground' },
  SCREENING: { label: 'Screening', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  INTERVIEW: { label: 'Interview', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  TECHNICAL: { label: 'Technical', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  HR_ROUND: { label: 'HR Round', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  OFFER: { label: 'Offer', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  HIRED: { label: 'Hired', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

export function CandidateStatusBadge({
  status,
  className,
}: {
  status: CandidateStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn('border-0 font-medium', config.className, className)}>
      {config.label}
    </Badge>
  )
}

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  const config = STAGE_CONFIG[stage] ?? { label: stage, className: 'bg-muted text-muted-foreground' }
  return (
    <Badge className={cn('border-0 font-medium text-[11px]', config.className, className)}>
      {config.label}
    </Badge>
  )
}
