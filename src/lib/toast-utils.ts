import { toast } from 'sonner'

/**
 * Show a toast with an undo action.
 * The undo callback fires if the user clicks "Undo" within `timeoutMs`.
 * Returns a dismiss function.
 *
 * @example
 * ```ts
 * toastWithUndo('Candidate archived', async () => {
 *   await restoreCandidate(id)
 * })
 * ```
 */
export function toastWithUndo(
  message: string,
  onUndo: () => void | Promise<void>,
  timeoutMs = 5000
): string | number {
  return toast(message, {
    duration: timeoutMs,
    action: {
      label: 'Undo',
      onClick: async () => {
        try {
          await onUndo()
          toast.success('Action undone')
        } catch {
          toast.error('Failed to undo action')
        }
      },
    },
  })
}

/**
 * Show a loading → success/error toast sequence.
 *
 * @example
 * ```ts
 * await toastPromise(
 *   updateJob(jobId, data),
 *   { loading: 'Saving...', success: 'Job saved', error: 'Failed to save' }
 * )
 * ```
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> {
  toast.promise(promise, messages)
  return promise
}
