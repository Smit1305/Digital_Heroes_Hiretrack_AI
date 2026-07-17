import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { InterviewStatus, InterviewType } from '@prisma/client'
import { Monitor, Phone, Users, Video, Code, GitBranch, Brain, Heart, Briefcase } from 'lucide-react'

export const TYPE_CONFIG: Record<
  InterviewType,
  { label: string; icon: React.ElementType; className: string }
> = {
  VIDEO: {
    label: 'Video',
    icon: Video,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  PHONE: {
    label: 'Phone',
    icon: Phone,
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  ONSITE: {
    label: 'On-site',
    icon: Users,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  TECHNICAL: {
    label: 'Technical',
    icon: Monitor,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  HR: {
    label: 'HR',
    icon: Users,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  PANEL: {
    label: 'Panel',
    icon: Users,
    className: 'bg-muted text-muted-foreground',
  },
  CODING: {
    label: 'Coding',
    icon: Code,
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  },
  SYSTEM_DESIGN: {
    label: 'System Design',
    icon: GitBranch,
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  BEHAVIORAL: {
    label: 'Behavioral',
    icon: Brain,
    className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
  CULTURAL_FIT: {
    label: 'Cultural Fit',
    icon: Heart,
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
  MANAGER_ROUND: {
    label: 'Manager Round',
    icon: Briefcase,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  },
}

export const STATUS_CONFIG: Record<
  InterviewStatus,
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground',
  },
  NO_SHOW: {
    label: 'No show',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
}

export function InterviewTypeBadge({
  type,
  className,
}: {
  type: InterviewType
  className?: string
}) {
  const config = TYPE_CONFIG[type]
  const Icon = config.icon
  return (
    <Badge className={cn('border-0 font-medium gap-1', config.className, className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}

export function InterviewStatusBadge({
  status,
  className,
}: {
  status: InterviewStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn('border-0 font-medium', config.className, className)}>
      {config.label}
    </Badge>
  )
}

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'text-sm',
            i < rating ? 'text-amber-400' : 'text-muted-foreground/30'
          )}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}
