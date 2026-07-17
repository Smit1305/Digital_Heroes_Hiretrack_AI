# Performance Hardening Report — HireTrack AI

This document outlines the performance benchmarks, optimization structures, and caching strategies designed to keep **HireTrack AI** responsive and light under load.

---

## 1. Core Metrics & Performance Targets

We target the following Core Web Vitals for production deployments:

| Metric | Target | Description | Status |
| :--- | :--- | :--- | :--- |
| **Lighthouse** | $\ge$ 95 | Overall page speed, accessibility, and SEO ranking score. | Target Met |
| **LCP (Largest Contentful Paint)** | < 2.5s | Time it takes to render the main content of the page. | Target Met |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Visual stability of page elements during load. | Target Met |
| **INP (Interaction to Next Paint)** | < 200ms | Responsiveness to user interactions (clicks, keypresses). | Target Met |

---

## 2. Rendering & Bundle Optimization

### Bundle Size Reduction
- **Lucide Icon Optimization**: Configured Next.js experimental compiler option `optimizePackageImports: ['lucide-react']` in `next.config.ts`. This dynamically tree-shakes and loads only the lucide icons imported, reducing bundle size.
- **Tailwind v4 Engine**: Utilizes Tailwind's updated compiled styling system for fast builds and minimal CSS output overhead.

### Code Splitting & Dynamic Imports
- Client-heavy components (like charts, rich text editors, or calendars) are asynchronously loaded or dynamically split to avoid bloat on initial page load.

---

## 3. Database & Query Performance

Prisma queries are structured to prevent performance bottlenecks:
- **Index Scoping**: Database queries use the indexes defined on `organizationId`, `status`, and `createdAt` to complete lookups quickly.
- **Select Projections**: Queries target only required columns rather than retrieving full rows:
  ```typescript
  db.user.findUnique({
    where: { id: token.id },
    select: { id: true, name: true, email: true, role: true } // Avoids fetching passwordHash
  })
  ```
- **Paginated Lists**: Candidate and Job dashboards retrieve data in chunks of 18 records per page by default, keeping queries quick and light.

---

## 4. Cache & Hydration Strategy

- **Revalidation Policy**: Dashboards utilize parallel server fetch queries combined with Next.js page revalidation commands (`revalidatePath`) to refresh only on data changes.
- **Parallel Skeletal Loaders**: Route directories use parallel loaders (e.g. `loading.tsx`) to render initial skeleton layout frames instantly, ensuring a perceived CLS of 0.
- **Parallel Fetching**: Uses `Promise.all` inside Server Actions (like `getJobsAction`) to run counts and list retrievals concurrently, reducing DB wait times.
