import { SidebarNav } from '@/components/sidebar-nav'
import { TopBar } from '@/components/top-bar'
import type { SessionUser } from '@/lib/auth-utils'
import { CommandCenter } from '@/components/command-center'
import { PageTransition } from '@/components/page-transition'

interface AppShellProps {
  user: SessionUser
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <SidebarNav user={user} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={user} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus-visible:outline-none"
          tabIndex={-1}
        >
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
      <CommandCenter />
    </div>
  )
}

