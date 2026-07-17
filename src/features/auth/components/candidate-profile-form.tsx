'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, FileText, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { updateCandidateProfileAction } from '@/server/actions/candidate-auth'
import { candidateProfileUpdateSchema, type CandidateProfileUpdateInput } from '@/validators/auth'

interface CandidateProfileFormProps {
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

export function CandidateProfileForm({ initialProfile }: CandidateProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(initialProfile?.resumeUrl || null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CandidateProfileUpdateInput>({
    resolver: zodResolver(candidateProfileUpdateSchema),
    defaultValues: {
      firstName: initialProfile?.firstName || '',
      lastName: initialProfile?.lastName || '',
      phone: initialProfile?.phone || '',
      linkedinUrl: initialProfile?.linkedinUrl || '',
      portfolioUrl: initialProfile?.portfolioUrl || '',
      githubUrl: initialProfile?.githubUrl || '',
      resumeUrl: initialProfile?.resumeUrl || '',
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    if (!file) {
      setResumeFile(null)
      return
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.')
      e.target.value = ''
      setResumeFile(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.')
      e.target.value = ''
      setResumeFile(null)
      return
    }

    setResumeFile(file)
  }

  async function onSubmit(data: CandidateProfileUpdateInput) {
    setServerError(null)
    let uploadedUrl = currentResumeUrl || ''

    // 1. Upload new resume if selected
    if (resumeFile) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', resumeFile)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const resData = await response.json()
        if (!resData.success) {
          setServerError(resData.error || 'Failed to upload resume.')
          setIsUploading(false)
          return
        }

        uploadedUrl = resData.url
        setCurrentResumeUrl(resData.url)
      } catch {
        setServerError('An error occurred during resume upload.')
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    // 2. Submit update profile action
    try {
      const result = await updateCandidateProfileAction({
        ...data,
        resumeUrl: uploadedUrl || undefined,
      })

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            setError(key as keyof CandidateProfileUpdateInput, { message: messages[0] })
          })
        } else {
          setServerError(result.error)
        }
        return
      }

      toast.success('Profile updated successfully!')
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <Card className="shadow-sm max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">My Profile Details</CardTitle>
        <CardDescription>
          Edit your contact details and professional links
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" role="alert" className="mb-4">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jane"
                aria-invalid={!!errors.firstName}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                aria-invalid={!!errors.lastName}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <Separator className="my-2" />

          {/* Social Profiles */}
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/username"
                aria-invalid={!!errors.linkedinUrl}
                {...register('linkedinUrl')}
              />
              {errors.linkedinUrl && (
                <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/username"
                  aria-invalid={!!errors.githubUrl}
                  {...register('githubUrl')}
                />
                {errors.githubUrl && (
                  <p className="text-xs text-destructive">{errors.githubUrl.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://myportfolio.dev"
                  aria-invalid={!!errors.portfolioUrl}
                  {...register('portfolioUrl')}
                />
                {errors.portfolioUrl && (
                  <p className="text-xs text-destructive">{errors.portfolioUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Resume Upload & Info */}
          <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-dashed">
            <Label htmlFor="resume" className="font-semibold text-foreground">
              Resume Document
            </Label>
            
            {currentResumeUrl && (
              <div className="flex items-center justify-between bg-card p-3 rounded-lg border text-xs">
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="truncate">Current uploaded resume.pdf</span>
                </div>
                <a
                  href={currentResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  View
                </a>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="resume" className="text-xs text-muted-foreground">
                Select a new PDF file to replace current resume (max 5MB)
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading resume…
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving profile…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
