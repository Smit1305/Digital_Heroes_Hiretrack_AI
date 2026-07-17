import { JsonLd } from '@/components/json-ld'
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Download,
  Kanban,
  Lock,
  Search,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore every feature of HireTrack AI — job management, candidate tracking, Kanban pipeline, interview scheduling, analytics dashboards, RBAC, CSV export, and more.',
  alternates: { canonical: `${APP_URL}/features` },
  openGraph: {
    title: 'Features — HireTrack AI',
    description:
      'Everything your hiring team needs: jobs, candidates, pipeline, interviews, and analytics.',
    url: `${APP_URL}/features`,
    images: [{ url: `${APP_URL}/og-features.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features — HireTrack AI',
    description: 'Everything your hiring team needs in one ATS platform.',
  },
}

interface Feature {
  icon: React.ElementType
  title: string
  description: string
  bullets: string[]
}

const FEATURES: Feature[] = [
  {
    icon: Briefcase,
    title: 'Job Management',
    description: 'Create and manage job listings with all the detail your team needs.',
    bullets: [
      'Rich job descriptions with requirements and benefits',
      'Employment type, salary range, and remote toggle',
      'Draft → Open → Paused → Closed → Archived lifecycle',
      'Duplicate jobs with one click',
      'Hiring manager assignment per job',
    ],
  },
  {
    icon: Users,
    title: 'Candidate Management',
    description: 'Full candidate profiles from first contact to offer.',
    bullets: [
      'Resume upload (PDF, DOC, DOCX) with preview',
      'Skills tagging, experience, education, and source tracking',
      'Activity timeline showing every stage change and note',
      'LinkedIn, portfolio, and website links',
      'Status management: Active, Inactive, Blacklisted',
    ],
  },
  {
    icon: Kanban,
    title: 'Kanban Pipeline',
    description: 'Drag-and-drop hiring pipeline that keeps your team aligned.',
    bullets: [
      '8 fixed stages: Applied → Screening → … → Hired / Rejected',
      'Optimistic UI with instant feedback and undo',
      'Per-job filtering to focus on a single role',
      'Activity log on every card move',
      'Colour-coded columns with internal scroll',
    ],
  },
  {
    icon: Calendar,
    title: 'Interview Management',
    description: 'Schedule, track, and collect feedback on every interview.',
    bullets: [
      'Phone, Video, On-site, Technical, HR, and Panel types',
      'Monthly calendar view with type-coloured dots',
      'Reschedule, cancel, or mark no-show actions',
      'Star-rating feedback forms (1–5) with notes',
      'Past-due overdue warnings in red',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Data-driven insights for continuous hiring improvement.',
    bullets: [
      '8 KPI cards: conversion rate, time-to-hire, completion rate',
      'Stage conversion funnel with colour-coded drop-off rates',
      'Monthly hiring trends line chart (up to 12 months)',
      'Candidate source breakdown donut chart',
      'Top performing jobs and recruiter activity tables',
    ],
  },
  {
    icon: Search,
    title: 'Search & Filtering',
    description: 'Find anything instantly with server-side search and rich filters.',
    bullets: [
      '300 ms debounced full-text search on every list',
      'Multi-filter support: status, type, department, date',
      'URL-state sync — share and bookmark filtered views',
      'Sort by date, name, stage, and more',
      'Cursor-based pagination with windowed page buttons',
    ],
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Granular permissions enforced server-side on every action.',
    bullets: [
      '5 roles: Super Admin, Recruiter, Hiring Manager, Interviewer, Viewer',
      'Permission checks in every server action — never trust the client',
      'Row-level org isolation: users can only see their org`s data',
      'Audit log records every create, update, and delete',
      'Activity log tracks who moved every candidate and when',
    ],
  },
  {
    icon: Lock,
    title: 'Authentication & Security',
    description: 'Production-grade auth with multiple providers and hardened sessions.',
    bullets: [
      'Email + password, Google OAuth, and GitHub OAuth',
      'Email verification, forgot password, and reset flows',
      'bcrypt cost ≥ 12, httpOnly cookies, SameSite=Lax',
      'CSRF protection, rate limiting, and CSP headers',
      'Session rotation on every login',
    ],
  },
  {
    icon: Download,
    title: 'Export & Integrations',
    description: 'Get your data out whenever you need it.',
    bullets: [
      'CSV export for candidates, jobs, and analytics',
      'Analytics export with KPIs, funnel, sources, and top jobs',
      'All exports authenticated and RBAC-gated',
      'Structured data download for large datasets',
      'Open architecture — REST-friendly server actions',
    ],
  },
  {
    icon: Zap,
    title: 'Performance & Accessibility',
    description: 'Fast, accessible, and responsive on every device.',
    bullets: [
      'Next.js 15 App Router with React Server Components',
      'Skeleton loaders and Suspense on every section',
      'WCAG AA: semantic HTML, ARIA labels, focus rings',
      'Mobile-first responsive design with Tailwind CSS',
      'Dark mode with next-themes and CSS custom properties',
    ],
  },
  {
    icon: CheckCircle2,
    title: 'Developer Experience',
    description: 'Built for maintainability and open-source contribution.',
    bullets: [
      'TypeScript strict mode throughout — no any types',
      'Zod validation on every form, API, and env variable',
      'ESLint + Prettier + Husky + lint-staged',
      'Vitest unit tests and Playwright E2E tests',
      'GitHub Actions CI: type-check → lint → test → build',
    ],
  },
]

export default function FeaturesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'HireTrack AI Features',
    url: `${APP_URL}/features`,
    description:
      'Complete list of features in HireTrack AI — the modern applicant tracking system.',
    isPartOf: { '@type': 'WebSite', name: 'HireTrack AI', url: APP_URL },
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Every feature your team needs
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
            From sourcing to signing — HireTrack AI covers the full hiring lifecycle with no
            compromises on quality, security, or developer experience.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center rounded-lg bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get started free
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-10 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
        aria-label="Feature details"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <ul className="mt-4 space-y-1.5" aria-label={`${feature.title} bullets`}>
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-foreground/60"
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to put these features to work?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign up free — no credit card required. Demo account available instantly.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-foreground px-8 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create free account
          </Link>
        </div>
      </section>
    </>
  )
}
