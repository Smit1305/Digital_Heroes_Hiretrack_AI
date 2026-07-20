'use client'

import { formatDistanceToNow } from 'date-fns'
import {
    Briefcase,
    Edit,
    ExternalLink,
    MapPin,
    MoreHorizontal,
    Trash2,
    User,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CandidateWithApplications } from '@/types/database'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CandidateForm } from './candidate-form'
import { CandidateStatusBadge, StageBadge } from './candidate-status-badge'
import { DeleteCandidateDialog } from './delete-candidate-dialog'

interface CandidateCardProps {
  candidate: CandidateWithApplications
  onMutated: () => void
}

export function CandidateCard({ candidate, onMutated }: CandidateCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const initials = `${candidate.firstName[0] ?? ''}${candidate.lastName[0] ?? ''}`.toUpperCase()
  const latestApp = candidate.applications[0]
  const appCount = candidate.applications.length

  return (
    <>
      <Card className="group relative flex flex-col hover:ring-foreground/20 transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="text-sm font-semibold leading-tight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {candidate.firstName} {candidate.lastName}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {candidate.email}
                  </p>
                </div>
                <CandidateStatusBadge status={candidate.status} />
              </div>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Options for ${candidate.firstName} ${candidate.lastName}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  />
                }
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push(`/candidates/${candidate.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {candidate.linkedin && (
                  <DropdownMenuItem onClick={() => window.open(candidate.linkedin!, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    LinkedIn
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Meta */}
          <div className="flex flex-wrap gap-1.5">
            {candidate.location && (
              <Badge variant="outline" className="text-[11px] gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {candidate.location}
              </Badge>
            )}
            {candidate.experience !== null && candidate.experience !== undefined && (
              <Badge variant="secondary" className="text-[11px]">
                {candidate.experience}y exp
              </Badge>
            )}
            {candidate.source && (
              <Badge variant="secondary" className="text-[11px]">
                {candidate.source}
              </Badge>
            )}
          </div>

          {/* Skills preview */}
          {candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 4 && (
                <span className="inline-flex items-center text-[10px] text-muted-foreground">
                  +{candidate.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Latest application */}
          {latestApp && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{latestApp.job.title}</span>
              <StageBadge stage={latestApp.stage} />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <span>
              {appCount} application{appCount !== 1 ? 's' : ''}
            </span>
            <span>{formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>

      <CandidateForm
        open={editOpen}
        onOpenChange={setEditOpen}
        candidate={candidate}
        onSuccess={onMutated}
      />
      <DeleteCandidateDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        candidateId={candidate.id}
        candidateName={`${candidate.firstName} ${candidate.lastName}`}
        onSuccess={onMutated}
      />
    </>
  )
}
