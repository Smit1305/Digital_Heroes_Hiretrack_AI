import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Candidate Portal',
    template: '%s — HireTrack AI',
  },
  robots: { index: false, follow: false },
}

export default function CandidateRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
