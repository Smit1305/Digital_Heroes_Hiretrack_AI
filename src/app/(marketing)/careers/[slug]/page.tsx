import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CareersClient } from '@/app/(marketing)/careers/careers-client'
import { Building2, Globe, Landmark, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface OrgPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: OrgPageProps): Promise<Metadata> {
  const { slug } = await params
  const org = await db.organization.findUnique({
    where: { slug },
    select: { name: true },
  })

  if (!org) return {}
  return {
    title: `Careers at ${org.name} — HireTrack AI`,
    description: `Explore open job opportunities and careers at ${org.name}.`,
  }
}

export default async function OrgCareersPage({ params }: OrgPageProps) {
  const { slug } = await params
  const org = await db.organization.findUnique({
    where: { slug },
  })

  if (!org) {
    notFound()
  }

  const jobs = await db.job.findMany({
    where: {
      organizationId: org.id,
      status: 'OPEN',
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean))) as string[]
  const locations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))) as string[]
  const types = Array.from(new Set(jobs.map((j) => j.employmentType).filter(Boolean))) as string[]

  const initials = org.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-10">
      {/* Org Header card */}
      <div className="border bg-card rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Logo/Initials */}
        <div className="w-16 h-16 rounded-2xl bg-muted border flex items-center justify-center font-bold text-xl text-muted-foreground flex-shrink-0">
          {org.logo ? (
            <img src={org.logo} alt={`${org.name} logo`} className="w-full h-full object-contain rounded-2xl" />
          ) : (
            initials
          )}
        </div>

        {/* Name and Meta */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{org.name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full border bg-muted font-semibold text-muted-foreground">
              Careers Workspace
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {org.industry && (
              <span className="flex items-center gap-1">
                <Landmark className="h-3.5 w-3.5" />
                {org.industry}
              </span>
            )}
            {org.size && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {org.size} employees
              </span>
            )}
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Link
            href="/careers"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← View all companies
          </Link>
        </div>
      </div>

      {/* Jobs Client list */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Open Positions ({jobs.length})</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Explore open roles and apply below.</p>
        </div>

        <CareersClient
          initialJobs={jobs.map((j) => ({
            id: j.id,
            title: j.title,
            department: j.department,
            location: j.location,
            employmentType: j.employmentType,
            isRemote: j.isRemote,
            organization: { name: org.name, slug: org.slug, logo: org.logo },
          }))}
          departments={departments}
          locations={locations}
          types={types}
        />
      </div>
    </div>
  )
}
