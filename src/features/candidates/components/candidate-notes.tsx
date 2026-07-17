'use client'

import { format } from 'date-fns'
import { Loader2, MessageSquare, Pin, Send } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { addCandidateNoteAction, getCandidateNotesAction, type CandidateNote } from '@/server/actions/candidates'

interface CandidateNotesProps {
  candidateId: string
  initialNotes: CandidateNote[]
}

export function CandidateNotes({ candidateId, initialNotes }: CandidateNotesProps) {
  const [notes, setNotes] = useState<CandidateNote[]>(initialNotes)
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      const result = await addCandidateNoteAction(candidateId, content)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Note added.')
      setContent('')
      // Refresh notes list
      const refreshed = await getCandidateNotesAction(candidateId)
      if (refreshed.success) setNotes(refreshed.data)
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Notes
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add note form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Add a note about this candidate..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none"
            aria-label="Note content"
            disabled={isPending}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isPending}
            >
              {isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              )}
              Add note
            </Button>
          </div>
        </form>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <MessageSquare className="h-7 w-7 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">No notes yet. Add the first one above.</p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Candidate notes">
            {notes.map((note) => {
              const initials = (note.author.name ?? note.author.email ?? 'U')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <li
                  key={note.id}
                  className={cn(
                    'flex gap-2.5 rounded-lg p-3 text-sm',
                    note.isPinned
                      ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30'
                      : 'bg-muted/40'
                  )}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
                    <AvatarFallback className="text-[9px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-medium">
                        {note.author.name ?? note.author.email}
                      </span>
                      {note.isPinned && (
                        <Pin className="h-3 w-3 text-amber-500" aria-label="Pinned note" />
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">
                        {format(new Date(note.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {note.content}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
