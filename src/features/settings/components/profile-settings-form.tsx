'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfileAction } from '@/server/actions/settings'

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim(),
  avatar: z.string().url('Avatar must be a valid URL').or(z.string().length(0)).nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileSettingsFormProps {
  initialData: {
    name: string
    email: string
    avatar: string | null
    role: string
  }
}

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData.name,
      avatar: initialData.avatar ?? '',
    },
  })

  const watchAvatar = watch('avatar')
  const watchName = watch('name')

  const initials = (watchName || initialData.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true)
    const toastId = toast.loading('Updating profile…')
    try {
      const result = await updateProfileAction({
        name: data.name,
        avatar: data.avatar || null,
      })

      if (result.success) {
        toast.success('Profile updated successfully.', { id: toastId })
        // Trigger server components re-evaluation client-side without page reload
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to update profile.', { id: toastId })
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
        <CardTitle className="text-base font-semibold">Personal Profile</CardTitle>
        <CardDescription>
          Manage your account settings, display name, and avatar.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pb-8">
          {/* Avatar upload/preview row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={watchAvatar || undefined} alt={watchName || 'User avatar'} />
              <AvatarFallback className="text-lg font-semibold bg-muted text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Profile Picture</h3>
              <p className="text-xs text-muted-foreground">
                Provide a URL of your custom avatar to display across HireTrack AI.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. John Doe"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                value={initialData.email}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-[10px] text-muted-foreground">
                Email cannot be modified. Contact administration to update your email.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-role">System Role</Label>
              <Input
                id="profile-role"
                value={initialData.role}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-avatar">Avatar Image URL</Label>
            <Textarea
              id="profile-avatar"
              placeholder="https://example.com/path/to/avatar.jpg"
              {...register('avatar')}
              aria-invalid={!!errors.avatar}
              className="resize-none h-16 text-xs font-mono"
            />
            {errors.avatar && (
              <p className="text-xs text-destructive">{errors.avatar.message}</p>
            )}
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
