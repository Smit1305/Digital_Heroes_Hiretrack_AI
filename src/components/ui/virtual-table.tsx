'use client'

import { cn } from '@/lib/utils'
import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'

interface VirtualTableProps<T> {
  /** Array of data items */
  data: T[]
  /** Estimated row height in pixels */
  rowHeight?: number
  /** Visible container height in pixels */
  containerHeight?: number
  /** Number of extra rows to render above/below viewport */
  overscan?: number
  /** Render function for each row */
  renderRow: (item: T, index: number) => ReactNode
  /** Optional header */
  header?: ReactNode
  /** Optional empty state */
  emptyState?: ReactNode
  /** Container className */
  className?: string
  /** Accessible label */
  'aria-label'?: string
}

/**
 * Lightweight virtualized table using IntersectionObserver
 * for efficient rendering of large datasets.
 * Only renders visible rows + overscan buffer.
 */
export function VirtualTable<T>({
  data,
  rowHeight = 48,
  containerHeight = 600,
  overscan = 5,
  renderRow,
  header,
  emptyState,
  className,
  'aria-label': ariaLabel,
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = data.length * rowHeight
  const visibleCount = Math.ceil(containerHeight / rowHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(data.length, startIndex + visibleCount + 2 * overscan)
  const offsetY = startIndex * rowHeight

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  const visibleItems = data.slice(startIndex, endIndex)

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ maxHeight: containerHeight }}
      role="table"
      aria-label={ariaLabel}
      aria-rowcount={data.length}
    >
      {header}
      <div
        style={{ height: totalHeight, position: 'relative' }}
        role="rowgroup"
      >
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div
              key={startIndex + i}
              style={{ height: rowHeight }}
              role="row"
              aria-rowindex={startIndex + i + 1}
            >
              {renderRow(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
