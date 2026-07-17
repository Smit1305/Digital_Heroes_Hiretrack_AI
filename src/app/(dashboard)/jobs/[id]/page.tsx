import { buttonVariants } from '@/components/ui/button'
import { JobDetailView } from '@/features/jobs/components/job-detail-view'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'
import { getJobAction } from '@/server/actions/jobs'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getJobAction(id)
  if (!result.success) return { title: 'Job not found — HireTrack AI' }
  return {
    title: `${result.data.title} — HireTrack AI`,
    description: result.data.description.slice(0, 160),
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const result = await getJobAction(id)
  if (!result.success) notFound()

  const canEdit = hasPermission(session.user.role, 'jobs:update')
  const canDelete = hasPermission(session.user.role, 'jobs:delete')
  const canArchive = hasPermission(session.user.role, 'jobs:archive')

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Back nav */}
      <Link
        href="/jobs"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-1.5')}
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        Back to jobs
      </Link>

      <JobDetailView
        job={result.data}
        canEdit={canEdit}
        canDelete={canDelete}
        canArchive={canArchive}
      />
    </div>
  )
}
