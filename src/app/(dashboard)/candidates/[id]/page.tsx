import { buttonVariants } from '@/components/ui/button'
import { CandidateDetailView } from '@/features/candidates/components/candidate-detail-view'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'
import {
    getCandidateAction,
    getCandidateActivityAction,
    getCandidateNotesAction,
} from '@/server/actions/candidates'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getCandidateAction(id)
  if (!result.success) return { title: 'Candidate not found — HireTrack AI' }
  const c = result.data
  return {
    title: `${c.firstName} ${c.lastName} — HireTrack AI`,
    description: `Candidate profile for ${c.firstName} ${c.lastName}.`,
  }
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const [candidateResult, notesResult, activityResult] = await Promise.all([
    getCandidateAction(id),
    getCandidateNotesAction(id),
    getCandidateActivityAction(id),
  ])

  if (!candidateResult.success) notFound()

  const canEdit = hasPermission(session.user.role, 'candidates:update')
  const canDelete = hasPermission(session.user.role, 'candidates:delete')

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <Link
        href="/candidates"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-1.5')}
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        Back to candidates
      </Link>

      <CandidateDetailView
        candidate={candidateResult.data}
        notes={notesResult.success ? notesResult.data : []}
        activities={activityResult.success ? activityResult.data : []}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
