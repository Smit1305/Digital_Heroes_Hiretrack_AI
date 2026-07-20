import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s — HireTrack AI',
  },
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/features" className="hover:text-foreground transition-colors hidden sm:block">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors hidden sm:block">
            Pricing
          </Link>
        </nav>
      </header>

      {/* Auth content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8 w-full">
        <div className="w-full flex justify-center">{children}</div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HireTrack AI. All rights reserved.
      </footer>
    </div>
  )
}
