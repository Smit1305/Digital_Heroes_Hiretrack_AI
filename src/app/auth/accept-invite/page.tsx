import { AcceptInviteForm } from '@/features/auth/components/accept-invite-form'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Accept Team Invite',
  description: 'Accept your invitation to join a HireTrack AI organization.',
}

type AcceptInvitePageProps = {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidInviteCard message="The invitation link is missing a secure token." />
  }

  // Validate the token in the database
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { organization: true },
  })

  if (!invitation || invitation.accepted || invitation.expires < new Date()) {
    return <InvalidInviteCard message="This invitation link is invalid, has expired, or has already been accepted." />
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-muted/30">
      <AcceptInviteForm
        token={token}
        email={invitation.email}
        orgName={invitation.organization.name}
        role={invitation.role}
      />
    </div>
  )
}

function InvalidInviteCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-muted/30">
      <Card className="w-full shadow-sm max-w-md mx-auto text-center">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Invalid Invitation</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
            Back to homepage
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
