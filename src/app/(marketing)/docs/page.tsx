import { JsonLd } from '@/components/json-ld'
import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'HireTrack AI documentation — installation, environment variables, authentication, RBAC, API patterns, deployment, and contributing guide.',
  alternates: { canonical: `${APP_URL}/docs` },
  openGraph: {
    title: 'Documentation — HireTrack AI',
    description: 'Setup, configuration, and development guide for HireTrack AI.',
    url: `${APP_URL}/docs`,
    images: [{ url: `${APP_URL}/og-docs.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation — HireTrack AI',
    description: 'Setup, configuration, and development guide for HireTrack AI.',
  },
}

interface DocSection {
  id: string
  title: string
  content: React.ReactNode
}

export default function DocsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: 'HireTrack AI Documentation',
    url: `${APP_URL}/docs`,
    description: 'Technical documentation for the HireTrack AI applicant tracking system.',
    author: { '@type': 'Organization', name: 'HireTrack AI', url: APP_URL },
    isPartOf: { '@type': 'WebSite', name: 'HireTrack AI', url: APP_URL },
  }

  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            HireTrack AI is a production-ready, open-source Applicant Tracking System (ATS)
            built with Next.js 15, TypeScript strict mode, Prisma ORM, and PostgreSQL. It
            supports multi-tenant organizations, role-based access control, and covers the
            full hiring lifecycle from job posting to offer.
          </p>
          <p>
            The project is structured as a monorepo with a single Next.js application. All
            backend logic lives in server actions — there are no separate API servers.
          </p>
        </div>
      ),
    },
    {
      id: 'prerequisites',
      title: 'Prerequisites',
      content: (
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {[
            'Node.js ≥ 20',
            'PostgreSQL 15+ (local or hosted)',
            'npm ≥ 10 (or pnpm / yarn)',
            'Git',
            'Optional: Google and GitHub OAuth apps for social login',
            'Optional: Resend account for transactional email',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'installation',
      title: 'Installation',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Clone the repository and install dependencies:</p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
            <code>{`git clone https://github.com/your-org/hiretrack-ai.git
cd hiretrack-ai
npm install`}</code>
          </pre>
          <p className="text-sm text-muted-foreground">Copy the environment template:</p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
            <code>{`cp .env.example .env`}</code>
          </pre>
        </div>
      ),
    },
    {
      id: 'env',
      title: 'Environment Variables',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            All environment variables are validated at startup via Zod in{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">src/lib/env.ts</code>.
            Missing required variables cause a descriptive error before the server starts.
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Variable</th>
                  <th className="px-3 py-2 text-left font-medium">Required</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ['DATABASE_URL', 'Yes', 'PostgreSQL connection string'],
                  ['AUTH_SECRET', 'Yes', 'Auth.js secret (openssl rand -base64 32)'],
                  ['AUTH_URL', 'Yes', 'Full app URL (e.g. http://localhost:3000)'],
                  ['AUTH_GOOGLE_ID', 'No', 'Google OAuth client ID'],
                  ['AUTH_GOOGLE_SECRET', 'No', 'Google OAuth client secret'],
                  ['AUTH_GITHUB_ID', 'No', 'GitHub OAuth App client ID'],
                  ['AUTH_GITHUB_SECRET', 'No', 'GitHub OAuth App client secret'],
                  ['RESEND_API_KEY', 'No', 'Resend API key for transactional email'],
                  ['EMAIL_FROM', 'No', 'Sender address (e.g. noreply@hiretrack.ai)'],
                  ['NEXT_PUBLIC_APP_URL', 'Yes', 'Public base URL for metadata and links'],
                ].map(([key, req, desc]) => (
                  <tr key={key} className="hover:bg-muted/10">
                    <td className="px-3 py-2 font-mono text-foreground">{key}</td>
                    <td className="px-3 py-2">
                      <span className={req === 'Yes' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {req}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'database',
      title: 'Database Setup',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run the Prisma migration to create all tables, then seed demo data:
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
            <code>{`# Apply schema migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed demo organization and users
npm run db:seed`}</code>
          </pre>
          <p className="text-sm text-muted-foreground">
            The seed creates a demo organization with a recruiter account you can use
            immediately:
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs">
            <code>{`Email:    demo@hiretrack.ai
Password: demo1234`}</code>
          </pre>
        </div>
      ),
    },
    {
      id: 'dev',
      title: 'Development',
      content: (
        <div className="space-y-4">
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
            <code>{`# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Run unit tests
npm test

# Run E2E tests (requires running dev server)
npm run test:e2e`}</code>
          </pre>
        </div>
      ),
    },
    {
      id: 'rbac',
      title: 'Role-Based Access Control',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Permissions are defined in{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">src/lib/permissions.ts</code>{' '}
            and enforced in every server action via{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">requirePermission()</code>.
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/30">
                <tr>
                  {['Role', 'Jobs', 'Candidates', 'Pipeline', 'Interviews', 'Analytics'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                {[
                  ['Super Admin', 'Full', 'Full', 'Full', 'Full', 'Read'],
                  ['Recruiter', 'Create/Edit', 'Create/Edit', 'Move', 'Create/Edit', 'Read'],
                  ['Hiring Manager', 'Read/Edit', 'Read', 'Move', 'Read/Feedback', 'Read'],
                  ['Interviewer', 'Read', 'Read', 'Read', 'Feedback only', '—'],
                  ['Viewer', 'Read', 'Read', 'Read', 'Read', '—'],
                ].map(([role, ...perms]) => (
                  <tr key={role} className="hover:bg-muted/10">
                    <td className="px-3 py-2 font-medium text-foreground">{role}</td>
                    {perms.map((p, i) => (
                      <td key={i} className="px-3 py-2">{p}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'architecture',
      title: 'Architecture',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            HireTrack AI uses the Next.js App Router with React Server Components. All data
            fetching happens in server components or server actions — there is no client-side
            API fetching for mutations.
          </p>
          <ul className="space-y-1.5">
            {[
              'src/app — Next.js App Router pages and API routes',
              'src/features — Feature-sliced components (jobs, candidates, interviews, etc.)',
              'src/server/actions — All server actions (CRUD, auth, analytics)',
              'src/lib — Auth, database client, permissions, utilities',
              'src/validators — Zod schemas for every form and API input',
              'src/types — Shared TypeScript types',
              'src/components — Shared UI primitives (shadcn/ui)',
              'prisma — Prisma schema, migrations, and seed script',
              'tests — Vitest unit tests and Playwright E2E tests',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
                <code className="text-xs text-foreground">{item}</code>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: 'deployment',
      title: 'Deployment',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            The recommended deployment target is Vercel with a Neon or Supabase
            PostgreSQL database.
          </p>
          <ol className="space-y-2 list-decimal list-inside">
            {[
              'Push your repository to GitHub',
              'Import the project into Vercel',
              'Add all required environment variables in the Vercel dashboard',
              'Set NEXT_PUBLIC_APP_URL to your production domain',
              'Run db:migrate:prod against your production database',
              'Deploy — GitHub Actions CI runs on every push',
            ].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ),
    },
  ]

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-20">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <nav>
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <article className="min-w-0">
            <header className="mb-10 border-b pb-8">
              <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="mt-3 text-muted-foreground">
                Everything you need to install, configure, and extend HireTrack AI.
              </p>
            </header>

            <div className="space-y-12">
              {sections.map((section) => (
                <section key={section.id} id={section.id} aria-labelledby={`heading-${section.id}`}>
                  <h2
                    id={`heading-${section.id}`}
                    className="mb-4 text-xl font-semibold tracking-tight"
                  >
                    {section.title}
                  </h2>
                  {section.content}
                </section>
              ))}
            </div>

            {/* Footer nav */}
            <div className="mt-16 flex items-center justify-between border-t pt-8">
              <Link
                href="/features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Features
              </Link>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
