'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createJobAction, updateJobAction } from '@/server/actions/jobs'
import type { JobWithRelations } from '@/types/database'
import {
    createJobSchema,
    type CreateJobInput,
    type UpdateJobInput,
} from '@/validators/job'
import { EmploymentType, JobStatus } from '@/types/enums'

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  PAUSED: 'Paused',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
}

interface JobFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job?: JobWithRelations
  onSuccess?: () => void
}

export function JobForm({ open, onOpenChange, job, onSuccess }: JobFormProps) {
  const isEditing = Boolean(job)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: job?.title ?? '',
      department: job?.department ?? '',
      location: job?.location ?? '',
      employmentType: job?.employmentType ?? EmploymentType.FULL_TIME,
      salaryMin: job?.salaryMin ?? undefined,
      salaryMax: job?.salaryMax ?? undefined,
      salaryCurrency: job?.salaryCurrency ?? 'USD',
      description: job?.description ?? '',
      requirements: job?.requirements ?? '',
      benefits: job?.benefits ?? '',
      status: job?.status ?? JobStatus.DRAFT,
      isRemote: job?.isRemote ?? false,
      experienceLevel: job?.experienceLevel ?? '',
    },
  })

  const employmentType = watch('employmentType')
  const status = watch('status')
  const isRemote = watch('isRemote')

  function onClose() {
    reset()
    onOpenChange(false)
  }

  function onSubmit(data: z.input<typeof createJobSchema>) {
    startTransition(async () => {
      const payload = {
        ...data,
        employmentType: data.employmentType ?? EmploymentType.FULL_TIME,
        salaryCurrency: data.salaryCurrency ?? 'USD',
        status: data.status ?? JobStatus.DRAFT,
        isRemote: data.isRemote ?? false,
      }
      const result = isEditing && job
        ? await updateJobAction(job.id, payload as UpdateJobInput)
        : await createJobAction(payload)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(result.message ?? (isEditing ? 'Job updated.' : 'Job created.'))
      onClose()
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit job' : 'Create job'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the job posting details below.'
              : 'Fill in the details for the new job posting.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Job title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Engineer"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              {...register('title')}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Department + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g. Engineering"
                {...register('department')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA"
                {...register('location')}
              />
            </div>
          </div>

          {/* Employment Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="employmentType">Employment type</Label>
              <Select
                value={employmentType}
                onValueChange={(v) => setValue('employmentType', v as EmploymentType)}
              >
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EmploymentType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {EMPLOYMENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setValue('status', v as JobStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(JobStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {JOB_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary range */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="salaryMin">Min salary</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="100000"
                {...register('salaryMin', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryMax">Max salary</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="150000"
                {...register('salaryMax', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Input
                id="experienceLevel"
                placeholder="e.g. Senior"
                {...register('experienceLevel')}
              />
            </div>
          </div>

          {/* Remote toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isRemote"
              checked={isRemote}
              onCheckedChange={(checked) => setValue('isRemote', Boolean(checked))}
            />
            <Label htmlFor="isRemote" className="cursor-pointer font-normal">
              Remote position
            </Label>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the role and responsibilities..."
              className="min-h-[120px]"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              {...register('description')}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the skills, qualifications, or experience required..."
              className="min-h-[100px]"
              {...register('requirements')}
            />
          </div>

          {/* Benefits */}
          <div className="space-y-1.5">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              placeholder="List compensation, perks, and benefits..."
              className="min-h-[80px]"
              {...register('benefits')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isEditing ? 'Save changes' : 'Create job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
