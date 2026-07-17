'use client'

import { formatDistanceToNow } from 'date-fns'
import {
    Archive,
    Copy,
    Edit,
    MapPin,
    MoreHorizontal,
    Trash2,
    Users,
    Wifi,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

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
import { archiveJobAction, duplicateJobAction } from '@/server/actions/jobs'
import type { JobWithRelations } from '@/types/database'
import { DeleteJobDialog } from './delete-job-dialog'
import { JobForm } from './job-form'
import { JobStatusBadge } from './job-status-badge'

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

interface JobCardProps {
  job: JobWithRelations
  onMutated: () => void
}

export function JobCard({ job, onMutated }: JobCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const applicationCount = job._count?.applications ?? 0
  const salaryDisplay =
    job.salaryMin || job.salaryMax
      ? job.salaryMin && job.salaryMax
        ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
        : job.salaryMin
          ? `From $${(job.salaryMin / 1000).toFixed(0)}k`
          : `Up to $${(job.salaryMax! / 1000).toFixed(0)}k`
      : null

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveJobAction(job.id)
      if (!result.success) { toast.error(result.error); return }
      toast.success(result.message)
      onMutated()
    })
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateJobAction(job.id)
      if (!result.success) { toast.error(result.error); return }
      toast.success(result.message)
      onMutated()
    })
  }

  return (
    <>
      <Card className="group relative flex flex-col hover:ring-foreground/20 transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight">{job.title}</h3>
              {job.department && (
                <p className="mt-0.5 text-xs text-muted-foreground">{job.department}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <JobStatusBadge status={job.status} />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Options for ${job.title}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {job.status !== 'ARCHIVED' && (
                    <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Meta tags */}
          <div className="flex flex-wrap gap-1.5">
            {job.location && (
              <Badge variant="outline" className="text-[11px] gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {job.location}
              </Badge>
            )}
            {job.isRemote && (
              <Badge variant="outline" className="text-[11px] gap-1">
                <Wifi className="h-3 w-3" aria-hidden="true" />
                Remote
              </Badge>
            )}
            <Badge variant="secondary" className="text-[11px]">
              {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
            </Badge>
            {job.experienceLevel && (
              <Badge variant="secondary" className="text-[11px]">
                {job.experienceLevel}
              </Badge>
            )}
          </div>

          {/* Salary */}
          {salaryDisplay && (
            <p className="text-xs text-muted-foreground font-medium">{salaryDisplay}</p>
          )}

          {/* Footer: applicants + age */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {applicationCount} applicant{applicationCount !== 1 ? 's' : ''}
            </span>
            <span>
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>

      <JobForm
        open={editOpen}
        onOpenChange={setEditOpen}
        job={job}
        onSuccess={onMutated}
      />
      <DeleteJobDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        jobId={job.id}
        jobTitle={job.title}
        onSuccess={onMutated}
      />
    </>
  )
}
