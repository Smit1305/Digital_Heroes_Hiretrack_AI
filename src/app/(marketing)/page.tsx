import { JsonLd } from '@/components/json-ld'
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Kanban,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

export const metadata: Metadata = {
  title: 'HireTrack AI — Modern Applicant Tracking System',
  description:
    'HireTrack AI is a collaborative ATS for modern hiring teams. Track candidates, schedule interviews, manage your pipeline, and make data-driven hiring decisions.',
  keywords: [
    'ATS',
    'applicant tracking system',
    'recruiting software',
    'hiring platform',
    'HR software',
    'candidate management',
    'interview scheduling',
    'hiring pipeline',
  ],
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: 'HireTrack AI — Modern Applicant Tracking System',
    description:
      'Collaborative ATS for modern hiring teams. Track candidates, schedule interviews, and make better hiring decisions.',
    siteName: 'HireTrack AI',
    images: [
      {
        url: `${APP_URL}/og-home.png`,
        width: 1200,
        height: 630,
        alt: 'HireTrack AI — Modern Applicant Tracking System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireTrack AI — Modern Applicant Tracking System',
    description: 'Collaborative ATS for modern hiring teams.',
    images: [`${APP_URL}/og-home.png`],
  },
}

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Job Management',
    description:
      'Create, publish, and manage job listings with rich descriptions, salary ranges, and employment types.',
  },
  {
    icon: Users,
    title: 'Candidate Tracking',
    description:
      'Full candidate profiles with resume uploads, skills, notes, activity timelines, and status management.',
  },
  {
    icon: Kanban,
    title: 'Kanban Pipeline',
    description:
      'Drag-and-drop hiring pipeline with 8 stages, optimistic updates, and full undo support.',
  },
  {
    icon: Calendar,
    title: 'Interview Scheduling',
    description:
      'Schedule, reschedule, and track interviews with calendar view, feedback forms, and star ratings.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Deep hiring insights including funnel metrics, stage conversion rates, source breakdown, and team performance.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Granular RBAC with five roles: Super Admin, Recruiter, Hiring Manager, Interviewer, and Viewer.',
  },
  {
    icon: Zap,
    title: 'Real-Time Collaboration',
    description:
      'Activity logs, audit trails, and notifications keep your entire hiring team in sync.',
  },
  {
    icon: CheckCircle2,
    title: 'Production-Ready',
    description:
      'TypeScript strict mode, Zod validation, bcrypt auth, CSRF protection, and row-level security throughout.',
  },
]

const SOCIAL_PROOF = [
  { stat: '10k+', label: 'Candidates tracked' },
  { stat: '500+', label: 'Jobs published' },
  { stat: '8', label: 'Pipeline stages' },
  { stat: '5', label: 'Access roles' },
]

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HireTrack AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: APP_URL,
    description:
      'A collaborative applicant tracking system for modern hiring teams.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'HireTrack AI',
      url: APP_URL,
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b bg-gradient-to-b from-muted/40 to-background"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Open source · Production ready
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Hire smarter,
            <br />
            <span className="text-muted-foreground">together.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            HireTrack AI is a collaborative applicant tracking system built for
            modern hiring teams. From job posting to offer letter — every step,
            one platform.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-semibold text-background shadow-sm transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start for free
            </Link>
            <Link
              href="/features"
              className="inline-flex h-11 items-center justify-center rounded-xl border px-6 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all features
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required ·{' '}
            <Link
              href="/auth/login"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Sign in with demo account
            </Link>
          </p>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────────────────── */}
      <section
        className="border-b bg-muted/20"
        aria-label="Platform statistics"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <dl className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {SOCIAL_PROOF.map((item) => (
              <div key={item.label}>
                <dt className="text-3xl font-bold tracking-tight">{item.stat}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-label="Features">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything your hiring team needs
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From sourcing to signing — HireTrack AI brings your entire hiring
            workflow into one collaborative, accessible, and fast platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
                  aria-hidden="true"
                >
                  <Icon className="h-4.5 w-4.5 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Tech stack callout ────────────────────────────────────────────── */}
      <section className="border-t border-b bg-muted/20" aria-label="Technology stack">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Built on the modern stack
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            Next.js 15, TypeScript strict mode, Prisma ORM, PostgreSQL,
            Auth.js, Tailwind CSS, shadcn/ui, and Recharts — no shortcuts.
          </p>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            aria-label="Technology badges"
          >
            {[
              'Next.js 15',
              'TypeScript',
              'PostgreSQL',
              'Prisma',
              'Auth.js',
              'Tailwind CSS',
              'Zod',
              'Recharts',
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6"
        aria-label="Call to action"
      >
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to streamline your hiring?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Sign up free and have your first job posted in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-8 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create free account
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-8 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Read the docs
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Demo account: demo@hiretrack.ai / demo1234
        </p>
      </section>
    </>
  )
}
