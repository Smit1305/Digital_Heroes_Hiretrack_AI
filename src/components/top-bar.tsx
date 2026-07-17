'use client'

import {
    BarChart3,
    Bell,
    Briefcase,
    Calendar,
    Kanban,
    LayoutDashboard,
    LogOut,
    Menu,
    Monitor,
    Moon,
    Settings,
    Sun,
    User,
    Users,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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
import { cn } from '@/lib/utils'

const MOBILE_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Candidates', href: '/candidates', icon: Users },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Interviews', href: '/interviews', icon: Calendar },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  jobs: 'Jobs',
  candidates: 'Candidates',
  pipeline: 'Pipeline',
  interviews: 'Interviews',
  analytics: 'Analytics',
  settings: 'Settings',
  notifications: 'Notifications',
}

interface TopBarProps {
  user: SessionUser
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setIsPending(false)
  }, [pathname])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isPending || pathname === href) {
      e.preventDefault()
      return
    }
    setIsPending(true)
    setMobileOpen(false)
  }

  const handlePushClick = (href: string) => {
    if (isPending || pathname === href) return
    setIsPending(true)
    router.push(href)
  }

  const segment = pathname.split('/').filter(Boolean)[0] ?? 'dashboard'
  const pageTitle = BREADCRUMB_MAP[segment] ?? segment

  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleSignOut() {
    setSigningOut(true)
    toast.loading('Signing out…', { id: 'signout' })
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b bg-background px-4 flex-shrink-0">
        {/* Skip links — keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring focus:min-h-[44px] focus:flex focus:items-center"
        >
          Skip to main content
        </a>
        <a
          href="#primary-navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-44 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring focus:min-h-[44px] focus:flex focus:items-center"
        >
          Skip to navigation
        </a>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Page title */}
        <h1 className="text-sm font-semibold text-foreground capitalize flex-1 truncate">
          {pageTitle}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Theme picker */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Change colour theme"
                  className="relative"
                />
              }
            >
              <Sun
                className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                aria-hidden="true"
              />
              <Moon
                className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                aria-hidden="true"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Link
            href="/notifications"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg',
              'text-foreground/70 hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'transition-colors'
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </Link>

          {/* User menu */}
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

              {/* Nav items rendered as plain menu items with onClick navigation */}
              <DropdownMenuItem
                onClick={() => {
                  handlePushClick('/settings/profile')
                }}
              >
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  handlePushClick('/settings')
                }}
              >
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>

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
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav"
            className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r p-4 space-y-1 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center gap-2 mb-6 px-1">
              <div
                className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-sidebar-primary-foreground text-xs font-bold">H</span>
              </div>
              <span className="font-semibold text-sm text-sidebar-foreground">HireTrack AI</span>
            </div>

            {MOBILE_NAV.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[40px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}

            {/* Divider + Settings */}
            <div className="pt-2 border-t mt-2">
              <Link
                href="/settings"
                onClick={(e) => handleLinkClick(e, '/settings')}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[40px]',
                  'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  pathname.startsWith('/settings') &&
                    'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
              >
                <Settings className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Settings
              </Link>

              {/* Sign out in mobile drawer */}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className={cn(
                  'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[40px]',
                  'text-destructive hover:bg-destructive/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
