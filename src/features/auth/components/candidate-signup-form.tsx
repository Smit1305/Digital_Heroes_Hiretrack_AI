'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { candidateSignUpAction } from '@/server/actions/candidate-auth'
import { candidateSignUpSchema, type CandidateSignUpInput } from '@/validators/auth'

export function CandidateSignUpForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CandidateSignUpInput>({
    resolver: zodResolver(candidateSignUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      linkedinUrl: '',
      portfolioUrl: '',
      githubUrl: '',
      resumeUrl: '',
    },
  })

  // Handle local file selection and basic validation
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

  async function onSubmit(data: CandidateSignUpInput) {
    setServerError(null)
    let uploadedUrl = ''

    // 1. Upload resume if selected
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
      } catch {
        setServerError('An error occurred during resume upload.')
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    // 2. Submit signup action
    try {
      const result = await candidateSignUpAction({
        ...data,
        resumeUrl: uploadedUrl || undefined,
      })

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            setError(key as keyof CandidateSignUpInput, { message: messages[0] })
          })
        } else {
          setServerError(result.error)
        }
        return
      }

      toast.success('Account created successfully!')
      router.push(`/candidate/verify-email?email=${encodeURIComponent(result.data.email)}`)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Create Candidate Account</CardTitle>
        <CardDescription>Register to apply for jobs and manage interviews</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane.doe@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (Optional)</Label>
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
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Social Profiles */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
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
                <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
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

          {/* Resume Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="resume">Resume (PDF, max 5MB)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
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
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-0">
        <p className="text-sm text-muted-foreground">
          Already have a candidate account?{' '}
          <Link
            href="/candidate/login"
            className={cn(buttonVariants({ variant: 'link' }), 'p-0 h-auto font-medium text-sm')}
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
