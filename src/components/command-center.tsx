'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { 
  Search, Plus, Users, Settings, LogOut, Briefcase, 
  Calendar, Award, HelpCircle, FileText, ChevronRight, Loader2,
  Clock, ArrowUpDown
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { searchGlobalAction, type GlobalSearchResults } from '@/server/actions/search'

const RECENT_SEARCHES_KEY = 'hiretrack-recent-searches'
const MAX_RECENT_SEARCHES = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return
  try {
    const current = getRecentSearches()
    const updated = [query, ...current.filter((q) => q !== query)].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // localStorage unavailable — fail silently
  }
}

export function CommandCenter() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [results, setResults] = useState<GlobalSearchResults>({
    jobs: [],
    candidates: [],
    teams: [],
    settings: [],
  })

  // Track keyboard sequence
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)

  // Load recent searches on mount (client-only)
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // Listen to toggle and keyboard sequences
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable

      // Ctrl + K or Cmd + K — works even in inputs
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      // Don't process other shortcuts when inside inputs
      if (isInputFocused) return

      const key = e.key.toLowerCase()

      // "/" → Open command center (like GitHub)
      if (key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setIsOpen(true)
        return
      }

      // "?" → Open keyboard shortcuts help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push('/help/shortcuts')
        return
      }

      // Sequence: "g" then another navigation key
      if (lastKeyPressed === 'g') {
        if (key === 'd') { router.push('/dashboard'); e.preventDefault() }
        else if (key === 'j') { router.push('/jobs'); e.preventDefault() }
        else if (key === 'c') { router.push('/candidates'); e.preventDefault() }
        else if (key === 'i') { router.push('/interviews'); e.preventDefault() }
        else if (key === 'a') { router.push('/analytics'); e.preventDefault() }
        else if (key === 's') { router.push('/settings'); e.preventDefault() }
        else if (key === 'p') { router.push('/pipeline'); e.preventDefault() }
        setLastKeyPressed(null)
      } 
      // Sequence: "c" then "j" (Create Job)
      else if (lastKeyPressed === 'c' && key === 'j') {
        router.push('/jobs?create=true')
        e.preventDefault()
        setLastKeyPressed(null)
      } 
      // Sequence: "i" then "u" (Invite User)
      else if (lastKeyPressed === 'i' && key === 'u') {
        router.push('/settings/users?invite=true')
        e.preventDefault()
        setLastKeyPressed(null)
      } 
      // Sequence: "e" then "r" (Export Report)
      else if (lastKeyPressed === 'e' && key === 'r') {
        router.push('/analytics?export=true')
        e.preventDefault()
        setLastKeyPressed(null)
      } 
      // Capture first key of sequences
      else if (key === 'g' || key === 'c' || key === 'i' || key === 'e') {
        setLastKeyPressed(key)
        // Reset sequence after 1 second if inactive
        setTimeout(() => setLastKeyPressed(null), 1000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lastKeyPressed, router])

  // Debounced search query fetching
  useEffect(() => {
    const defaultSettings = [
      { name: 'Profile Settings', href: '/settings' },
      { name: 'Team Settings', href: '/settings/teams' },
      { name: 'User Directory & Invites', href: '/settings/users' },
      { name: 'Roles & Permissions Matrix', href: '/settings/roles' },
    ]

    if (query.trim().length < 2) {
      setResults({
        jobs: [],
        candidates: [],
        teams: [],
        settings: defaultSettings,
      })
      return
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true)
      const res = await searchGlobalAction(query)
      setLoading(false)
      if (res.success) {
        setResults(res.data)
        // Save to recent searches
        saveRecentSearch(query.trim())
        setRecentSearches(getRecentSearches())
      }
    }, 150)

    return () => clearTimeout(delayDebounce)
  }, [query])

  // Execute Command item click actions
  const runCommand = useCallback((action: () => void) => {
    action()
    setIsOpen(false)
    setQuery('')
  }, [])

  const handleSignOut = async () => {
    toast.loading('Signing out…', { id: 'signout' })
    await signOut({ callbackUrl: '/auth/login' })
  }

  const handleRecentSearchClick = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [])

  const showRecentSearches = query.trim().length < 2 && recentSearches.length > 0

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Portal>
        {/* Modal Overlay */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        
        {/* Palette Container */}
        <DialogPrimitive.Popup className="fixed top-[15%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-xl bg-popover text-popover-foreground shadow-2xl border border-foreground/10 outline-none overflow-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Command className="flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground">
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-2.5" aria-hidden="true" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Type a command or search settings, jobs, candidates..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search commands, jobs, candidates, and more"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Searching" />}
              <span className="text-[10px] text-muted-foreground bg-muted border px-1.5 py-0.5 rounded ml-2 font-mono uppercase" aria-hidden="true">
                ESC
              </span>
            </div>

            <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Group: Recent Searches */}
              {showRecentSearches && (
                <Command.Group heading="Recent Searches" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                  {recentSearches.map((recentQuery) => (
                    <Command.Item
                      key={`recent-${recentQuery}`}
                      value={`recent: ${recentQuery}`}
                      onSelect={() => handleRecentSearchClick(recentQuery)}
                      className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" aria-hidden="true" />
                      <span>{recentQuery}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Group: Actions */}
              <Command.Group heading="Quick Actions" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                <Command.Item
                  onSelect={() => runCommand(() => router.push('/jobs?create=true'))}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>Create New Job Posting</span>
                  </div>
                  <kbd className="hidden sm:inline-block text-[9px] text-muted-foreground bg-muted border px-1 rounded font-mono">
                    c + j
                  </kbd>
                </Command.Item>
                
                <Command.Item
                  onSelect={() => runCommand(() => router.push('/settings/users?invite=true'))}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>Invite Team Member</span>
                  </div>
                  <kbd className="hidden sm:inline-block text-[9px] text-muted-foreground bg-muted border px-1 rounded font-mono">
                    i + u
                  </kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => router.push('/analytics?export=true'))}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>Export Analytics Report</span>
                  </div>
                  <kbd className="hidden sm:inline-block text-[9px] text-muted-foreground bg-muted border px-1 rounded font-mono">
                    e + r
                  </kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => router.push('/help/shortcuts'))}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>Keyboard Shortcuts Guide</span>
                  </div>
                  <kbd className="hidden sm:inline-block text-[9px] text-muted-foreground bg-muted border px-1 rounded font-mono">
                    ?
                  </kbd>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(handleSignOut)}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-destructive/10 data-[selected=true]:text-destructive text-destructive/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Log Out of Workspace</span>
                  </div>
                </Command.Item>
              </Command.Group>

              {/* Group: Navigation */}
              <Command.Group heading="Navigate To" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                {[
                  { label: 'Dashboard', href: '/dashboard', key: 'g+d', icon: Award },
                  { label: 'Jobs', href: '/jobs', key: 'g+j', icon: Briefcase },
                  { label: 'Candidates', href: '/candidates', key: 'g+c', icon: Users },
                  { label: 'Interviews', href: '/interviews', key: 'g+i', icon: Calendar },
                  { label: 'Analytics', href: '/analytics', key: 'g+a', icon: Award },
                  { label: 'Pipeline', href: '/pipeline', key: 'g+p', icon: ArrowUpDown },
                  { label: 'Settings', href: '/settings', key: 'g+s', icon: Settings },
                ].map((nav) => (
                  <Command.Item
                    key={nav.href}
                    onSelect={() => runCommand(() => router.push(nav.href))}
                    className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <nav.icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      <span>{nav.label}</span>
                    </div>
                    <kbd className="hidden sm:inline-block text-[9px] text-muted-foreground bg-muted border px-1 rounded font-mono">
                      {nav.key}
                    </kbd>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Group: Settings */}
              {results.settings.length > 0 && (
                <Command.Group heading="Workspace Settings" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                  {results.settings.map((s) => (
                    <Command.Item
                      key={s.href}
                      onSelect={() => runCommand(() => router.push(s.href))}
                      className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" aria-hidden="true" />
                      <span>{s.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Group: Jobs */}
              {results.jobs.length > 0 && (
                <Command.Group heading="Matching Jobs" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                  {results.jobs.map((j) => (
                    <Command.Item
                      key={j.id}
                      onSelect={() => runCommand(() => router.push(`/jobs/${j.id}`))}
                      className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">{j.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase">{j.status}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Group: Candidates */}
              {results.candidates.length > 0 && (
                <Command.Group heading="Matching Candidates" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                  {results.candidates.map((c) => (
                    <Command.Item
                      key={c.id}
                      onSelect={() => runCommand(() => router.push(`/candidates/${c.id}`))}
                      className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{c.email}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Group: Teams */}
              {results.teams.length > 0 && (
                <Command.Group heading="Matching Teams" className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
                  {results.teams.map((t) => (
                    <Command.Item
                      key={t.id}
                      onSelect={() => runCommand(() => router.push(`/settings/teams?teamId=${t.id}`))}
                      className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs outline-none data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground transition-colors"
                    >
                      <Users className="h-3.5 w-3.5 mr-2 text-muted-foreground" aria-hidden="true" />
                      <span>{t.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between border-t p-2 text-[10px] text-muted-foreground bg-muted/20">
              <span className="flex items-center gap-1">
                Use <kbd className="border bg-background px-1 rounded font-mono">↑↓</kbd> to navigate, <kbd className="border bg-background px-1 rounded font-mono">Enter</kbd> to select.
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="border bg-background px-1 rounded font-mono">/</kbd> search ·
                <kbd className="border bg-background px-1 rounded font-mono">?</kbd> shortcuts
              </span>
            </div>
          </Command>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
