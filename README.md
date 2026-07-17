# HireTrack AI — Modern Applicant Tracking System (ATS)

HireTrack AI is a fully featured, collaborative, production-ready applicant tracking system (ATS) built on Next.js 15, React 19, TypeScript, PostgreSQL, and Prisma. It is designed to assist recruiters and hiring managers in managing candidate funnels, scheduling interviews, and making data-driven decisions.

---

## 🚀 Key Features

- **Multi-Tenant Architecture**: Robust tenant grouping isolated around organizations.
- **Kanban Pipeline Board**: Drag-and-drop workflow columns powered by `@hello-pangea/dnd` to advance candidate applications.
- **Unified Interview Management**: Schedule, edit, cancel, or log feedback ratings with a calendar view.
- **Rich Analytics & Dashboard**: Instant visual charts representing candidate sources, funnel dropout rates, top hiring managers, and KPIs.
- **Role-Based Access Control (RBAC)**: Enforced system actions for Super Admins, Recruiters, Hiring Managers, and Interviewers.
- **Structured Observability**: Built-in JSON structured logging, full Sentry telemetry configurations, and Vercel Analytics.
- **Modern UI/UX**: Sleek shadcn/ui components, custom dark mode toggle, and micro-interactions powered by Framer Motion.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Database & ORM**: PostgreSQL, Prisma Client with `@prisma/adapter-pg`
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Auth.js (NextAuth v5 beta)
- **Validation**: Zod
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)
- **Observability**: Sentry, Vercel Analytics

---

## ⚙️ Environment Variables

Copy `.env.example` into a local `.env` and fill in the values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hiretrack_ai"
AUTH_SECRET="your-32-character-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPSTASH_REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_TOKEN="your-redis-token"
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="HireTrack AI <noreply@hiretrack.ai>"
```

Refer to [docs/deployment/vercel.md](docs/deployment/vercel.md) for production-specific variable structures.

---

## 🚦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Database
Apply migrations and compile the Prisma client:
```bash
npx prisma migrate dev
```

### 3. Seed Mock Data
Seed default accounts (admin, recruiter, candidate) and mock metrics:
```bash
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

---

## 🔑 Demo Access Accounts

Use these pre-configured credentials after seeding:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@hiretrack.ai` | `adminpassword123` | Acme Inc. |
| **Recruiter** | `recruiter@hiretrack.ai` | `recruiterpassword123` | Acme Inc. |
| **Candidate** | `candidate@hiretrack.ai` | `candidatepassword123` | Acme Inc. |

---

## 🐳 Docker Deployment

Orchestrate the app, postgres, and redis locally:
```bash
# Build and boot containers
docker-compose up -d --build

# Run migrations inside the app container
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npm run db:seed
```
See [docker/README.md](docker/README.md) for detailed docker commands.

---

## 🧪 Testing Suite

We maintain a strict testing coverage rule.

### Run Unit & Integration Tests
```bash
npm run test
```

### Run End-to-End Tests
```bash
npm run test:e2e
```

---

## 📄 License & Security

- Distributed under the [MIT License](LICENSE).
- Security policies and vulnerability disclosures are outlined in [SECURITY.md](SECURITY.md).
