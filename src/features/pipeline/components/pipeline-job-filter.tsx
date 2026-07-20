'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { PipelineJob } from '@/server/actions/pipeline'
import { Briefcase } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PipelineJobFilterProps {
  jobs: PipelineJob[]
  selectedJobId?: string
}

export function PipelineJobFilter({ jobs, selectedJobId }: PipelineJobFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'ALL') {
      params.delete('jobId')
    } else {
      params.set('jobId', value)
    }
    router.push(`${pathname}?${params.toString()}`)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <Select value={selectedJobId ?? 'ALL'} onValueChange={handleChange}>
        <SelectTrigger
          className="h-8 w-64 text-sm"
          aria-label="Filter pipeline by job"
        >
          <SelectValue placeholder="All jobs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All jobs</SelectItem>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              {job.title}
              {job.department ? ` · ${job.department}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
