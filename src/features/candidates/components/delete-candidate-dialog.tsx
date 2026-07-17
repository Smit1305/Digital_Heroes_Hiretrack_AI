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
import { deleteCandidateAction } from '@/server/actions/candidates'

interface DeleteCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: string
  candidateName: string
  onSuccess?: () => void
}

export function DeleteCandidateDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  onSuccess,
}: DeleteCandidateDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCandidateAction(candidateId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Candidate deleted.')
      onOpenChange(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete candidate</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{candidateName}</span>? This will
            permanently remove their profile and application history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
