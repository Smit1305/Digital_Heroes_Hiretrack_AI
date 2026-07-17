# Production Release Checklist — HireTrack AI

This checklist serves as the final release candidate sign-off for **HireTrack AI v1.0**. All items must be validated prior to staging or production mergers.

---

## 1. Build & Test Validations

- [ ] **Tests Pass**: `npm run test` executes successfully with all 338 tests passing.
- [ ] **Type Safety**: `npm run type-check` compiles with zero strict TypeScript errors.
- [ ] **Lint Verification**: `npm run lint` returns zero styling or syntax warnings.
- [ ] **Next.js Production Build**: `npm run build` compiles successfully, outputting optimized page chunks.

---

## 2. Infrastructure & Docker Readiness

- [ ] **Multi-stage Dockerfile**: Verified multi-stage Docker build compiles using `docker build -t hiretrack-ai .` successfully.
- [ ] **Orchestration**: Verified `docker-compose up -d` boots Next.js, Postgres, and Redis with correct networks, volumes, and health indicators.
- [ ] **Prisma Migrations**: Verified schema compatibility with `npx prisma migrate deploy`.

---

## 3. Environment & Configuration

- [ ] **Zod Env Schema Validation**: Checked that missing keys crash application boot immediately with a list of invalid fields.
- [ ] **Templates Updated**: `.env.example` and `.env.production.example` are populated with placeholders matching Step 4.

---

## 4. Core SaaS Feature Flow Validations

- [ ] **Authentication**: Checked credentials login, registration, and logout flows. Verified secure cookie session storage.
- [ ] **RBAC (Role Based Access)**: Verified that VIEWER users cannot archive jobs, delete candidates, or submit interview scorecards (enforced on backend actions).
- [ ] **Candidate Pipelines**: Tested moving candidate applications along the 8 Kanban stages (Applied -> Screening -> Interview -> Technical -> HR -> Offer -> Hired -> Rejected).
- [ ] **Interview Scheduling**: Tested scheduling new video/phone panels, editing times, and marking completion statuses.
- [ ] **Scorecards**: Verified scorecards save and compute ratings.
- [ ] **Analytics Engine**: Checked the visual widgets ( funnels, lines, source donuts) load correctly on the dashboard.

---

## 5. Security & Performance Verification

- [ ] **Security Headers**: Verified headers `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy` are returned.
- [ ] **Structured Logging**: Inspected console logs to confirm they output in JSON containing level and metadata fields.
- [ ] **Sentry Error Tracking**: Verified Sentry config files are in place.
- [ ] **SEO & Metadata**: Sitemap and robots.txt are active and return valid XML/text indexes.
