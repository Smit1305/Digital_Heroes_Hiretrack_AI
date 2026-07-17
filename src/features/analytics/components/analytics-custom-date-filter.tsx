'use client'

import { Input } from '@/components/ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function AnalyticsCustomDateFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [fromVal, setFromVal] = useState(searchParams.get('dateFrom') || '')
  const [toVal, setToVal] = useState(searchParams.get('dateTo') || '')

  useEffect(() => {
    setFromVal(searchParams.get('dateFrom') || '')
    setToVal(searchParams.get('dateTo') || '')
  }, [searchParams])

  function handleApply() {
    const params = new URLSearchParams(searchParams.toString())
    if (fromVal && toVal) {
      params.set('dateFrom', fromVal)
      params.set('dateTo', toVal)
      // Delete predefined range to signal custom dates are active
      params.delete('range')
    } else {
      params.delete('dateFrom')
      params.delete('dateTo')
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleClear() {
    setFromVal('')
    setToVal('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('dateFrom')
    params.delete('dateTo')
    params.set('range', '30d')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const isCustomActive = !!(searchParams.get('dateFrom') && searchParams.get('dateTo'))

  return (
    <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/20 text-xs print-hide">
      <div className="flex items-center gap-1.5 px-1.5">
        <span className="text-muted-foreground uppercase font-bold text-[9px]">Custom Range:</span>
        <Input
          type="date"
          aria-label="Start date"
          value={fromVal}
          onChange={(e) => setFromVal(e.target.value)}
          className="h-7 w-32 text-xs py-0 px-1 border bg-background"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          aria-label="End date"
          value={toVal}
          onChange={(e) => setToVal(e.target.value)}
          className="h-7 w-32 text-xs py-0 px-1 border bg-background"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={isPending || !fromVal || !toVal}
        className="rounded bg-primary text-primary-foreground font-semibold px-2 py-1 text-xs shadow-sm hover:bg-primary/95 transition-all disabled:opacity-50"
      >
        Apply
      </button>
      {isCustomActive && (
        <button
          onClick={handleClear}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground font-semibold px-1.5 py-1 text-xs"
        >
          Clear
        </button>
      )}
    </div>
  )
}
