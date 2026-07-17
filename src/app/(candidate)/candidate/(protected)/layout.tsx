import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { CandidateHeader } from '@/components/candidate-header'

export default async function CandidateProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'CANDIDATE') {
    redirect('/candidate/login')
  }

  const user = session.user

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <CandidateHeader user={user} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
