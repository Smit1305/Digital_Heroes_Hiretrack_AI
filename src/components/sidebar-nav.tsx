'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { SessionUser } from '@/lib/auth-utils'
import { hasPermission, ROLE_LABELS } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import {
    BarChart3,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Kanban,
    LayoutDashboard,
    RefreshCw,
    Settings,
    Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  permission?: Parameters<typeof hasPermission>[1]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/jobs', icon: Briefcase, permission: 'jobs:read' },
  { label: 'Candidates', href: '/candidates', icon: Users, permission: 'candidates:read' },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban, permission: 'applications:read' },
  { label: 'Interviews', href: '/interviews', icon: Calendar, permission: 'interviews:read' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'analytics:read' },
]

interface SidebarNavProps {
  user: SessionUser
}

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const visibleItems = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) => !item.permission || hasPermission(user.role, item.permission)
      ),
    [user.role]
  )

  useEffect(() => {
    setPendingHref(null)
    // Aggressively prefetch visible items on sidebar mount
    visibleItems.forEach((item) => {
      router.prefetch(item.href)
    })
    router.prefetch('/settings')
  }, [pathname, router, visibleItems])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pendingHref || pathname === href) {
      e.preventDefault()
      return
    }
    setPendingHref(href)
  }

  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-r bg-sidebar transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b h-14', collapsed && 'justify-center px-0')}>
        <Link
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          onMouseEnter={() => router.prefetch('/')}
          className="flex items-center gap-2.5 min-w-0"
          aria-label="HireTrack AI home"
        >
          <div
            className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-sidebar-primary-foreground text-xs font-bold">H</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight text-sidebar-foreground truncate">
              HireTrack AI
            </span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5" id="primary-navigation" aria-label="Primary navigation">
        {visibleItems.map((item) => {
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
              onMouseEnter={() => router.prefetch(item.href)}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors min-h-[36px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              {pendingHref === item.href ? (
                <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              )}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section: settings + user */}
      <div className="border-t py-3 px-2 space-y-0.5">
        <Link
          href="/settings"
          onClick={(e) => handleLinkClick(e, '/settings')}
          onMouseEnter={() => router.prefetch('/settings')}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors min-h-[36px]',
            'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            pathname.startsWith('/settings') && 'bg-sidebar-accent text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Settings' : undefined}
          aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
        >
          {pendingHref === '/settings' ? (
            <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Settings className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          )}
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User identity strip */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2 mt-1',
            collapsed && 'justify-center px-0'
          )}
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
            <AvatarFallback className="text-[10px] font-semibold bg-sidebar-primary text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
                {user.name ?? user.email}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate leading-tight">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            'w-full h-9 rounded-none text-sidebar-foreground hover:bg-sidebar-accent/60',
            'focus-visible:ring-2 focus-visible:ring-sidebar-ring'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </aside>
  )
}
