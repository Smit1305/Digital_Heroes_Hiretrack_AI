# HireTrack AI Milestone Plan

## Milestone 1: Project Setup, Folder Structure, Prisma, Database

### Acceptance Criteria
- Next.js App Router project uses TypeScript strict mode, Tailwind CSS, shadcn/ui, ESLint, Prettier, Husky, lint-staged, Vitest, and Playwright.
- Required folders exist under `src/app`, `src/components`, `src/features`, `src/lib`, `src/server`, `src/validators`, `src/types`, `prisma`, `public`, and `tests`.
- Prisma uses PostgreSQL and includes the core ATS models: users, organizations, jobs, candidates, applications, interviews, notes, activity logs, audit logs, notifications, Auth.js tables, password resets, and invitations.
- Database models include indexes, foreign keys, cascade rules, timestamps, organization ownership, and soft-delete support on primary business records.
- Seed data creates a demo organization, demo users, jobs, candidates, applications, interviews, logs, and the demo login `demo@hiretrack.ai` / `demo1234`.

### Affected Files
- `package.json`
- `tsconfig.json`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/**`
- `src/lib/prisma-client.ts`
- `src/lib/db.ts`
- `src/lib/env.ts`
- `tests/**`

### Edge Cases
- Missing `DATABASE_URL` fails clearly before creating a Prisma client.
- Demo seed can be rerun without duplicating the demo organization.
- Foreign-key deletion behavior avoids orphaned ATS records.

### Tests
- `npm run type-check`
- `npm test`
- `npm run db:generate`
- `npm run db:seed` with a configured local PostgreSQL database

## Milestone 9: SEO

### Acceptance Criteria
- **Landing page** at `/` is replaced with a production-quality marketing page: hero section with CTA, social proof stats, feature grid (8 cards), tech stack callout, and bottom CTA. Zero Next.js placeholder content remains.
- **Features page** at `/features` lists all 11 feature areas with icons, descriptions, and bullet points. Full `<Metadata>` with title, description, OG, Twitter card, canonical URL.
- **Docs page** at `/docs` provides a sticky sidebar TOC with 8 sections: Overview, Prerequisites, Installation, Environment Variables, Database Setup, Development, RBAC table, Architecture, Deployment. Full metadata + JSON-LD `TechArticle`.
- **FAQ page** at `/faq` answers 14 common questions. Renders `FAQPage` JSON-LD schema for Google rich results.
- All four public pages share a **marketing layout** (`(marketing)/layout.tsx`) with sticky header (logo + nav links + CTA buttons) and footer (4-column links grid).
- **`sitemap.ts`** auto-generates `/sitemap.xml` with all public routes (`/`, `/features`, `/faq`, `/docs`, `/auth/login`, `/auth/register`) including `lastModified`, `changeFrequency`, and `priority`.
- **`robots.ts`** auto-generates `/robots.txt` disallowing all dashboard, API, and internal routes. Points crawlers to the sitemap.
- **`next.config.ts`** applies security headers to all routes: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, HSTS (production only), and Content Security Policy.
- **Root `layout.tsx`** has complete metadata: title template, description, keywords, authors, OG image, Twitter card, `robots: {index: true, follow: true}` with `googleBot` directives, `metadataBase`, `alternates.canonical`, `applicationName`, `verification` placeholder. Renders `Organization` JSON-LD on every page.
- **`JsonLd` component** (`src/components/json-ld.tsx`) renders `<script type="application/ld+json">` server-side for structured data.
- **Dashboard layout** exports `metadata: { robots: { index: false, follow: false } }` — all authenticated routes are noindexed.
- **Auth layout** and **onboarding page** also set `robots: { index: false, follow: false }`.
- All public pages have unique `<title>` tags using the root layout's `template: '%s — HireTrack AI'` pattern.
- OG and Twitter images referenced as `${APP_URL}/og-*.png` — static files can be added to `/public/` without code changes.
- `next.config.ts` adds `/home → /` (permanent) and `/pricing → /auth/register` (temporary) redirects.
- `images.remotePatterns` configured for GitHub avatars, Google profile photos, and Vercel storage.

### Affected Files
- `plan.md`
- `src/components/json-ld.tsx` (new)
- `src/app/(marketing)/layout.tsx` (new) — shared marketing header + footer
- `src/app/(marketing)/page.tsx` (new) — landing page (replaces placeholder)
- `src/app/(marketing)/features/page.tsx` (new)
- `src/app/(marketing)/docs/page.tsx` (new)
- `src/app/(marketing)/faq/page.tsx` (new)
- `src/app/sitemap.ts` (new) — generates `/sitemap.xml`
- `src/app/robots.ts` (new) — generates `/robots.txt`
- `src/app/layout.tsx` — complete metadata, OG, Twitter, JSON-LD, preconnects
- `src/app/(dashboard)/layout.tsx` — added `metadata: { robots: noindex }`
- `src/app/auth/layout.tsx` — added `robots: noindex`, updated title template
- `src/app/onboarding/page.tsx` — added `robots: noindex`
- `src/app/auth/login/page.tsx` — improved description
- `src/app/auth/register/page.tsx` — improved description
- `next.config.ts` — security headers, redirects, image remote patterns, compression

### Edge Cases
- `(marketing)` route group doesn't affect URL structure — `/`, `/features`, `/faq`, `/docs` are the actual paths.
- Old `src/app/page.tsx` (Next.js default placeholder) is removed; the marketing group's `page.tsx` now handles `/`.
- `metadataBase` in root layout ensures all relative OG image URLs resolve correctly even when pages use relative paths.
- `NEXT_PUBLIC_APP_URL` fallback is `https://hiretrack.ai` in production and `http://localhost:3000` in development.
- CSP `unsafe-eval` is included because Next.js dev mode requires it; tighten for production by removing it and using hash-based CSP.
- `robots: { index: false }` on the dashboard layout cascades to all child pages; individual dashboard pages don't need to repeat it.
- `generateMetadata` on job and candidate detail pages already produces unique titles — no change needed, they inherit noindex from the layout.
- JSON-LD `FAQPage` schema on `/faq` enables Google's FAQ rich results in search.
- `verification.google` reads from `GOOGLE_SITE_VERIFICATION` env var — no hardcoded tokens.

### Tests
- `npm run type-check` — all SEO files pass strict TypeScript.
- `npm run lint` — no ESLint warnings.
- Visit `http://localhost:3000` — marketing landing page renders with full content.
- Visit `http://localhost:3000/sitemap.xml` — valid XML with 6 URLs.
- Visit `http://localhost:3000/robots.txt` — disallows dashboard routes, points to sitemap.
- Curl or browser DevTools confirm `X-Frame-Options`, `X-Content-Type-Options`, and CSP response headers on every route.
- View page source on `/`, `/features`, `/faq`, `/docs` — `<script type="application/ld+json">` present with correct schema.

---

## Milestone 8: Analytics

### Acceptance Criteria
- `/analytics` page is accessible to SUPER_ADMIN, RECRUITER, and HIRING_MANAGER (gated by `analytics:read` permission); other roles are redirected to `/dashboard`.
- Time-range filter (7d / 30d / 90d / 1y) synced to URL state (`?range=`); changing it instantly reloads all sections via server-side `searchParams`.
- **KPI Grid** (8 cards): Total Applications, Hires, Conversion Rate, Avg Time to Hire, Total Interviews, Interview Completion Rate, Offer Acceptance Rate, Avg Interview Rating.
- **Hiring Trends** line chart: Applications vs Hires per month over the selected period (1–12 months depending on range).
- **Hiring Funnel** progress-bar chart: candidate counts per stage, filtered to `appliedAt >= dateFrom`.
- **Stage Conversion** table: pairwise drop-off rates (Applied→Screening, Screening→Interview, …, Offer→Hired) with colour-coded bars (green ≥ 60%, amber 30–59%, red < 30%).
- **Candidate Sources** donut chart: top 8 sources, filtered by `candidate.createdAt >= dateFrom`.
- **Interview Statistics**: summary tiles (total, completion rate, avg rating, avg duration) + two donut charts (by status, by type).
- **Top Performing Jobs** table: top 10 jobs by application count in period, showing application count, hire count, and conversion rate. Job titles link to `/jobs/[id]`.
- **Recruiter Activity** table: top 10 team members by pipeline actions (stage moves, interview schedules), showing action count and hire count, with rank badges.
- **CSV Export**: `GET /api/analytics/export?range=` streams a multi-section CSV (KPIs, Funnel, Sources, Top Jobs). Auth and RBAC enforced on the route handler.
- All sections use React `Suspense` with matching skeleton loaders; sections load in parallel.
- `loading.tsx` provides full-page skeleton feedback.
- `revalidate = 300` (5 minutes) on the analytics page.
- Every section handles empty-state gracefully — no blank cards or broken charts.
- Accessible: semantic tables, `role="img"` + `aria-label` on charts, `role="progressbar"` on conversion bars, `role="group"` on the time range filter.

### Affected Files
- `plan.md`
- `src/types/analytics.ts` (new) — `AnalyticsKPIs`, `ConversionStep`, `InterviewStats`, `TopJobRow`, `RecruiterRow`, `AnalyticsRange`, `RANGE_LABELS`
- `src/server/actions/analytics.ts` (new) — 8 server actions with RBAC, org-scoping, time-range filtering
- `src/app/(dashboard)/analytics/page.tsx` (new)
- `src/app/(dashboard)/analytics/loading.tsx` (new)
- `src/app/api/analytics/export/route.ts` (new) — CSV export API route
- `src/features/analytics/components/analytics-time-range-filter.tsx` (new)
- `src/features/analytics/components/analytics-kpi-grid.tsx` (new)
- `src/features/analytics/components/analytics-trends-chart.tsx` (new)
- `src/features/analytics/components/analytics-trends-section.tsx` (new)
- `src/features/analytics/components/analytics-funnel-section.tsx` (new) — wraps existing `HiringFunnelChart`
- `src/features/analytics/components/analytics-stage-conversion.tsx` (new)
- `src/features/analytics/components/analytics-stage-conversion-section.tsx` (new)
- `src/features/analytics/components/analytics-source-section.tsx` (new) — wraps existing `CandidateSourcesChart`
- `src/features/analytics/components/analytics-interview-stats.tsx` (new)
- `src/features/analytics/components/analytics-interview-stats-section.tsx` (new)
- `src/features/analytics/components/analytics-top-jobs-table.tsx` (new)
- `src/features/analytics/components/analytics-recruiter-table.tsx` (new)
- `src/features/analytics/components/analytics-export-button.tsx` (new)
- `src/features/analytics/components/index.ts` (new)

### Edge Cases
- All queries scope by `application.job.organizationId` to prevent cross-org leakage.
- `analyticsRangeSchema` validates the `range` URL param; invalid values fall back to `30d`.
- Avg time-to-hire is computed in JS (Prisma cannot `AVG(date - date)` natively); uses `hiredAt - appliedAt` in milliseconds → days.
- `getRecruiterPerformanceAction` queries `ActivityLog` by `action IN (STAGE_CHANGED, INTERVIEW_SCHEDULED, OFFER_SENT)` for activity count, and a separate query for hires using JSON path filter on `metadata.to = 'HIRED'`.
- Recharts `ResponsiveContainer` is used inside `'use client'` components only; no SSR rendering issues.
- CSV export sets `Cache-Control: no-store` and streams the response with `Content-Disposition: attachment`.
- Time-range filter uses `useTransition` to show the browser in a pending state while Next.js re-renders with new `searchParams`.
- Empty state shown for every section when `data.length === 0` or all counts are 0.

### Tests
- `npm run type-check` — all analytics files pass strict TypeScript.
- `npm run lint` — no ESLint warnings.
- `npm run db:seed` then visit `/analytics` — all sections render with seeded data; time-range filter changes data; CSV export downloads correctly.

---

## Milestone 7: Interview Management

### Acceptance Criteria
- `/interviews` page renders a paginated card grid of all interviews for the org with server-side search, status/type filters, and sort — all URL-state synced.
- Tabs switch between List view (card grid) and Calendar view (monthly calendar with type-coloured dots per day).
- Schedule interview dialog lets authorised users pick a candidate+position combo, choose an interviewer from the org, set type (Phone/Video/On-site/Technical/HR/Panel), duration, date & time, location/link, and internal notes.
- Edit interview dialog pre-populates all editable fields; only SCHEDULED/RESCHEDULED interviews are editable.
- Reschedule action sets status to `RESCHEDULED`, records the new `scheduledAt`, and writes ActivityLog + AuditLog.
- Cancel interview sets status to `CANCELLED` and writes ActivityLog + AuditLog.
- Mark no-show sets status to `NO_SHOW` for SCHEDULED/RESCHEDULED interviews with ActivityLog + AuditLog.
- Feedback form allows star rating (1–5) and free-text feedback; submitting marks the interview `COMPLETED`.
- Delete action (SUPER_ADMIN and RECRUITER only) permanently removes the interview record with ActivityLog + AuditLog, with a confirmation dialog.
- Past-due scheduled interviews show the date in destructive red as a visual overdue warning.
- Every mutation writes both `ActivityLog` and `AuditLog` records.
- RBAC enforced server-side: `interviews:read` (all roles), `interviews:create` (SUPER_ADMIN, RECRUITER), `interviews:update` (SUPER_ADMIN, RECRUITER, HIRING_MANAGER), `interviews:feedback` (SUPER_ADMIN, HIRING_MANAGER, INTERVIEWER), `interviews:delete` (SUPER_ADMIN, RECRUITER).
- Loading skeleton mirrors the grid layout; empty states provided for no-data and filtered-no-results cases.
- All forms validate with Zod; field errors shown inline.
- 300 ms debounce on search input; URL state cleared when filters reset.
- Calendar view shows up to 100 upcoming SCHEDULED interviews; "+N more" pill for overflow days.
- Pagination: 18 per page, windowed page buttons, URL-state driven.

### Affected Files
- `plan.md`
- `src/types/auth.ts` — added `interviews:delete` to Permission type
- `src/lib/permissions.ts` — SUPER_ADMIN and RECRUITER gain `interviews:delete`
- `src/validators/interview.ts`
- `src/server/actions/interviews.ts` — AuditLog added to all mutations; new `rescheduleInterviewAction`, `markNoShowAction`, `deleteInterviewAction`
- `src/features/interviews/components/interview-card.tsx` — Reschedule, Mark no-show, Delete actions; `canDelete` prop
- `src/features/interviews/components/reschedule-form.tsx` (new)
- `src/features/interviews/components/confirm-delete-dialog.tsx` (new)
- `src/features/interviews/components/interview-form.tsx`
- `src/features/interviews/components/feedback-form.tsx`
- `src/features/interviews/components/interview-type-badge.tsx`
- `src/features/interviews/components/interviews-filters.tsx`
- `src/features/interviews/components/interviews-list.tsx` — added `canDelete` prop
- `src/features/interviews/components/interviews-calendar.tsx`
- `src/features/interviews/components/interview-card-skeleton.tsx`
- `src/features/interviews/components/interviews-empty-state.tsx`
- `src/features/interviews/components/interviews-pagination.tsx`
- `src/features/interviews/components/index.ts`
- `src/app/(dashboard)/interviews/page.tsx` — passes `canDelete`
- `src/app/(dashboard)/interviews/loading.tsx`

### Edge Cases
- Scheduling in the past is blocked by Zod (`scheduledAt` must be a future date).
- Rescheduling a CANCELLED or COMPLETED interview returns a clear user-facing error.
- Marking no-show is only allowed for SCHEDULED/RESCHEDULED interviews.
- Delete is a hard delete (interviews don't support soft-delete); confirmation dialog required before proceeding.
- Calendar view fetches up to 100 upcoming SCHEDULED interviews; overflow hidden behind "+N more" pill.
- `getSchedulableApplicationsAction` excludes HIRED and REJECTED applications; capped at 200 entries for dropdown performance.
- Interviewer dropdown only includes active org members with role in [SUPER_ADMIN, RECRUITER, HIRING_MANAGER, INTERVIEWER].
- Cross-org isolation: all queries scope by `application.job.organizationId`.
- `canActOnInterview` helper in the card guards all mutating actions against CANCELLED/COMPLETED/NO_SHOW states.

### Tests
- `npm run type-check` — all interview files pass strict TypeScript.
- `npm run lint` — no ESLint warnings.
- `npm run db:seed` then visit `/interviews` — seeded interviews visible with filters, calendar, and all actions working.

---

## Milestone 6: Pipeline (Kanban)

### Acceptance Criteria
- `/pipeline` renders a horizontal Kanban board with 8 fixed columns: Applied → Screening → Interview → Technical → HR Round → Offer → Hired → Rejected.
- Columns are colour-coded with a stage dot, card left-border accent, and droppable background tint.
- Drag-and-drop powered by `@hello-pangea/dnd` (React 19 compatible fork of `react-beautiful-dnd`).
- Optimistic UI: column state updates immediately on drop; server commit happens in background.
- On server error the move is rolled back and a toast is shown.
- Undo button (last 10 moves) appears after any move and reverses the last action on the server.
- Refresh button re-fetches the pipeline from the server and clears history.
- Each card shows: candidate avatar initials, name (links to candidate profile), email, job title, score, upcoming/completed interview badge, time since applied.
- Card action menu: View profile, Reject (moves to REJECTED column).
- Job filter dropdown at the top-right scopes the board to a single job (URL state `?jobId=`).
- Empty state when no applications exist, with links to candidates/jobs pages.
- Full-height layout: board fills viewport below the top bar, columns scroll internally, board scrolls horizontally.
- All stage moves write ActivityLog and AuditLog records server-side.
- RBAC: `applications:move` permission required; read-only roles see the board but cannot drag.
- Loading skeleton mirrors the full board layout.
- `hiredAt` and `rejectedAt` are set automatically when a card is moved to HIRED/REJECTED.
- Moving back from HIRED/REJECTED clears those timestamps.

### Affected Files
- `plan.md`
- `src/server/actions/pipeline.ts` (new)
- `src/features/pipeline/components/pipeline-stage-config.ts`
- `src/features/pipeline/components/pipeline-board.tsx`
- `src/features/pipeline/components/pipeline-column.tsx`
- `src/features/pipeline/components/pipeline-card.tsx`
- `src/features/pipeline/components/pipeline-job-filter.tsx`
- `src/features/pipeline/components/pipeline-skeleton.tsx`
- `src/features/pipeline/components/pipeline-empty-state.tsx`
- `src/features/pipeline/components/index.ts`
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/app/(dashboard)/pipeline/loading.tsx`

### Edge Cases
- Same-column reorder: `source.droppableId === destination.droppableId` handled as an in-place splice.
- No-op guard: if stage and index are identical, the action returns early without a DB write.
- DnD on mobile: `@hello-pangea/dnd` supports touch events natively.
- Race conditions: optimistic update is already applied; a failure simply restores the pre-move snapshot.
- `stageOrder` is updated to `destination.index` on each move so relative order persists across refreshes.
- `getPipelineJobsAction` only returns jobs with `status IN (OPEN, PAUSED)` that have at least one application.

### Tests
- `npm run type-check` — all pipeline files pass strict TypeScript.
- `npm run lint` — no ESLint warnings.
- `npm run db:seed` then visit `/pipeline` — 13 seeded applications visible across the 8 columns.

---

## Milestone 5: Candidates CRUD

### Acceptance Criteria
- Candidates list page at `/candidates` shows all non-deleted candidates for the org.
- Server-side search (300 ms debounce) across first/last name, email, location, and skills.
- Filter by status (ACTIVE / INACTIVE / BLACKLISTED) and candidate source.
- Sort by: Newest, Oldest, Name A–Z, Name Z–A, Recently updated. All in URL state.
- Pagination: 18 per page with windowed page buttons.
- Add candidate modal with full field set: name, email, phone, location, experience, education, source, status, LinkedIn, portfolio, skills (tag input), notes.
- Edit candidate pre-populated with existing values.
- Soft-delete candidate sets `deletedAt`; removed from all list queries.
- Status change (Active / Inactive / Blacklisted) from detail page sidebar via dropdown.
- Add notes to a candidate from the detail page; notes are loaded fresh after each submit.
- Activity timeline shows all logged actions on the candidate (created, updated, stage changes, notes, interviews, offers).
- Candidate detail page at `/candidates/[id]` with 4 tabs: Overview (skills + notes), Applications (all apps with stage + date), Notes, Timeline.
- Sidebar shows profile details, status changer, external links (LinkedIn, portfolio).
- 404 page for missing or deleted candidates.
- RBAC enforced server-side via `requirePermission` on every action.
- All mutations create ActivityLog and AuditLog records and call `revalidatePath`.
- Loading skeletons for both list and detail.
- Empty states for grid (no candidates, no filter matches) and all empty tabs.

### Affected Files
- `plan.md`
- `src/server/actions/candidates.ts` (new)
- `src/features/candidates/components/candidate-form.tsx`
- `src/features/candidates/components/candidate-card.tsx`
- `src/features/candidates/components/candidate-card-skeleton.tsx`
- `src/features/candidates/components/candidate-status-badge.tsx`
- `src/features/candidates/components/candidate-detail-view.tsx`
- `src/features/candidates/components/candidate-notes.tsx`
- `src/features/candidates/components/candidate-timeline.tsx`
- `src/features/candidates/components/candidates-list.tsx`
- `src/features/candidates/components/candidates-filters.tsx`
- `src/features/candidates/components/candidates-pagination.tsx`
- `src/features/candidates/components/candidates-empty-state.tsx`
- `src/features/candidates/components/delete-candidate-dialog.tsx`
- `src/features/candidates/components/index.ts`
- `src/app/(dashboard)/candidates/page.tsx`
- `src/app/(dashboard)/candidates/loading.tsx`
- `src/app/(dashboard)/candidates/[id]/page.tsx`
- `src/app/(dashboard)/candidates/[id]/not-found.tsx`

### Edge Cases
- Duplicate email within same org is rejected at both create and update with a field-level error.
- Empty or whitespace-only URL fields (`linkedin`, `portfolio`, `website`) are stored as `null`.
- Skills stored as `String[]` in Postgres — `hasSome` used for skill search.
- `experience` filter uses `gte` so candidates with equal or more years are returned.
- Notes are sorted pinned-first then newest-first.
- Timeline shows up to 50 most recent events.
- Status change is a separate lightweight action; full update action is not needed.

### Tests
- `npm run type-check` — all files pass strict TypeScript.
- `npm run lint` — no ESLint warnings.
- Seed 10 candidates visible at `/candidates` with filters and pagination working.

---

## Milestone 4: Jobs CRUD

### Acceptance Criteria
- Jobs list page at `/jobs` shows all non-deleted jobs for the authenticated user's organization.
- Server-side search (debounced 300 ms) across title, department, location, description.
- Filter by status (DRAFT / OPEN / PAUSED / CLOSED / ARCHIVED) and employment type.
- Sort by: Newest, Oldest, Title A–Z, Title Z–A, Recently updated.
- URL state sync: all filters and sort are reflected in the URL so pages are shareable and bookmarkable.
- Pagination: 18 per page, with numbered page buttons and prev/next.
- Create job via modal form (title, department, location, employment type, status, salary range, remote toggle, experience level, description, requirements, benefits).
- Edit job via same modal, pre-populated with existing values.
- Duplicate job creates a copy as DRAFT with "(Copy)" suffix.
- Archive job sets status to ARCHIVED and records closedAt.
- Soft-delete job sets deletedAt; removed from all list queries.
- All mutations create ActivityLog and AuditLog records.
- Every mutation calls `revalidatePath` for `/jobs`, the individual job, and `/dashboard`.
- Individual job detail page at `/jobs/[id]` with tabbed view (Description / Requirements / Benefits) and sidebar (stats, tags, hiring manager).
- 404 page for missing or deleted jobs.
- RBAC enforced server-side: create/edit/delete/archive check permissions via `requirePermission`.
- Loading skeletons for list page and card grid.
- Empty state with CTA when no jobs exist; separate message when filters return nothing.
- All forms validate with Zod; field errors shown inline.
- New UI primitives: Select, Textarea, Checkbox, Tooltip components added.

### Affected Files
- `plan.md`
- `src/components/ui/select.tsx` (new)
- `src/components/ui/textarea.tsx` (new)
- `src/components/ui/checkbox.tsx` (new)
- `src/components/ui/tooltip.tsx` (new)
- `src/server/actions/jobs.ts` (new)
- `src/features/jobs/components/job-form.tsx`
- `src/features/jobs/components/job-card.tsx`
- `src/features/jobs/components/job-card-skeleton.tsx`
- `src/features/jobs/components/job-status-badge.tsx`
- `src/features/jobs/components/job-detail-view.tsx`
- `src/features/jobs/components/jobs-list.tsx`
- `src/features/jobs/components/jobs-filters.tsx`
- `src/features/jobs/components/jobs-pagination.tsx`
- `src/features/jobs/components/jobs-empty-state.tsx`
- `src/features/jobs/components/delete-job-dialog.tsx`
- `src/features/jobs/components/index.ts`
- `src/app/(dashboard)/jobs/page.tsx`
- `src/app/(dashboard)/jobs/loading.tsx`
- `src/app/(dashboard)/jobs/[id]/page.tsx`
- `src/app/(dashboard)/jobs/[id]/not-found.tsx`

### Edge Cases
- Salary min > max not blocked at DB level — form validates min ≤ max client-side via Zod refine.
- Duplicate job: source fields like `id`, `createdAt`, `publishedAt`, `closedAt` are stripped.
- Archive on already-archived job returns early with a clear error message.
- Delete is soft — `deletedAt` is set, no data is destroyed; all list queries filter `deletedAt: null`.
- Hiring manager cross-org validation: server action checks manager belongs to same org before saving.
- `pageSize` capped at 100 in the Zod schema to prevent unbounded queries.
- URL params are parsed server-side with `jobFiltersSchema.parse` — invalid values fall back to defaults.

### Tests
- `npm run type-check` — all files pass strict TypeScript.
- `npm run lint` — no ESLint warnings.
- `npm run db:seed` then visit `/jobs` — 6 seeded jobs visible with filters working.

---

## Milestone 3: Dashboard

### Acceptance Criteria
- Recruiter dashboard renders real data from the database with no placeholder text.
- Six stat cards: Total Jobs, Open Positions, Candidates, Scheduled Interviews, Offers, Hires (includes conversion rate).
- Hiring funnel bar chart shows application counts per stage as a proportional progress bar list.
- Monthly Activity bar chart shows applications vs hires for the last 6 months (Recharts `BarChart`).
- Candidate Sources donut chart groups candidates by `source` field (Recharts `PieChart`).
- Recent Applications table shows the 10 most recent applications with candidate name, job, stage badge, and relative time.
- Upcoming Interviews list shows the next 8 scheduled interviews sorted by `scheduledAt` with type icon, interviewer, and duration.
- All sections use React `Suspense` with skeleton loaders; independent sections fetch in parallel on the server.
- A `loading.tsx` route segment provides instant page-level skeleton feedback.
- Page data revalidates every 120 seconds.
- Every chart and table has accessible `role`, `aria-label`, or semantic HTML.
- Empty states are shown for all widgets when there is no data.
- No blank screens, no infinite spinners.
- Mobile-first layout: stats 2-col → 3-col → 6-col, charts 1-col → 3-col, tables 1-col → 2-col.
- Dark mode compatible (uses CSS custom properties, no hardcoded colours).

### Affected Files
- `plan.md`
- `src/server/actions/dashboard.ts`
- `src/features/dashboard/components/stat-card.tsx`
- `src/features/dashboard/components/hiring-funnel-chart.tsx`
- `src/features/dashboard/components/monthly-hiring-chart.tsx`
- `src/features/dashboard/components/candidate-sources-chart.tsx`
- `src/features/dashboard/components/recent-applications-table.tsx`
- `src/features/dashboard/components/upcoming-interviews-table.tsx`
- `src/features/dashboard/components/dashboard-stats-grid.tsx`
- `src/features/dashboard/components/dashboard-charts-row.tsx`
- `src/features/dashboard/components/dashboard-tables-row.tsx`
- `src/features/dashboard/components/index.ts`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/loading.tsx`

### Edge Cases
- No organization: stats action returns a `success: false` error, card shows an inline error alert.
- Zero data: all charts and tables show accessible empty states rather than broken renders.
- Recharts renders inside `<ResponsiveContainer>`; no server-side rendering issues (all chart components are `'use client'`).
- `hiredAt` field is used for monthly hire counts so hires are counted in the correct calendar month.
- Candidate source can be `null`; displayed as `"Unknown"` in the chart.

### Tests
- `npm run type-check` — all dashboard files pass strict TypeScript.
- `npm run lint` — no ESLint warnings on new files.
- `npm run db:seed` followed by visiting `/dashboard` should show populated charts and tables.

---

## Milestone 2: Authentication and RBAC

### Acceptance Criteria
- Auth.js is wired through the App Router route handler.
- Credentials, Google OAuth, and GitHub OAuth providers are configured.
- Signup, login, logout, forgot password, reset password, and email verification flows exist.
- Password hashes use bcrypt cost 12 or greater.
- Sessions include user id, role, and organization id.
- Credential login requires an active, email-verified user.
- RBAC permissions cover Super Admin, Recruiter, Hiring Manager, Interviewer, and Viewer.
- Server-side helpers enforce authentication, role checks, permission checks, and organization ownership.
- Auth mutations validate with Zod, create audit logs where relevant, and apply basic rate limiting.

### Affected Files
- `src/lib/auth.ts`
- `src/lib/auth-utils.ts`
- `src/lib/permissions.ts`
- `src/lib/rate-limit.ts`
- `src/lib/email.ts`
- `src/types/auth.ts`
- `src/types/next-auth.d.ts`
- `src/validators/auth.ts`
- `src/server/actions/auth.ts`
- `src/proxy.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/auth/**`
- `src/features/auth/components/**`
- `tests/unit/validators/auth.test.ts`

### Edge Cases
- Existing email registration is rejected without leaking extra account data.
- Forgot-password always returns a generic success state to reduce email enumeration risk.
- Expired, reused, or malformed reset and verification tokens fail safely.
- Inactive users cannot sign in.
- Repeated auth attempts are throttled per email and request origin.
- Super Admin can cross organization boundaries only through explicit server-side checks.

### Tests
- `npm run type-check`
- `npm test`
- `npx vitest run tests/unit/smoke.test.ts`

---

## Milestone 10: Testing

### Acceptance Criteria
- **Unit tests** cover validators (auth, job, candidate, interview), business logic (permissions, rate-limiting, pipeline stages, analytics calculations), and utility functions. Zero external dependencies in unit tests.
- **Integration tests** cover all server actions (auth, jobs, candidates, pipeline, interviews) with DB and auth fully mocked via `vi.hoisted()`. Each test asserts correct behavior, error paths, activity/audit logging, and RBAC permission enforcement.
- **E2E tests** cover critical flows (signup, login, logout, route protection, create job, create candidate, pipeline board, schedule interview, dashboard) using Playwright with the seeded demo account.
- All 16 Vitest test files pass (`npm test` runs clean).
- Vitest config includes integration tests alongside unit tests; E2E tests excluded (run separately via `npm run test:e2e`).
- Coverage thresholds set: lines ≥ 60%, functions ≥ 60%, branches ≥ 50%.
- `tests/setup.ts` correctly extends `expect` with `@testing-library/jest-dom` matchers and seeds required environment variables.
- Mock infrastructure: `src/__mocks__/@prisma/client.ts` (Prisma enums), `src/__mocks__/next/cache.ts`, `src/__mocks__/next/headers.ts`, `src/__mocks__/next/server.ts`, `src/__mocks__/next-auth.ts` — all prevent real DB/network connections during tests.

### Affected Files
- `vitest.config.ts` — updated to include integration tests, add module aliases for mocks, set coverage thresholds
- `tests/setup.ts` — jest-dom matchers + env var injection
- `tests/unit/smoke.test.ts` — existing
- `tests/unit/lib/utils.test.ts` — cn() utility
- `tests/unit/lib/permissions.test.ts` — RBAC permission helper functions
- `tests/unit/lib/auth-utils.test.ts` — role permission map coverage
- `tests/unit/lib/rate-limit.test.ts` — rate limiter window/reset logic
- `tests/unit/lib/pipeline.test.ts` — PIPELINE_STAGES order, STAGE_LABELS, STAGE_CONFIG
- `tests/unit/lib/analytics.test.ts` — RANGE_LABELS, conversion rate, time-to-hire calculation
- `tests/unit/validators/auth.test.ts` — existing + comprehensive
- `tests/unit/validators/job.test.ts` — createJobSchema, updateJobSchema, jobFiltersSchema
- `tests/unit/validators/candidate.test.ts` — createCandidateSchema, updateCandidateSchema, candidateFiltersSchema
- `tests/unit/validators/interview.test.ts` — createInterviewSchema, updateInterviewSchema
- `tests/integration/actions/auth.test.ts` — signUpAction, forgotPasswordAction, resetPasswordAction, verifyEmailAction
- `tests/integration/actions/jobs.test.ts` — getJobsAction, getJobAction, createJobAction, updateJobAction, deleteJobAction, archiveJobAction
- `tests/integration/actions/candidates.test.ts` — full CRUD + notes + status change
- `tests/integration/actions/pipeline.test.ts` — getPipelineAction, moveApplicationAction, rejectApplicationAction, getPipelineJobsAction
- `tests/integration/actions/interviews.test.ts` — full lifecycle including cancel, no-show, feedback, delete
- `tests/e2e/auth.spec.ts` — login, register, forgot password, logout, route guards
- `tests/e2e/dashboard.spec.ts` — stat cards, charts, navigation
- `tests/e2e/jobs.spec.ts` — list, search, create, detail
- `tests/e2e/candidates.spec.ts` — list, search, add, detail with tabs
- `tests/e2e/pipeline.spec.ts` — board columns, card rendering, job filter
- `tests/e2e/interviews.spec.ts` — list, calendar tab, schedule dialog
- `src/__mocks__/@prisma/client.ts` — updated with all enums
- `src/__mocks__/next/cache.ts` — new
- `src/__mocks__/next/headers.ts` — new
- `src/__mocks__/next/server.ts` — new
- `src/__mocks__/next-auth.ts` — new

### Edge Cases
- Vitest globals (`describe`, `expect`, `it`, `beforeEach`, `afterEach`, `vi`) are injected globally — explicit vitest imports in test files cause `expect.config` crash; removed from all non-integration test files.
- `vi.hoisted()` required in integration tests so mock factories can reference shared test data before hoisting.
- `next-auth` transitively imports `next/server` without `.js` extension (bare ESM specifier) — resolved by aliasing both in `vitest.config.ts` resolve.alias.
- `mockReset: true` resets `mockResolvedValueOnce` queues between tests; tests that use sequential `Once` calls must be isolated or use `mockResolvedValue` per-test.
- `deleteCandidateAction` requires `candidates:delete` permission (SUPER_ADMIN only) — integration test explicitly sets `mockResolvedValueOnce` with SUPER_ADMIN user.
- Auth action internal `createEmailVerificationToken` calls `db.$transaction([deleteMany, create])` — mock's `$transaction` must call `Promise.all(ops)` on array inputs.
- `verifyEmailAction` checks `identifier.startsWith('email-verification:')` — test fixtures must use this exact prefix.
- E2E tests require the dev server running and the database seeded (`npm run db:seed`).

### Tests
- `npm test` → all 287 unit + integration tests pass.
- `npm run test:coverage` → generates HTML report in `coverage/`.
- `npm run test:e2e` → Playwright suite (requires `npm run dev` running and seeded DB).
- `npm run type-check` → all test files pass strict TypeScript.
