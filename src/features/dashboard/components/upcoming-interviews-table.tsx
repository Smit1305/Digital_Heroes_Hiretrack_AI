'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { UpcomingInterview } from '@/server/actions/dashboard'
import { InterviewType } from '@/types/enums'
import { format, isToday, isTomorrow } from 'date-fns'
import { Calendar, Clock, Monitor, Phone, Users, Video, Code, GitBranch, Brain, Heart, Briefcase } from 'lucide-react'

const TYPE_CONFIG: Record<
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

function formatInterviewDate(date: Date): string {
  const d = new Date(date)
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

interface UpcomingInterviewsTableProps {
  data: UpcomingInterview[]
}

export function UpcomingInterviewsTable({ data }: UpcomingInterviewsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>Scheduled interviews in chronological order</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {data.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 px-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              No interviews scheduled. Start scheduling interviews for active candidates.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border" aria-label="Upcoming interviews list">
            {data.map((interview) => {
              const config = TYPE_CONFIG[interview.type as InterviewType] ?? TYPE_CONFIG.VIDEO
              const Icon = config.icon

              return (
                <li
                  key={interview.id}
                  className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                >
                  {/* Type badge */}
                  <div
                    className={cn(
                      'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                      config.className
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-tight">
                          {interview.candidateName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {interview.jobTitle}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          'flex-shrink-0 text-[10px] font-medium border-0',
                          config.className
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {formatInterviewDate(interview.scheduledAt)}
                      </span>
                      {interview.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {interview.duration}m
                        </span>
                      )}
                      {interview.interviewerName && (
                        <span className="hidden sm:block truncate max-w-[120px]">
                          with {interview.interviewerName}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function UpcomingInterviewsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-60 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3 px-6 py-3">
              <div className="h-7 w-7 animate-pulse rounded-lg bg-muted flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
