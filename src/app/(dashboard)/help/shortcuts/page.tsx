import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Keyboard } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Keyboard Shortcuts — HireTrack AI',
  description: 'Master HireTrack AI with direct keyboard shortcuts and power-user commands.',
}

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutSection {
  title: string
  shortcuts: ShortcutItem[]
}

export default function ShortcutsHelpPage() {
  const sections: ShortcutSection[] = [
    {
      title: 'Global Commands',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Open command center / Global search overlay' },
        { keys: ['Cmd', 'K'], description: 'Open command center (macOS)' },
        { keys: ['/'], description: 'Open command center / Focus search' },
        { keys: ['?'], description: 'Open this keyboard shortcuts guide' },
        { keys: ['Esc'], description: 'Close command center, overlays, or modal dialogs' },
      ],
    },
    {
      title: 'Quick Go-To Sequences',
      shortcuts: [
        { keys: ['g', 'd'], description: 'Go to Recruiter Dashboard' },
        { keys: ['g', 'j'], description: 'Go to Jobs Management directory' },
        { keys: ['g', 'c'], description: 'Go to Candidate Database' },
        { keys: ['g', 'i'], description: 'Go to Scheduled Interviews timeline' },
        { keys: ['g', 'a'], description: 'Go to Analytics & Funnel performance' },
        { keys: ['g', 'p'], description: 'Go to Pipeline / Kanban board' },
        { keys: ['g', 's'], description: 'Go to Organization Profile Settings' },
      ],
    },
    {
      title: 'Action Shortcuts',
      shortcuts: [
        { keys: ['c', 'j'], description: 'Instantly launch Create Job Posting dialog' },
        { keys: ['i', 'u'], description: 'Instantly launch Invite Workspace Member dialog' },
        { keys: ['e', 'r'], description: 'Instantly launch Export Report config dialog' },
      ],
    },
    {
      title: 'Table Navigation',
      shortcuts: [
        { keys: ['↑', '↓'], description: 'Move selection up/down in command palette results' },
        { keys: ['Enter'], description: 'Select highlighted item / Submit form' },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Keyboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Keyboard Shortcuts Guide</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optimize your pipeline workflow. Press sequence keys one after another.
          </p>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="bg-muted/10 border-border/80 flex flex-col h-full">
            <CardHeader className="pb-3 border-b bg-muted/5">
              <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider leading-none">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-3">
              {section.shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-xs border-b border-muted last:border-0 pb-2.5 last:pb-0">
                  <span className="text-muted-foreground leading-normal shrink-0 max-w-[200px]">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-end select-none">
                    {shortcut.keys.map((key, kIndex) => (
                      <span key={kIndex} className="flex items-center">
                        <kbd className="h-6 min-w-6 inline-flex items-center justify-center px-1.5 rounded border bg-background text-[10px] font-mono shadow-sm uppercase font-semibold text-foreground">
                          {key}
                        </kbd>
                        {kIndex < shortcut.keys.length - 1 && (
                          <span className="text-[10px] text-muted-foreground/60 mx-0.5 font-mono">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Alert */}
      <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
        <h4 className="font-semibold text-foreground uppercase text-[9px] tracking-wider">Hotkey Guidelines</h4>
        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
          <li>Key sequences (like <kbd className="border bg-background px-1.5 py-0.5 rounded text-[10px] font-mono">G</kbd> then <kbd className="border bg-background px-1.5 py-0.5 rounded text-[10px] font-mono">D</kbd>) should be pressed in rapid succession (within 1 second of each other).</li>
          <li>Keyboard hotkeys are automatically bypassed when your focus is inside a form input element, text area field, or content-editable wrapper to prevent accidental triggers while typing.</li>
          <li>Press <kbd className="border bg-background px-1.5 py-0.5 rounded text-[10px] font-mono">/</kbd> anywhere to quickly open the global search command center.</li>
          <li>Press <kbd className="border bg-background px-1.5 py-0.5 rounded text-[10px] font-mono">?</kbd> to return to this page at any time.</li>
        </ul>
      </div>
    </div>
  )
}
