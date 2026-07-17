'use client'

import { format } from 'date-fns'
import {
    Archive,
    Briefcase,
    Calendar,
    Copy,
    DollarSign,
    Edit,
    Globe,
    Loader2,
    MapPin,
    MoreHorizontal,
    Trash2,
    Users,
    Wifi,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface JobDetailViewProps {
  job: JobWithRelations
  canEdit: boolean
  canDelete: boolean
  canArchive: boolean
}

export function JobDetailView({ job, canEdit, canDelete, canArchive }: JobDetailViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const applicationCount = job._count?.applications ?? 0

  const salaryDisplay =
    job.salaryMin || job.salaryMax
      ? [
          job.salaryMin && `$${job.salaryMin.toLocaleString()}`,
          job.salaryMax && `$${job.salaryMax.toLocaleString()}`,
        ]
          .filter(Boolean)
          .join(' – ') + ` ${job.salaryCurrency ?? 'USD'}/yr`
      : null

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveJobAction(job.id)
      if (!result.success) { toast.error(result.error); return }
      toast.success(result.message)
      router.refresh()
    })
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateJobAction(job.id)
      if (!result.success) { toast.error(result.error); return }
      toast.success(result.message)
      router.push('/jobs')
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + actions */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {job.department && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    {job.department}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {job.location}
                  </span>
                )}
                {job.isRemote && (
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                    Remote
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  disabled={isPending}
                >
                  <Edit className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="More options"
                      disabled={isPending}
                    />
                  }
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {canArchive && job.status !== 'ARCHIVED' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    </>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        variant="destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs: description / requirements / benefits */}
          <Tabs defaultValue="description">
            <TabsList variant="line">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              {job.description ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {job.description}
                  </div>
                </div>
              ) : (
                <EmptyTabState message="No description provided." />
              )}
            </TabsContent>

            <TabsContent value="requirements" className="mt-4">
              {job.requirements ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {job.requirements}
                </div>
              ) : (
                <EmptyTabState message="No requirements listed." />
              )}
            </TabsContent>

            <TabsContent value="benefits" className="mt-4">
              {job.benefits ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {job.benefits}
                </div>
              ) : (
                <EmptyTabState message="No benefits listed." />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Stats card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatRow
                icon={Users}
                label="Applicants"
                value={`${applicationCount} total`}
              />
              <StatRow
                icon={Briefcase}
                label="Type"
                value={EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
              />
              {salaryDisplay && (
                <StatRow icon={DollarSign} label="Salary" value={salaryDisplay} />
              )}
              {job.experienceLevel && (
                <StatRow icon={Globe} label="Experience" value={job.experienceLevel} />
              )}
              <Separator />
              <StatRow
                icon={Calendar}
                label="Created"
                value={format(new Date(job.createdAt), 'MMM d, yyyy')}
              />
              {job.publishedAt && (
                <StatRow
                  icon={Calendar}
                  label="Published"
                  value={format(new Date(job.publishedAt), 'MMM d, yyyy')}
                />
              )}
              {job.updatedAt && (
                <StatRow
                  icon={Calendar}
                  label="Last updated"
                  value={format(new Date(job.updatedAt), 'MMM d, yyyy')}
                />
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
                </Badge>
                {job.isRemote && (
                  <Badge variant="secondary" className="text-xs">
                    Remote
                  </Badge>
                )}
                {job.location && (
                  <Badge variant="outline" className="text-xs">
                    {job.location}
                  </Badge>
                )}
                {job.department && (
                  <Badge variant="outline" className="text-xs">
                    {job.department}
                  </Badge>
                )}
                {job.experienceLevel && (
                  <Badge variant="outline" className="text-xs">
                    {job.experienceLevel}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hiring manager */}
          {job.hiringManager && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Hiring Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold flex-shrink-0"
                    aria-hidden="true"
                  >
                    {(job.hiringManager.name ?? job.hiringManager.email ?? 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {job.hiringManager.name ?? 'Unnamed'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {job.hiringManager.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <JobForm
        open={editOpen}
        onOpenChange={setEditOpen}
        job={job}
        onSuccess={() => router.refresh()}
      />
      <DeleteJobDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        jobId={job.id}
        jobTitle={job.title}
        onSuccess={() => router.push('/jobs')}
      />
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-right truncate max-w-[140px]">{value}</span>
    </div>
  )
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <p className="text-sm text-muted-foreground py-4">{message}</p>
  )
}
