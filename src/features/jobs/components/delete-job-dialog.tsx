'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { deleteJobAction } from '@/server/actions/jobs'

interface DeleteJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  jobTitle: string
  onSuccess?: () => void
}

export function DeleteJobDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  onSuccess,
}: DeleteJobDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteJobAction(jobId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Job deleted.')
      onOpenChange(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete job</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">&ldquo;{jobTitle}&rdquo;</span>? This
            action cannot be undone. The job and all its data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Delete job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
