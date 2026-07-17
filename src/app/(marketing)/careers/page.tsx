import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CareersClient } from '@/app/(marketing)/careers/careers-client'

export const metadata: Metadata = {
  title: 'Public Careers Portal — HireTrack AI',
  description: 'Browse open positions across organizations and join high-performing teams.',
}

export default async function CareersPage() {
  const jobs = await db.job.findMany({
    where: {
      status: 'OPEN',
      deletedAt: null,
    },
    include: {
      organization: {
        select: {
          name: true,
          slug: true,
          logo: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group departments, locations, types for filter options
  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean))) as string[]
  const locations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))) as string[]
  const types = Array.from(new Set(jobs.map((j) => j.employmentType).filter(Boolean))) as string[]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Find your next opportunity
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Explore open positions at fast-growing companies and apply online in seconds.
        </p>
      </div>

      <CareersClient
        initialJobs={jobs.map((j) => ({
          id: j.id,
          title: j.title,
          department: j.department,
          location: j.location,
          employmentType: j.employmentType,
          isRemote: j.isRemote,
          organization: j.organization,
        }))}
        departments={departments}
        locations={locations}
        types={types}
      />
    </div>
  )
}
