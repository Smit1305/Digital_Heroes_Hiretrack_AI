import { JsonLd } from '@/components/json-ld'
import {
  Building2,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

export const metadata: Metadata = {
  title: 'About Us — HireTrack AI',
  description:
    'Learn about HireTrack AI — our mission to simplify modern recruitment, empower collaborative hiring teams, and make applicant tracking seamless.',
  alternates: { canonical: `${APP_URL}/about` },
  openGraph: {
    title: 'About Us — HireTrack AI',
    description:
      'Discover how HireTrack AI empowers modern organizations to hire faster, smarter, and together.',
    url: `${APP_URL}/about`,
  },
}

const VALUES = [
  {
    icon: Target,
    title: 'Mission-Driven Sourcing',
    description:
      'We believe hiring shouldn’t be fragmented. Our platform brings candidates, recruiters, and managers into one clear workflow.',
  },
  {
    icon: Users,
    title: 'Collaboration First',
    description:
      'Hiring is a team sport. HireTrack AI provides role-based transparency, instant feedback loops, and interview scoring.',
  },
  {
    icon: Zap,
    title: 'Fast & Data-Informed',
    description:
      'Eliminate manual admin work. Optimistic UI, real-time analytics, and automated candidate tracking keep teams moving fast.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-Grade Security',
    description:
      'Row-level data isolation, strict RBAC, audit logging, and modern security standards protect your company’s talent pipeline.',
  },
  {
    icon: HeartHandshake,
    title: 'Candidate-Centric Experience',
    description:
      'Respect candidate time and trust with clear status tracking, transparent application flows, and reliable communication.',
  },
  {
    icon: Sparkles,
    title: 'Modern Tech Stack',
    description:
      'Built on Next.js 15, TypeScript, PostgreSQL, and Tailwind CSS for speed, accessibility, and high reliability.',
  },
]

const STATS = [
  { stat: '10,000+', label: 'Candidates Processed' },
  { stat: '500+', label: 'Active Job Listings' },
  { stat: '99.9%', label: 'Uptime Reliability' },
  { stat: '8', label: 'Kanban Pipeline Stages' },
]

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About HireTrack AI',
    url: `${APP_URL}/about`,
    description:
      'Learn about HireTrack AI — modern applicant tracking system for high-performing hiring teams.',
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            Modern Recruiting Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Reimagining how modern teams <span className="text-muted-foreground">hire top talent</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            HireTrack AI was built with a simple goal: replace complex, bloated recruiting tools with a sleek, collaborative, and incredibly fast applicant tracking platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/auth/select-account"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get Started Free
            </Link>
            <Link
              href="/features"
              className="inline-flex h-11 items-center justify-center rounded-xl border px-6 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-b bg-muted/20" aria-label="Key statistics">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <dl className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {STATS.map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-card border shadow-xs">
                <dt className="text-3xl font-extrabold tracking-tight">{item.stat}</dt>
                <dd className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-label="Our values">
        <div className="mb-12 text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Our Core Principles</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Everything we build is guided by a commitment to speed, clarity, and seamless team collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow duration-200"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </article>
            )}
          )}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-t border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Designed for Employers and Candidates Alike
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Whether you are a recruiter setting up Kanban pipelines, a hiring manager reviewing interview scorecards, or a job applicant tracking your status — HireTrack AI delivers a seamless experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
            <div className="rounded-xl border bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                For Hiring Teams
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Post roles, manage candidate pipelines, review scorecards, and collaborate in real-time.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                For Job Candidates
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apply easily, manage candidate profiles, track active interview stages, and review offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">Start hiring smarter today</h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base">
          Join modern teams using HireTrack AI to build high-performing teams.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/auth/select-account"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-8 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </>
  )
}
