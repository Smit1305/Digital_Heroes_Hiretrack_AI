'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { LogOut, Menu, Settings, User, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SessionUser } from '@/lib/auth-utils'
import { ROLE_LABELS } from '@/lib/permissions'

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/careers', label: 'Careers' },
  { href: '/about', label: 'About' },
]

interface MarketingHeaderProps {
  user?: SessionUser
}

export function MarketingHeader({ user }: MarketingHeaderProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    toast.loading('Signing out…', { id: 'signout' })
    await signOut({ callbackUrl: '/' })
  }

  const initials = user
    ? (user.name ?? user.email ?? 'U')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  // Dynamic dashboard destination based on authenticated role
  const getDashboardHref = () => {
    if (!user) return '/'
    if (user.role === 'CANDIDATE') return '/candidate/dashboard'
    if (user.role === 'SUPER_ADMIN') return '/admin'
    return '/dashboard'
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label="HireTrack AI home"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground"
            aria-hidden="true"
          >
            <span className="text-xs font-bold text-background">H</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">HireTrack AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right items & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={getDashboardHref()}
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Dashboard
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="rounded-full h-8 w-8 p-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`User menu for ${user.name ?? user.email}`}
                    />
                  }
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
                    <AvatarFallback className="text-[10px] font-semibold bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  {/* User identity */}
                  <div className="px-2.5 py-2 text-xs font-medium text-muted-foreground">
                    <div className="flex flex-col gap-0.5 py-0.5">
                      <span className="font-medium text-sm leading-tight text-foreground truncate">
                        {user.name ?? 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight truncate">
                        {user.email}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      router.push(user.role === 'CANDIDATE' ? '/candidate/profile' : '/settings/profile')
                    }}
                  >
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    Profile
                  </DropdownMenuItem>

                  {user.role !== 'CANDIDATE' && (
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/settings')
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                      Settings
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={signingOut}
                    variant="destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/careers"
                className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Jobs
              </Link>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Company Login
              </Link>
              <Link
                href="/auth/select-account"
                className="hidden sm:inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {user ? (
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center h-10 rounded-xl bg-foreground text-background font-medium text-sm shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/careers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center h-10 rounded-xl border border-input text-foreground font-medium text-sm hover:bg-muted"
                >
                  Find Jobs
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center h-10 rounded-xl border border-input text-foreground font-medium text-sm hover:bg-muted"
                >
                  Company Login
                </Link>
                <Link
                  href="/auth/select-account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center h-10 rounded-xl bg-foreground text-background font-semibold text-sm shadow-sm hover:bg-foreground/90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
