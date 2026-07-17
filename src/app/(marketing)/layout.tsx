import Link from 'next/link'
import { auth } from '@/lib/auth'
import { MarketingHeader } from '@/components/marketing-header'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Site header */}
      <MarketingHeader user={session?.user} />

      {/* Page content */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      {/* Site footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2" aria-label="HireTrack AI home">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground"
                  aria-hidden="true"
                >
                  <span className="text-xs font-bold text-background">H</span>
                </div>
                <span className="font-semibold text-sm">HireTrack AI</span>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Modern applicant tracking for high-performing hiring teams.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { href: '/features', label: 'Features' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/docs', label: 'Docs' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Platform
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { href: '/auth/login', label: 'Sign in' },
                  { href: '/auth/register', label: 'Register' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Legal
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/terms', label: 'Terms' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} HireTrack AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
