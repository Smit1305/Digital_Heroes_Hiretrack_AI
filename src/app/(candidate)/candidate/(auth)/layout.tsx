import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Candidate Portal',
    template: '%s — Candidate Portal',
  },
  robots: { index: false, follow: false },
}

export default function CandidateAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Minimal nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 group" aria-label="HireTrack AI home">
          <div
            className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center
                        group-hover:bg-foreground/80 transition-colors"
            aria-hidden="true"
          >
            <span className="text-background text-xs font-bold">H</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">HireTrack AI</span>
        </Link>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
          Candidate Portal
        </span>
      </header>

      {/* Auth content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm sm:max-w-md">{children}</div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} HireTrack AI. All rights reserved.
      </footer>
    </div>
  )
}
