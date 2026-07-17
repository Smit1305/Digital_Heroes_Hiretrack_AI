'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface JobsPaginationProps {
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function JobsPagination({
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: JobsPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  // Compute visible page numbers (window of 5)
  const pageNumbers: number[] = []
  const delta = 2
  const start = Math.max(1, page - delta)
  const end = Math.min(totalPages, page + delta)
  for (let i = start; i <= end; i++) pageNumbers.push(i)

  return (
    <nav
      className="flex items-center justify-center gap-1 py-4"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => navigate(page - 1)}
        disabled={!hasPrevPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>

      {start > 1 && (
        <>
          <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
            1
          </Button>
          {start > 2 && <span className="px-1 text-muted-foreground text-sm">…</span>}
        </>
      )}

      {pageNumbers.map((n) => (
        <Button
          key={n}
          variant={n === page ? 'default' : 'outline'}
          size="icon-sm"
          onClick={() => navigate(n)}
          aria-label={`Page ${n}`}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-muted-foreground text-sm">…</span>
          )}
          <Button variant="outline" size="icon-sm" onClick={() => navigate(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => navigate(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
