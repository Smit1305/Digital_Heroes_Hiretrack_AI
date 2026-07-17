'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, LayoutDashboard, FileText, Briefcase, Calendar, Award } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface CandidateHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function CandidateHeader({ user }: CandidateHeaderProps) {
  const router = useRouter()
  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/candidate/dashboard"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <span className="text-xs font-bold text-background">H</span>
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline-block">
            HireTrack AI
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-5" aria-label="Candidate navigation">
          <Link
            href="/candidate/dashboard"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            href="/candidate/applications"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Applications</span>
          </Link>
          <Link
            href="/candidate/interviews"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Interviews</span>
          </Link>
          <Link
            href="/candidate/offers"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Offers</span>
          </Link>
          <Link
            href="/candidate/profile"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </nav>

        {/* User Account Menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="rounded-full h-8 w-8 p-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="User menu"
                />
              }
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                <AvatarFallback className="text-xs font-semibold bg-muted">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2.5 py-2 text-xs font-medium text-muted-foreground">
                <div className="flex flex-col gap-0.5 py-0.5">
                  <span className="font-medium text-sm leading-tight text-foreground truncate">
                    {user.name ?? 'Candidate'}
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  router.push('/candidate/profile')
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  signOut({ callbackUrl: '/candidate/login' })
                }}
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
