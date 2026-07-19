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
import { CandidateStatus } from '@/types/enums'

const STATUS_OPTIONS: { value: CandidateStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
]

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'firstName:asc', label: 'Name A–Z' },
  { value: 'firstName:desc', label: 'Name Z–A' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
]

interface CandidatesFiltersProps {
  totalCount: number
  sources: string[]
}

export function CandidatesFilters({ totalCount, sources }: CandidatesFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('query') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search (300 ms)
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
  const currentSource = searchParams.get('source') ?? 'ALL'
  const currentSort = `${searchParams.get('sortBy') ?? 'createdAt'}:${searchParams.get('sortOrder') ?? 'desc'}`
  const activeFilterCount = [
    searchParams.get('query'),
    searchParams.get('status'),
    searchParams.get('source'),
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search candidates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            aria-label="Search candidates by name, email or location"
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

        {/* Filter toggle */}
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

        {/* Sort */}
        <div className="ml-auto">
          <Select value={currentSort} onValueChange={(v) => v && updateSort(v)}>
            <SelectTrigger className="w-44 h-8 text-xs" aria-label="Sort candidates">
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

      {/* Filter row */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
          <Select value={currentStatus} onValueChange={(v) => updateParam('status', v)}>
            <SelectTrigger className="h-7 w-36 text-xs" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {sources.length > 0 && (
            <Select value={currentSource} onValueChange={(v) => updateParam('source', v)}>
              <SelectTrigger className="h-7 w-40 text-xs" aria-label="Filter by source">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
          ? 'No candidates found'
          : `${totalCount} candidate${totalCount !== 1 ? 's' : ''} found`}
      </p>
    </div>
  )
}
