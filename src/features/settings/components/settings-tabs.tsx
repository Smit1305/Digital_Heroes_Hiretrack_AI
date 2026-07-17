'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, User, Users, Shield, Layers, CreditCard } from 'lucide-react'

export function SettingsTabs() {
  const pathname = usePathname()

  const tabs = [
    {
      label: 'Organization Details',
      href: '/settings',
      active: pathname === '/settings',
      icon: Building2,
    },
    {
      label: 'My Profile',
      href: '/settings/profile',
      active: pathname === '/settings/profile',
      icon: User,
    },
    {
      label: 'Billing & Plans',
      href: '/settings/billing',
      active: pathname.startsWith('/settings/billing'),
      icon: CreditCard,
    },
    {
      label: 'Teams',
      href: '/settings/teams',
      active: pathname.startsWith('/settings/teams'),
      icon: Layers,
    },
    {
      label: 'Users & Invitations',
      href: '/settings/users',
      active: pathname.startsWith('/settings/users'),
      icon: Users,
    },
    {
      label: 'Roles & Permissions',
      href: '/settings/roles',
      active: pathname.startsWith('/settings/roles'),
      icon: Shield,
    },
  ]

  return (
    <div className="border-b pb-px">
      <nav className="flex space-x-6" aria-label="Settings sub navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 pb-3.5 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-sm',
                tab.active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              aria-current={tab.active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
