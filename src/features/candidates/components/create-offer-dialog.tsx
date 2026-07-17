'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createOfferAction } from '@/server/actions/applications'
import { createOfferSchema, type CreateOfferInput } from '@/validators/application'
import { useRouter } from 'next/navigation'

interface CreateOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  jobTitle: string
  candidateName: string
}

export function CreateOfferDialog({
  open,
  onOpenChange,
  applicationId,
  jobTitle,
  candidateName,
}: CreateOfferDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      salary: 0,
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0] as any,
      notes: '',
    },
  })

  const selectedCurrency = watch('currency')

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const result = await createOfferAction(applicationId, data as CreateOfferInput)
        if (result.success) {
          toast.success(result.message ?? 'Offer created successfully!')
          reset()
          onOpenChange(false)
          router.refresh()
        } else {
          toast.error(result.error ?? 'Failed to create offer.')
        }
      } catch {
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Create Job Offer</DialogTitle>
          <DialogDescription className="text-xs">
            Send a formal job offer to <strong>{candidateName}</strong> for the <strong>{jobTitle}</strong> position.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Salary & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="salary">Annual Salary *</Label>
              <Input
                id="salary"
                type="number"
                placeholder="100000"
                {...register('salary')}
                disabled={isPending}
              />
              {errors.salary && (
                <p className="text-[11px] text-destructive font-medium">{errors.salary.message}</p>
              )}
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(val) => val && setValue('currency', val, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              disabled={isPending}
            />
            {errors.startDate && (
              <p className="text-[11px] text-destructive font-medium">{errors.startDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Offer Details & Benefits</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Outline healthcare plan, equity grant, equity vesting details, stock options, sign-on bonus, or custom terms..."
              {...register('notes')}
              disabled={isPending}
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive font-medium">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Send Job Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
