import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Building2, Calendar, Landmark, MapPin, Sparkles } from 'lucide-react'

interface JobDetailsProps {
  params: Promise<{ slug: string; jobId: string }>
}

export async function generateMetadata({ params }: JobDetailsProps): Promise<Metadata> {
  const { slug, jobId } = await params
  const job = await db.job.findFirst({
    where: { id: jobId, status: 'OPEN', deletedAt: null, organization: { slug } },
    select: { title: true, organization: { select: { name: true } } },
  })

  if (!job) return {}
  return {
    title: `${job.title} at ${job.organization.name} — HireTrack AI`,
    description: `Apply for ${job.title} at ${job.organization.name}. View job requirements, benefits, and details.`,
  }
}

export default async function JobDetailsPage({ params }: JobDetailsProps) {
  const { slug, jobId } = await params

  const job = await db.job.findFirst({
    where: {
      id: jobId,
      status: 'OPEN',
      deletedAt: null,
      organization: { slug },
    },
    include: {
      organization: true,
    },
  })

  if (!job) {
    notFound()
  }

  // Format currency/salary values
  const salaryString =
    job.salaryMin || job.salaryMax
      ? `${job.salaryMin ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()}` : ''}${
          job.salaryMax ? ` - ${job.salaryCurrency} ${job.salaryMax.toLocaleString()}` : ''
        }`
      : 'Competitive salary'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
        <Link href="/careers" className="hover:text-foreground transition-colors">
          Careers
        </Link>
        <span>/</span>
        <Link href={`/careers/${slug}`} className="hover:text-foreground transition-colors">
          {job.organization.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{job.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Job Details & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {job.organization.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {job.department ?? 'General'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location ?? 'Anywhere'}
              </span>
              {job.isRemote && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold bg-primary/10 text-primary border-transparent">
                    Remote
                  </Badge>
                </>
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Job Description</h2>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Requirements Section */}
          {job.requirements && (
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-foreground">Requirements & Qualifications</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Benefits Section */}
          {job.benefits && (
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-foreground">Benefits & Perks</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.benefits}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Action */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border bg-card rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-semibold">EMPLOYMENT TYPE</div>
              <div className="text-sm font-semibold capitalize">
                {job.employmentType.toLowerCase().replace('_', ' ')}
              </div>
            </div>

            {job.experienceLevel && (
              <div className="space-y-2 border-t pt-4">
                <div className="text-xs text-muted-foreground font-semibold">EXPERIENCE LEVEL</div>
                <div className="text-sm font-semibold">{job.experienceLevel}</div>
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <div className="text-xs text-muted-foreground font-semibold">SALARY RANGE</div>
              <div className="text-sm font-semibold">{salaryString}</div>
            </div>

            {job.publishedAt && (
              <div className="space-y-2 border-t pt-4">
                <div className="text-xs text-muted-foreground font-semibold">POSTED DATE</div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(job.publishedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <Link
                href={`/careers/${slug}/jobs/${job.id}/apply`}
                className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-foreground text-background text-sm font-semibold transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Apply for this job
              </Link>
            </div>
          </div>

          {/* Org details preview */}
          <div className="border bg-muted/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center font-bold text-xs text-muted-foreground">
                {job.organization.logo ? (
                  <img src={job.organization.logo} alt="" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  job.organization.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{job.organization.name}</h3>
                {job.organization.industry && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {job.organization.industry}
                  </p>
                )}
              </div>
            </div>
            {job.organization.size && (
              <p className="text-xs text-muted-foreground">
                Company size: <strong>{job.organization.size} employees</strong>
              </p>
            )}
            <Link
              href={`/careers/${slug}`}
              className="inline-flex items-center text-xs text-primary font-semibold hover:underline"
            >
              View all open roles at {job.organization.name} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
