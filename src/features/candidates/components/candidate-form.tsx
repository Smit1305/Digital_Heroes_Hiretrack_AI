'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { createCandidateAction, updateCandidateAction } from '@/server/actions/candidates'
import type { CandidateWithApplications } from '@/types/database'
import { createCandidateSchema, type CreateCandidateInput } from '@/validators/candidate'
import { CandidateStatus } from '@prisma/client'

const STATUS_LABELS: Record<CandidateStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLACKLISTED: 'Blacklisted',
}

const SOURCE_OPTIONS = [
  'LinkedIn',
  'Referral',
  'Job Board',
  'Company Website',
  'Indeed',
  'Campus Recruiting',
  'GitHub',
  'Other',
]

interface CandidateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate?: CandidateWithApplications
  onSuccess?: () => void
}

export function CandidateForm({ open, onOpenChange, candidate, onSuccess }: CandidateFormProps) {
  const isEditing = Boolean(candidate)
  const [isPending, startTransition] = useTransition()
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(candidate?.skills ?? [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof createCandidateSchema>>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      firstName: candidate?.firstName ?? '',
      lastName: candidate?.lastName ?? '',
      email: candidate?.email ?? '',
      phone: candidate?.phone ?? '',
      linkedin: candidate?.linkedin ?? '',
      portfolio: candidate?.portfolio ?? '',
      website: candidate?.website ?? '',
      location: candidate?.location ?? '',
      experience: candidate?.experience ?? undefined,
      education: candidate?.education ?? '',
      skills: candidate?.skills ?? [],
      notes: candidate?.notes ?? '',
      source: candidate?.source ?? '',
      status: candidate?.status ?? CandidateStatus.ACTIVE,
    },
  })

  const status = watch('status')
  const source = watch('source')

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim()
    if (!trimmed || skills.includes(trimmed) || skills.length >= 50) return
    const next = [...skills, trimmed]
    setSkills(next)
    setValue('skills', next)
    setSkillInput('')
  }, [skillInput, skills, setValue])

  const removeSkill = useCallback(
    (skill: string) => {
      const next = skills.filter((s) => s !== skill)
      setSkills(next)
      setValue('skills', next)
    },
    [skills, setValue]
  )

  function onClose() {
    reset()
    setSkills(candidate?.skills ?? [])
    setSkillInput('')
    onOpenChange(false)
  }

  function onSubmit(data: z.input<typeof createCandidateSchema>) {
    startTransition(async () => {
      const payload = {
        ...data,
        skills,
        status: data.status ?? CandidateStatus.ACTIVE,
      }
      const result = isEditing && candidate
        ? await updateCandidateAction(candidate.id, payload)
        : await createCandidateAction(payload)

      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? (isEditing ? 'Candidate updated.' : 'Candidate added.'))
      onClose()
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit candidate' : 'Add candidate'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update candidate information.' : 'Add a new candidate to your pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                First name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Jordan"
                aria-invalid={!!errors.firstName}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive" role="alert">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">
                Last name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Rivera"
                aria-invalid={!!errors.lastName}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive" role="alert">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jordan@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 415 555 0101" {...register('phone')} />
            </div>
          </div>

          {/* Location + Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="San Francisco, CA" {...register('location')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experience">Years of experience</Label>
              <Input
                id="experience"
                type="number"
                min={0}
                max={50}
                placeholder="5"
                {...register('experience', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
              />
            </div>
          </div>

          {/* Source + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">Source</Label>
              <Select value={source ?? ''} onValueChange={(v) => setValue('source', v ?? undefined)}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setValue('status', v as CandidateStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CandidateStatus).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-1.5">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              placeholder="BS Computer Science, Stanford University"
              {...register('education')}
            />
          </div>

          {/* LinkedIn + Portfolio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                aria-invalid={!!errors.linkedin}
                {...register('linkedin')}
              />
              {errors.linkedin && (
                <p className="text-xs text-destructive" role="alert">{errors.linkedin.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolio">Portfolio / Website</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://..."
                aria-invalid={!!errors.portfolio}
                {...register('portfolio')}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                className="flex-1"
                aria-label="Add skill"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 pr-1 text-xs"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-sm hover:bg-foreground/10 p-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes about this candidate..."
              className="min-h-[80px]"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isEditing ? 'Save changes' : 'Add candidate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
