# Security Audit & Hardening Report — HireTrack AI

This document details the security posture of **HireTrack AI**, outlining defense mechanisms, access controls, input validations, and infrastructure hardening.

---

## 1. Authentication & Session Security

- **Framework**: Powered by **Auth.js (NextAuth v5)** utilizing JWT tokens for session verification.
- **Secure Cookies**: In production environments (`NODE_ENV=production`), cookie flags are automatically configured with `Secure`, `HttpOnly`, and `SameSite=Lax` to prevent cross-site scripting (XSS) and cross-site request forgery (CSRF) thefts.
- **Session Expiry**: Sessions expire after 30 days of inactivity, with session tokens updated daily.

---

## 2. Authorization & RBAC

- **Tenant Isolation**: Shared database schema with row-level organization isolation.
- **Cross-Org Gatekeeping**: Every query validates organization ownership:
  ```typescript
  // Enforces that the actor belongs to the resource organization
  await requireOrganization(resource.organizationId)
  ```
- **Granular Permissions**: Role-Based Access Control is enforced server-side inside actions and API handlers:
  - `requirePermission('jobs:create')` is verified prior to job insertions.
  - Read-only roles (`VIEWER`) are denied mutating privileges at the server-action level.

---

## 3. Threat Prevention

### CSRF Protection
- **Server Actions**: Next.js Server Actions have built-in origin checks. Next.js validates that the `Origin` header matches the host headers for all mutated actions, completely mitigating CSRF risks.
- **API Handlers**: A double-submit cookie CSRF validation logic is ready inside `src/lib/csrf.ts` and can be bound to endpoints handling raw POST payloads.

### SQL Injection Prevention
- All database queries are executed using **Prisma ORM**. Prisma automatically parameterizes all raw inputs, neutralizing SQL injection vectors entirely. No raw SQL concatenations are utilized in the application.

### XSS (Cross-Site Scripting)
- React automatically escapes variables in JSX before rendering them to the DOM, rendering script injection inputs harmless.
- Rich-text fields (such as job descriptions) are rendered safely without `dangerouslySetInnerHTML` unless explicitly sanitized.

---

## 4. Content Security Policy (CSP) & Headers

Next.js is configured with strict security response headers in `next.config.ts` (applied to all paths):
- **CSP (Content Security Policy)**: RESTRICTS script execution to `'self'`, google accounts (`https://accounts.google.com`), and local fonts. Inline styles are allowed for dynamic UI libraries (like shadcn/ui).
- **X-Frame-Options**: Set to `DENY` to prevent clickjacking attacks by blocking the page from rendering in frames/iframes.
- **X-Content-Type-Options**: Set to `nosniff` to prevent browsers from MIME-type sniffing.
- **Referrer Policy**: Configured to `strict-origin-when-cross-origin`.
- **HSTS (HTTP Strict Transport Security)**: Enabled in production to enforce HTTPS connections (`max-age=63072000`).

---

## 5. Rate Limiting

- Rate limiting is active on sensitive endpoints (e.g. credential authentication, password resets) using the utility `checkRateLimit` in `src/lib/rate-limit.ts`.
- **Production Integration**: If `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` are set, the application uses Redis for rate limit tracking across load-balanced instances, falling back to a thread-safe global Map in dev environments.
