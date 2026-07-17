'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Paperclip, UploadCloud, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { publicApplyAction } from '@/server/actions/applications'
import { publicApplySchema, type PublicApplyInput } from '@/validators/application'

interface ApplyFormProps {
  jobId: string
  jobTitle: string
  orgName: string
  slug: string
  candidateEmail?: string
  initialProfile?: {
    firstName: string
    lastName: string
    phone: string | null
    linkedinUrl: string | null
    portfolioUrl: string | null
    githubUrl: string | null
    resumeUrl: string | null
  } | null
}

export function ApplyForm({ jobId, jobTitle, orgName, slug, candidateEmail, initialProfile }: ApplyFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileUploadError, setFileUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PublicApplyInput>({
    resolver: zodResolver(publicApplySchema),
    defaultValues: {
      firstName: initialProfile?.firstName || '',
      lastName: initialProfile?.lastName || '',
      email: candidateEmail || '',
      phone: initialProfile?.phone || '',
      linkedin: initialProfile?.linkedinUrl || '',
      portfolio: initialProfile?.portfolioUrl || '',
      coverLetter: '',
      resumeUrl: initialProfile?.resumeUrl || '',
      resumeFileName: initialProfile?.resumeUrl ? 'resume.pdf' : '',
    },
  })

  // Watch values for showing uploaded resume state
  const watchResumeUrl = watch('resumeUrl')
  const watchResumeFileName = watch('resumeFileName')

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Size check: max 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileUploadError('File size exceeds 5MB limit.')
      return
    }

    // Type check
    const allowed = ['.pdf', '.doc', '.docx', '.txt']
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      setFileUploadError('Only PDF, Word (.doc/.docx), or Text (.txt) files are allowed.')
      return
    }

    setFile(selectedFile)

    // Upload immediately
    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setValue('resumeUrl', data.url, { shouldValidate: true })
        setValue('resumeFileName', data.filename, { shouldValidate: true })
        toast.success('Resume uploaded successfully!')
      } else {
        setFileUploadError(data.error ?? 'Upload failed.')
      }
    } catch {
      setFileUploadError('Network error uploading file.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setValue('resumeUrl', '', { shouldValidate: true })
    setValue('resumeFileName', '', { shouldValidate: true })
  }

  const onSubmit = async (data: PublicApplyInput) => {
    try {
      const result = await publicApplyAction(jobId, data)

      if (result.success) {
        setSuccess(true)
        const appUrl = window.location.origin
        setTrackingUrl(`${appUrl}/careers/applications/${result.data.applicationId}`)
        toast.success('Application submitted successfully!')
      } else {
        toast.error(result.error ?? 'Failed to submit application.')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="border bg-card rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto text-green-600 font-bold text-lg">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Application Submitted!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for applying to the <strong>{jobTitle}</strong> position at <strong>{orgName}</strong>. 
            A confirmation email has been sent. You can track your application status online using the link below:
          </p>
        </div>

        <div className="bg-muted p-4 rounded-xl border text-sm font-mono break-all text-left">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider font-sans mb-1.5">
            YOUR SECURE TRACKING LINK
          </span>
          <a href={trackingUrl} className="text-primary hover:underline font-semibold font-mono">
            {trackingUrl}
          </a>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <a
            href={trackingUrl}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground text-background px-5 text-xs font-semibold hover:bg-foreground/90 transition-colors"
          >
            Track Status
          </a>
          <a
            href={`/careers/${slug}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-5 text-xs font-semibold hover:bg-muted transition-colors"
          >
            Back to Job Board
          </a>
        </div>
      </div>
    )
  }

  const isLoading = uploading || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border bg-card rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
        <p className="text-xs text-muted-foreground">Please provide your details below.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name *</Label>
          <Input id="firstName" {...register('firstName')} disabled={isLoading} />
          {errors.firstName && (
            <p className="text-xs text-destructive font-medium">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name *</Label>
          <Input id="lastName" {...register('lastName')} disabled={isLoading} />
          {errors.lastName && (
            <p className="text-xs text-destructive font-medium">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email address *</Label>
          <Input id="email" type="email" {...register('email')} disabled={isLoading} />
          {errors.email && (
            <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register('phone')} disabled={isLoading} />
          {errors.phone && (
            <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Professional Profiles</h2>
          <p className="text-xs text-muted-foreground">Share your professional profiles and work.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" placeholder="https://linkedin.com/in/username" {...register('linkedin')} disabled={isLoading} />
            {errors.linkedin && (
              <p className="text-xs text-destructive font-medium">{errors.linkedin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio or Website URL</Label>
            <Input id="portfolio" placeholder="https://username.dev" {...register('portfolio')} disabled={isLoading} />
            {errors.portfolio && (
              <p className="text-xs text-destructive font-medium">{errors.portfolio.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Resume & Cover Letter</h2>
          <p className="text-xs text-muted-foreground">Upload your resume and introduce yourself.</p>
        </div>

        {/* File upload box */}
        <div className="space-y-2">
          <Label>Resume / CV *</Label>
          {!watchResumeUrl ? (
            <div className="relative border-2 border-dashed border-muted rounded-xl p-6 text-center hover:bg-muted/10 transition-colors">
              <input
                type="file"
                id="resume-upload"
                onChange={handleFileChange}
                disabled={isLoading}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
              />
              <div className="space-y-2">
                <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto" />
                <div className="text-sm font-semibold text-foreground">Click to upload or drag & drop</div>
                <div className="text-xs text-muted-foreground">PDF, Word, or Text files up to 5MB</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border bg-muted/20 p-3 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate max-w-sm">
                  {watchResumeFileName}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {uploading && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading resume...
            </p>
          )}
          {fileUploadError && (
            <p className="text-xs text-destructive font-medium">{fileUploadError}</p>
          )}
          {errors.resumeUrl && (
            <p className="text-xs text-destructive font-medium">{errors.resumeUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverLetter">Cover Letter</Label>
          <Textarea
            id="coverLetter"
            rows={5}
            placeholder="Write a brief cover letter or introduction..."
            {...register('coverLetter')}
            disabled={isLoading}
          />
          {errors.coverLetter && (
            <p className="text-xs text-destructive font-medium">{errors.coverLetter.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <Link
          href={`/careers/${slug}/jobs/${jobId}`}
          className="inline-flex h-10 items-center justify-center rounded-xl border bg-background px-5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </Link>
        <Button type="submit" className="rounded-xl px-5 h-10 font-bold" disabled={isLoading}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Application
        </Button>
      </div>
    </form>
  )
}
