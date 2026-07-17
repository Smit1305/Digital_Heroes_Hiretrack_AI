'use client'

import { Button } from '@/components/ui/button'
import type { AnalyticsRange } from '@/types/analytics'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AnalyticsExportButtonProps {
  range: AnalyticsRange
}

export function AnalyticsExportButton({ range }: AnalyticsExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/analytics/export?range=${range}`)
      if (!res.ok) {
        const text = await res.text()
        toast.error(`Export failed: ${text}`)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Analytics exported as CSV.')
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      aria-label="Export analytics as CSV"
    >
      {isExporting ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
      )}
      Export CSV
    </Button>
  )
}
