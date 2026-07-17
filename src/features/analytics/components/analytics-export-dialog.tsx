'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { AnalyticsRange } from '@/types/analytics'
import { Download, Printer, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsExportDialogProps {
  range: AnalyticsRange
  selectedJobIds?: string[]
}

export function AnalyticsExportDialog({ range, selectedJobIds }: AnalyticsExportDialogProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(searchParams.get('export') === 'true')
  const [isExporting, setIsExporting] = useState(false)
  
  // Form states
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [dateMode, setDateMode] = useState<'current' | 'custom'>('current')
  const [customDates, setCustomDates] = useState({ from: '', to: '' })
  
  const [scopes, setScopes] = useState({
    kpis: true,
    funnel: true,
    sources: true,
    topJobs: true,
  })

  useEffect(() => {
    if (searchParams.get('export') === 'true') {
      setIsOpen(true)
    }
  }, [searchParams])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && searchParams.get('export') === 'true') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('export')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  async function handleExport() {
    if (format === 'pdf') {
      setIsOpen(false)
      toast.success('Preparing print layout…')
      setTimeout(() => {
        window.print()
      }, 500)
      return
    }

    setIsExporting(true)
    try {
      const scopeParams = Object.entries(scopes)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key)
        .join(',')

      if (!scopeParams) {
        toast.error('Select at least one section to export.')
        setIsExporting(false)
        return
      }

      let url = `/api/analytics/export?format=${format}&range=${range}&scope=${scopeParams}`
      
      if (dateMode === 'custom' && customDates.from && customDates.to) {
        url += `&dateFrom=${customDates.from}&dateTo=${customDates.to}`
      }

      if (selectedJobIds && selectedJobIds.length > 0) {
        url += `&selectedRows=${selectedJobIds.join(',')}`
      }

      const res = await fetch(url)
      if (!res.ok) {
        const text = await res.text()
        toast.error(`Export failed: ${text}`)
        return
      }

      const blob = await res.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      
      const fileExt = format === 'excel' ? 'xls' : 'csv'
      link.download = `analytics-report-${range}-${new Date().toISOString().slice(0, 10)}.${fileExt}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
      
      toast.success(`Analytics report exported successfully in ${format.toUpperCase()} format.`)
      setIsOpen(false)
    } catch {
      toast.error('Export failed. Please check network connection.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleScopeToggle = (key: keyof typeof scopes) => {
    setScopes({ ...scopes, [key]: !scopes[key] })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 analytics-export-btn" />
        }
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export Report
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Export Report</DialogTitle>
          <DialogDescription>
            Customize your data metrics, date bounds, and report format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Format Select */}
          <div className="space-y-1.5">
            <label htmlFor="export-format" className="text-xs font-semibold text-foreground">File Format</label>
            <Select value={format} onValueChange={(val) => setFormat(val as any)}>
              <SelectTrigger id="export-format" className="bg-background">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv" className="text-xs">Comma Separated Values (CSV)</SelectItem>
                <SelectItem value="excel" className="text-xs">Microsoft Excel Spreadsheet (XML/XLS)</SelectItem>
                <SelectItem value="pdf" className="text-xs">Printable PDF Report (via Browser Print)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Bounds */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Date Range Filter</label>
            <Select value={dateMode} onValueChange={(val) => setDateMode(val as any)}>
              <SelectTrigger className="bg-background text-xs">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current" className="text-xs">Dashboard default range</SelectItem>
                <SelectItem value="custom" className="text-xs">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>

            {dateMode === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">From</span>
                  <Input 
                    type="date" 
                    value={customDates.from} 
                    onChange={(e) => setCustomDates({ ...customDates, from: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">To</span>
                  <Input 
                    type="date" 
                    value={customDates.to} 
                    onChange={(e) => setCustomDates({ ...customDates, to: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scope selection checkboxes */}
          {format !== 'pdf' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Include Metrics Sections</label>
              <div className="grid grid-cols-2 gap-3 border rounded-lg p-3 bg-muted/10">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="scope-kpi" 
                    checked={scopes.kpis} 
                    onCheckedChange={() => handleScopeToggle('kpis')}
                  />
                  <label htmlFor="scope-kpi" className="text-xs select-none cursor-pointer">KPI Overview</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="scope-funnel" 
                    checked={scopes.funnel} 
                    onCheckedChange={() => handleScopeToggle('funnel')}
                  />
                  <label htmlFor="scope-funnel" className="text-xs select-none cursor-pointer">Hiring Funnel</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="scope-sources" 
                    checked={scopes.sources} 
                    onCheckedChange={() => handleScopeToggle('sources')}
                  />
                  <label htmlFor="scope-sources" className="text-xs select-none cursor-pointer">Sources Breakdown</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="scope-jobs" 
                    checked={scopes.topJobs} 
                    onCheckedChange={() => handleScopeToggle('topJobs')}
                  />
                  <label htmlFor="scope-jobs" className="text-xs select-none cursor-pointer">Top Performing Jobs</label>
                </div>
              </div>
            </div>
          )}

          {format === 'pdf' && (
            <p className="text-[11px] text-muted-foreground italic bg-primary/5 p-2.5 rounded-lg border border-primary/20">
              * Choosing PDF will hide navigation elements and open your browser's print utility immediately. Select "Save as PDF" under destination options in your print dialog.
            </p>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Exporting Report
              </>
            ) : format === 'pdf' ? (
              <>
                <Printer className="h-4 w-4 mr-1.5" />
                Print PDF
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1.5" />
                Download Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
