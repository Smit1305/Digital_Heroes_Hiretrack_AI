'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase, Building2, MapPin, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface JobListItem {
  id: string
  title: string
  department: string | null
  location: string | null
  employmentType: string
  isRemote: boolean
  organization: {
    name: string
    slug: string
    logo: string | null
  }
}

interface CareersClientProps {
  initialJobs: JobListItem[]
  departments: string[]
  locations: string[]
  types: string[]
}

export function CareersClient({ initialJobs, departments, locations, types }: CareersClientProps) {
  const [query, setQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [selectedLoc, setSelectedLoc] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')

  const filteredJobs = initialJobs.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.organization.name.toLowerCase().includes(query.toLowerCase()) ||
      (job.department && job.department.toLowerCase().includes(query.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(query.toLowerCase()))

    const matchesDept = selectedDept === 'ALL' || job.department === selectedDept
    const matchesLoc = selectedLoc === 'ALL' || job.location === selectedLoc
    const matchesType = selectedType === 'ALL' || job.employmentType === selectedType

    return matchesQuery && matchesDept && matchesLoc && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Controls panel */}
      <div className="flex flex-col gap-4 p-4 border bg-card/60 backdrop-blur-sm rounded-xl shadow-sm sm:flex-row sm:items-center sm:gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles, companies, keywords..."
            className="pl-9 bg-background"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Select value={selectedDept} onValueChange={(val) => val && setSelectedDept(val)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLoc} onValueChange={(val) => val && setSelectedLoc(val)}>
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(val) => val && setSelectedType(val)}>
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
              <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base text-foreground">No matches found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We couldn&apos;t find any open positions matching your filters. Try clearing your search or refining your filters.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group relative border bg-card hover:bg-muted/10 hover:border-foreground/20 rounded-xl p-5 transition-all duration-200 shadow-sm flex flex-col justify-between sm:flex-row sm:items-center gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/careers/${job.organization.slug}`}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Building2 className="h-3 w-3" />
                    {job.organization.name}
                  </Link>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {job.employmentType.toLowerCase().replace('_', ' ')}
                  </span>
                  {job.isRemote && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold bg-primary/10 text-primary border-transparent">
                        Remote
                      </Badge>
                    </>
                  )}
                </div>
                <h2 className="text-base font-semibold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                  <Link href={`/careers/${job.organization.slug}/jobs/${job.id}`}>
                    {job.title}
                  </Link>
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {job.department ?? 'General'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location ?? 'Anywhere'}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href={`/careers/${job.organization.slug}/jobs/${job.id}`}
                  className="inline-flex h-8 items-center justify-center rounded-lg border bg-background px-4 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  View Job
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
