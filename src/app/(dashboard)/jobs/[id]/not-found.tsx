import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function JobNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted"
        aria-hidden="true"
      >
        <Briefcase className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Job not found</h2>
        <p className="text-sm text-muted-foreground">
          This job may have been deleted or you don&apos;t have access to it.
        </p>
      </div>
      <Link
        href="/jobs"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Back to jobs
      </Link>
    </div>
  )
}
