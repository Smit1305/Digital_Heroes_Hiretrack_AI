'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { InterviewStatus, InterviewType } from '@prisma/client'
import { STATUS_CONFIG, TYPE_CONFIG } from './interview-type-badge'

const SORT_OPTIONS = [
  { value: 'scheduledAt:asc', label: 'Soonest first' },
  { value: 'scheduledAt:desc', label: 'Latest first' },
  { value: 'createdAt:desc', label: 'Recently scheduled' },
]

interface InterviewsFiltersProps {
  totalCount: number
}

export function InterviewsFilters({ totalCount }: InterviewsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('query') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const currentQuery = searchParams.get('query') ?? ''
    if (search === currentQuery) {
      return
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('query', search)
      } else {
        params.delete('query')
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, pathname, router, searchParams])

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'ALL') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const updateSort = useCallback(
    (value: string) => {
      const [sortBy, sortOrder] = value.split(':')
      const params = new URLSearchParams(searchParams.toString())
      if (sortBy) params.set('sortBy', sortBy)
      if (sortOrder) params.set('sortOrder', sortOrder)
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const clearAll = useCallback(() => {
    setSearch('')
    router.push(pathname)
  }, [pathname, router])

  const currentStatus = searchParams.get('status') ?? 'ALL'
  const currentType = searchParams.get('type') ?? 'ALL'
  const currentSort = `${searchParams.get('sortBy') ?? 'scheduledAt'}:${searchParams.get('sortOrder') ?? 'asc'}`
  const activeFilterCount = [
    searchParams.get('query'),
    searchParams.get('status'),
    searchParams.get('type'),
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by candidate or job…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            aria-label="Search interviews"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(activeFilterCount > 0 && 'border-foreground/40')}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[10px] bg-foreground text-background">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <div className="ml-auto">
          <Select value={currentSort} onValueChange={(v) => v && updateSort(v)}>
            <SelectTrigger className="w-44 h-8 text-xs" aria-label="Sort interviews">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
          <Select value={currentStatus} onValueChange={(v) => updateParam('status', v)}>
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {Object.values(InterviewStatus).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentType} onValueChange={(v) => updateParam('type', v)}>
            <SelectTrigger className="h-7 w-36 text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {Object.values(InterviewType).map((t) => (
                <SelectItem key={t} value={t}>{TYPE_CONFIG[t].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
              <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Clear all
            </Button>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
        {totalCount === 0
          ? 'No interviews found'
          : `${totalCount} interview${totalCount !== 1 ? 's' : ''} found`}
      </p>
    </div>
  )
}
