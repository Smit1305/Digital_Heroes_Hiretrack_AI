'use client'

import { Draggable } from '@hello-pangea/dnd'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, MoreHorizontal, Star, Trash2, Video } from 'lucide-react'
import Link from 'next/link'
import { memo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { rejectApplicationAction } from '@/server/actions/pipeline'
import type { ApplicationWithDetails } from '@/types/database'
import { STAGE_CONFIG } from './pipeline-stage-config'

interface PipelineCardProps {
  application: ApplicationWithDetails
  index: number
  onStageChange: (applicationId: string, newStage: string) => void
}

export const PipelineCard = memo(function PipelineCard({
  application,
  index,
  onStageChange,
}: PipelineCardProps) {
  const [isPending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)

  const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`
  const initials = `${application.candidate.firstName[0] ?? ''}${application.candidate.lastName[0] ?? ''}`.toUpperCase()
  const stageConfig = STAGE_CONFIG[application.stage]
  const latestInterview = application.interviews?.[0]
  const score = application.score

  function handleReject() {
    startTransition(async () => {
      const result = await rejectApplicationAction(application.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      onStageChange(application.id, 'REJECTED')
    })
  }

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group relative rounded-lg border border-l-4 bg-card p-3 shadow-sm',
            'cursor-grab active:cursor-grabbing select-none',
            'transition-shadow duration-150',
            stageConfig.cardAccent,
            snapshot.isDragging
              ? 'shadow-xl ring-2 ring-ring/30 rotate-1 scale-[1.02]'
              : 'hover:shadow-md',
            isPending && 'opacity-60 pointer-events-none'
          )}
          aria-label={`${candidateName} — ${application.job.title}`}
        >
          {/* Header: avatar + name + menu */}
          <div className="flex items-start gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
              <AvatarFallback className="text-[10px] font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <Link
                href={`/candidates/${application.candidateId}`}
                className="text-sm font-medium leading-tight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm line-clamp-1"
                onClick={(e) => e.stopPropagation()}
              >
                {candidateName}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {application.candidate.email}
              </p>
            </div>

            {/* Action menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Options for ${candidateName}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              >
                <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem render={<Link href={`/candidates/${application.candidateId}`} />}>
                  View profile
                </DropdownMenuItem>
                {application.stage !== 'REJECTED' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleReject} variant="destructive">
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Job */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{application.job.title}</span>
          </div>

          {/* Footer: score + interview badge + time */}
          <div className="mt-2.5 flex items-center gap-2">
            {score !== null && score !== undefined && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 text-amber-400" aria-hidden="true" />
                {score}
              </span>
            )}
            {latestInterview && (
              <Badge
                className={cn(
                  'text-[10px] border-0 px-1.5 py-0 h-4',
                  latestInterview.status === 'SCHEDULED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Video className="mr-1 h-2.5 w-2.5" aria-hidden="true" />
                {latestInterview.status === 'SCHEDULED' ? 'Upcoming' : 'Interviewed'}
              </Badge>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  )
})
