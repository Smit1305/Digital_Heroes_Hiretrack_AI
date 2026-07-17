# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-17

### Added
- **Production Audit & Security Auditing**: Created `production-audit.md` and `security-audit.md` reports.
- **Docker Orchestration**: Configured multi-stage production `Dockerfile` (Node 20 Alpine) and local environment `docker-compose.yml` supporting postgres, redis, and app containers.
- **Strict Environment Checks**: Implemented Zod schemas in `src/lib/env.ts` to block application boots if required variables are missing.
- **Structured JSON Logging**: Created `src/lib/logger.ts` for unified JSON server-side logs and integrated `@sentry/nextjs` config hooks.
- **Vercel Analytics Integration**: Rendered analytics trackers inside the root HTML layout.
- **Target Seed Users**: Configured `prisma/seed.ts` to include requested SaaS seed accounts (`admin@hiretrack.ai`, `recruiter@hiretrack.ai`, `candidate@hiretrack.ai`).
- **CI/CD Pipelines**: Written workflows `.github/workflows/ci.yml`, `release.yml`, and `preview.yml` for automated testing, tagging, and builds.
- **Developer Guidelines**: Created templates for PR reviews, issue templates, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and the `LICENSE` document.

### Changed
- Replaced basic Next.js default welcome index page with the HireTrack AI landing layout.
- Augmented NextAuth callbacks and environment configurations for production safety.

---
[1.0.0]: https://github.com/google/hiretrack-ai/releases/tag/v1.0.0
