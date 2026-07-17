import { CandidateProfileForm } from '@/features/auth/components/candidate-profile-form'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Edit My Profile',
}

export default async function CandidateProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/candidate/login')
  }

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
    <div className="space-y-6">
      <div className="text-center sm:text-left max-w-2xl mx-auto space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Manage Professional Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your contact details, social portfolio links, and application resume.
        </p>
      </div>

      <CandidateProfileForm initialProfile={profile} />
    </div>
  )
}
