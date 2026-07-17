'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { updateOrganizationAction } from '@/server/actions/settings'

const orgFormSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100).trim(),
  website: z.string().url('Website must be a valid URL').or(z.string().length(0)).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  size: z.string().max(50).nullable().optional(),
})

type OrgFormValues = z.infer<typeof orgFormSchema>

interface OrgSettingsFormProps {
  initialData: {
    name: string
    website: string | null
    industry: string | null
    size: string | null
    plan: string
    slug: string
  }
}

export function OrgSettingsForm({ initialData }: OrgSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: initialData.name,
      website: initialData.website ?? '',
      industry: initialData.industry ?? '',
      size: initialData.size ?? '',
    },
  })

  const selectedSize = watch('size')

  async function onSubmit(data: OrgFormValues) {
    setLoading(true)
    const toastId = toast.loading('Saving organization settings…')
    try {
      const result = await updateOrganizationAction({
        name: data.name,
        website: data.website || null,
        industry: data.industry || null,
        size: data.size || null,
      })

      if (result.success) {
        toast.success('Organization settings saved successfully.', { id: toastId })
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to save settings.', { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Organization Profile</CardTitle>
        <CardDescription>
          Update your company details and how they appear across the applicant tracking system.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-8">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="e.g. Acme Corp"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-website">Website URL</Label>
            <Input
              id="org-website"
              placeholder="https://example.com"
              {...register('website')}
              aria-invalid={!!errors.website}
            />
            {errors.website && (
              <p className="text-xs text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-industry">Industry</Label>
              <Input
                id="org-industry"
                placeholder="e.g. Software, Healthcare"
                {...register('industry')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-size">Company Size</Label>
              <Select
                value={selectedSize || 'ALL'}
                onValueChange={(val) => setValue('size', val === 'ALL' ? '' : val)}
              >
                <SelectTrigger id="org-size" aria-label="Company size select">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Select company size</SelectItem>
                  <SelectItem value="1-10">1 - 10 employees</SelectItem>
                  <SelectItem value="11-50">11 - 50 employees</SelectItem>
                  <SelectItem value="51-200">51 - 200 employees</SelectItem>
                  <SelectItem value="201-500">201 - 500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-end">
          <Button type="submit" disabled={loading} size="sm">
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
