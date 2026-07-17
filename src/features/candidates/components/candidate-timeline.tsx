'use client'

import { format } from 'date-fns'
import {
    Activity,
    ArrowRight,
    Briefcase,
    CheckCircle,
    FileText,
    MessageSquare,
    PenLine,
    Plus,
    RefreshCw,
    Trash2,
    UserCheck,
    Video,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CandidateActivity } from '@/server/actions/candidates'

const ACTION_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; colour: string }
> = {
  CREATED: { icon: Plus, label: 'Profile created', colour: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  UPDATED: { icon: PenLine, label: 'Profile updated', colour: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  DELETED: { icon: Trash2, label: 'Deleted', colour: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  STAGE_CHANGED: { icon: ArrowRight, label: 'Stage changed', colour: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  STATUS_CHANGED: { icon: RefreshCw, label: 'Status changed', colour: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  NOTE_ADDED: { icon: MessageSquare, label: 'Note added', colour: 'bg-muted text-muted-foreground' },
  FILE_UPLOADED: { icon: FileText, label: 'File uploaded', colour: 'bg-muted text-muted-foreground' },
  INTERVIEW_SCHEDULED: { icon: Video, label: 'Interview scheduled', colour: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  INTERVIEW_COMPLETED: { icon: CheckCircle, label: 'Interview completed', colour: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  OFFER_SENT: { icon: Briefcase, label: 'Offer sent', colour: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  OFFER_ACCEPTED: { icon: UserCheck, label: 'Offer accepted', colour: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  OFFER_REJECTED: { icon: Trash2, label: 'Offer rejected', colour: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

function getActivityLabel(activity: CandidateActivity): string {
  const config = ACTION_CONFIG[activity.action]
  if (!config) return activity.action.replace(/_/g, ' ').toLowerCase()

  const meta = activity.metadata as Record<string, string> | null
  if (!meta) return config.label

  if (activity.action === 'STAGE_CHANGED' && meta.from && meta.to) {
    return `Moved from ${meta.from.replace(/_/g, ' ')} to ${meta.to.replace(/_/g, ' ')}`
  }
  if (activity.action === 'STATUS_CHANGED' && meta.from && meta.to) {
    return `Status changed from ${meta.from} to ${meta.to}`
  }
  if (activity.action === 'NOTE_ADDED' && meta.preview) {
    return `Note: "${meta.preview}"`
  }

  return config.label
}

interface CandidateTimelineProps {
  activities: CandidateActivity[]
}

export function CandidateTimeline({ activities }: CandidateTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Activity timeline
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {activities.length} event{activities.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Activity className="h-7 w-7 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
          </div>
        ) : (
          <ol className="relative space-y-4" aria-label="Activity timeline">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" aria-hidden="true" />

            {activities.map((activity) => {
              const config = ACTION_CONFIG[activity.action] ?? {
                icon: Activity,
                label: activity.action,
                colour: 'bg-muted text-muted-foreground',
              }
              const Icon = config.icon
              const label = getActivityLabel(activity)
              const actor = activity.actor?.name ?? activity.actor?.email ?? 'System'

              return (
                <li key={activity.id} className="flex gap-3 pl-0">
                  {/* Icon dot */}
                  <div
                    className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${config.colour}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm leading-tight">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {actor} · {format(new Date(activity.createdAt), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
