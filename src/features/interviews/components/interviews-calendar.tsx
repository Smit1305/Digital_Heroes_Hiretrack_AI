'use client'

import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { InterviewWithDetails } from '@/types/database'
import { TYPE_CONFIG } from './interview-type-badge'

interface InterviewsCalendarProps {
  interviews: InterviewWithDetails[]
}

export function InterviewsCalendar({ interviews }: InterviewsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Mon
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  function interviewsOnDay(day: Date) {
    return interviews.filter((iv) => isSameDay(new Date(iv.scheduledAt), day))
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs h-7 px-2"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7"
        role="grid"
        aria-label={`Calendar for ${format(currentMonth, 'MMMM yyyy')}`}
      >
        {calDays.map((day, idx) => {
          const dayInterviews = interviewsOnDay(day)
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <div
              key={idx}
              role="gridcell"
              aria-label={format(day, 'EEEE, MMMM d')}
              className={cn(
                'min-h-[80px] border-b border-r p-1.5 last:border-r-0',
                !inMonth && 'bg-muted/20',
                idx % 7 === 0 && 'border-l-0', // no left border on first col
                '[&:nth-child(7n)]:border-r-0'
              )}
            >
              {/* Day number */}
              <div className="mb-1 flex items-center justify-end">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    today
                      ? 'bg-foreground text-background'
                      : inMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/40'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Interview dots / badges */}
              <div className="space-y-0.5">
                {dayInterviews.slice(0, 3).map((iv) => {
                  const typeConfig = TYPE_CONFIG[iv.type]
                  return (
                    <div
                      key={iv.id}
                      className={cn(
                        'flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate',
                        typeConfig.className
                      )}
                      title={`${iv.candidate.firstName} ${iv.candidate.lastName} — ${format(new Date(iv.scheduledAt), 'h:mm a')}`}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="truncate font-medium">
                        {format(new Date(iv.scheduledAt), 'h:mm')}
                      </span>
                      <span className="truncate opacity-80">
                        {iv.candidate.firstName} {iv.candidate.lastName[0]}.
                      </span>
                    </div>
                  )
                })}
                {dayInterviews.length > 3 && (
                  <p className="text-[10px] text-muted-foreground pl-1">
                    +{dayInterviews.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t px-4 py-3">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('h-2.5 w-2.5 rounded-sm', config.className)} aria-hidden="true" />
            {config.label}
          </span>
        ))}
      </div>
    </div>
  )
}
