import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ApplyForm } from './apply-form'

interface ApplyPageProps {
  params: Promise<{ slug: string; jobId: string }>
}

export async function generateMetadata({ params }: ApplyPageProps): Promise<Metadata> {
  const { slug, jobId } = await params
  const job = await db.job.findFirst({
    where: { id: jobId, status: 'OPEN', deletedAt: null, organization: { slug } },
    select: { title: true, organization: { select: { name: true } } },
  })

  if (!job) return {}
  return {
    title: `Apply for ${job.title} — HireTrack AI`,
    description: `Complete the online application form for ${job.title}.`,
  }
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const session = await auth()
  const { slug, jobId } = await params

  if (!session?.user) {
    const callbackUrl = encodeURIComponent(`/careers/${slug}/jobs/${jobId}/apply`)
    redirect(`/candidate/login?callbackUrl=${callbackUrl}`)
  }

  const job = await db.job.findFirst({
    where: {
      id: jobId,
      status: 'OPEN',
      deletedAt: null,
      organization: { slug },
    },
    include: {
      organization: true,
    },
  })

  if (!job) {
    notFound()
  }

  // Fetch logged in candidate's profile to pre-fill the form
  const profile = await db.candidateProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      linkedinUrl: true,
      portfolioUrl: true,
      githubUrl: true,
      resumeUrl: true,
    },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {job.organization.name}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Apply for {job.title}
        </h1>
        <p className="text-xs text-muted-foreground">
          Fill out the application form below. All fields marked with * are required.
        </p>
      </div>

      {/* Form component */}
      <ApplyForm
        jobId={job.id}
        jobTitle={job.title}
        orgName={job.organization.name}
        slug={slug}
        candidateEmail={session.user.email ?? undefined}
        initialProfile={profile}
      />
    </div>
  )
}
