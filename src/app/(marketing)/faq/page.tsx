import { JsonLd } from '@/components/json-ld'
import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about HireTrack AI — pricing, authentication, self-hosting, data security, integrations, and more.',
  alternates: { canonical: `${APP_URL}/faq` },
  openGraph: {
    title: 'FAQ — HireTrack AI',
    description: 'Common questions about HireTrack AI answered.',
    url: `${APP_URL}/faq`,
    images: [{ url: `${APP_URL}/og-faq.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ — HireTrack AI',
    description: 'Common questions about HireTrack AI answered.',
  },
}

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'What is HireTrack AI?',
    answer:
      'HireTrack AI is an open-source, production-ready Applicant Tracking System (ATS) for companies and recruiting teams. It covers the full hiring lifecycle: posting jobs, tracking candidates, scheduling interviews, managing your pipeline, and reporting on hiring performance.',
  },
  {
    question: 'Is HireTrack AI free to use?',
    answer:
      'Yes — the codebase is fully open source and free to self-host. You only need a PostgreSQL database and a server or a Vercel account. There is no per-seat fee when self-hosting.',
  },
  {
    question: 'What tech stack does it use?',
    answer:
      'HireTrack AI is built on Next.js 15 (App Router), TypeScript strict mode, Tailwind CSS, shadcn/ui, Prisma ORM, PostgreSQL, Auth.js (NextAuth), Zod, Recharts, and Framer Motion. The full stack runs on Node.js and deploys to Vercel out of the box.',
  },
  {
    question: 'How do I log in with the demo account?',
    answer:
      'After running the database seed (npm run db:seed), use the credentials demo@hiretrack.ai and password demo1234. The demo account has the Recruiter role so you can explore all core features.',
  },
  {
    question: 'What sign-in options are available?',
    answer:
      'HireTrack AI supports three authentication methods: email + password with email verification, Google OAuth, and GitHub OAuth. All three require only environment variable configuration — no code changes needed.',
  },
  {
    question: 'How does role-based access control work?',
    answer:
      'There are five roles: Super Admin, Recruiter, Hiring Manager, Interviewer, and Viewer. Permissions are checked server-side in every server action using requirePermission() — the client is never trusted for authorization decisions. An audit log records every create, update, and delete across all entities.',
  },
  {
    question: 'Can multiple organizations use the same installation?',
    answer:
      'Yes. HireTrack AI is multi-tenant by design. Each organization has its own isolated workspace. All database queries filter by organizationId to prevent cross-tenant data leakage.',
  },
  {
    question: 'How do I set up OAuth providers?',
    answer:
      'Add AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_GITHUB_ID, and AUTH_GITHUB_SECRET to your .env file. Create OAuth apps in the Google Cloud Console and GitHub Developer Settings respectively, and set the callback URL to {YOUR_URL}/api/auth/callback/{provider}.',
  },
  {
    question: 'Does it send emails?',
    answer:
      'Yes. Email is used for account verification, password reset, and invitation links. HireTrack AI integrates with Resend for transactional email. Set RESEND_API_KEY and EMAIL_FROM in your environment. Email sending is gracefully skipped in development if the key is not set.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes. The analytics page has a CSV export button that downloads a multi-section report (KPIs, funnel, sources, top jobs). The export API route at /api/analytics/export is authenticated and RBAC-gated.',
  },
  {
    question: 'How do I deploy to production?',
    answer:
      'The recommended path is Vercel + Neon or Supabase PostgreSQL. Push your repo to GitHub, import into Vercel, add your environment variables, run db:migrate:prod against your production database, and deploy. GitHub Actions CI runs type-check, lint, test, and build on every push.',
  },
  {
    question: 'Is the code accessible (WCAG compliant)?',
    answer:
      'HireTrack AI is built with WCAG AA compliance in mind: semantic HTML, ARIA labels on interactive elements, focus rings, keyboard navigation, and minimum 44×44 px touch targets. Full compliance verification requires manual testing with assistive technologies.',
  },
  {
    question: 'How do I contribute?',
    answer:
      'Read CONTRIBUTING.md for the full guide. In short: fork the repo, create a feature branch, write your changes with tests, and open a pull request using the provided PR template. We use conventional commits (feat:, fix:, docs:, refactor:, chore:, test:).',
  },
  {
    question: 'Where can I find the architecture documentation?',
    answer:
      'The docs/architecture.md file contains the ER diagram, authentication flow, authorization flow, folder structure breakdown, and trade-off decisions. You can also check the /docs page for a condensed version.',
  },
]

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about HireTrack AI. Can&apos;t find your answer?{' '}
            <Link href="/docs" className="underline underline-offset-2 hover:text-foreground">
              Read the docs
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section
        className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
        aria-label="Frequently asked questions"
      >
        <dl className="space-y-6">
          {FAQS.map((faq, i) => (
            <div
              key={faq.question}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <dt>
                <h2 className="text-sm font-semibold leading-relaxed">
                  <span
                    className="mr-2 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {faq.question}
                </h2>
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted-foreground pl-7">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-xl font-bold tracking-tight">Still have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the full documentation or open an issue on GitHub.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex h-10 items-center rounded-lg bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Read the docs
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try it free
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
