# Vercel Production Deployment Guide — HireTrack AI

This guide walks you through deploying **HireTrack AI** to Vercel, integrating cloud databases, setting up Redis caching, and securing your production application.

---

## 1. Prerequisites

Before starting, ensure you have active accounts for:
- [Vercel](https://vercel.com)
- [Neon](https://neon.tech) or [Supabase](https://supabase.com) (PostgreSQL database)
- [Upstash](https://upstash.com) (Redis cache and rate limiting)
- [Resend](https://resend.com) (Email notifications)

---

## 2. Database Integration

### Setup a Serverless PostgreSQL Database
We recommend using **Neon** or **Supabase** for production-grade serverless PostgreSQL.

1. Create a database instance in Neon or Supabase.
2. Retrieve the transaction connection string (e.g. `postgresql://user:password@host/dbname?sslmode=require`).
3. Store this value. You will use it as your `DATABASE_URL` environment variable.

---

## 3. Caching & Rate Limiting (Upstash Redis)

1. Create a serverless Redis database in Upstash.
2. Copy the **Redis URL** (`rediss://...`) and the **Rest Token**.
3. These will be mapped to `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` on Vercel.

---

## 4. Vercel Deployment Setup

### Step 1: Create a New Project
1. Import your HireTrack AI repository into Vercel.
2. Select **Next.js** as the Framework Preset.

### Step 2: Configure Build & Install Settings
Keep the defaults:
- **Build Command**: `npm run build`
- **Install Command**: `npm install` or `npm ci`
- **Output Directory**: `.next`

### Step 3: Set Environment Variables
Add the following keys in your Vercel Project Settings under Environment Variables:

| Environment Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Connection URL to your database. |
| `AUTH_SECRET` | Secret key for Auth.js. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_SECRET` | Duplicate of `AUTH_SECRET` for backwards compatibility. |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., `https://your-app.vercel.app`). |
| `UPSTASH_REDIS_URL` | Upstash Redis connection string. |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis access token. |
| `RESEND_API_KEY` | Resend API key for emailing candidate notifications. |
| `EMAIL_FROM` | Sender address (e.g. `HireTrack AI <noreply@yourdomain.com>`). |

---

## 5. Running Production Migrations & Seeding

Since Vercel is serverless, database migrations should be run from a local setup or a CI pipeline targeting the production database:

### Run Migrations
Run this command from your local machine (with `DATABASE_URL` set to your production database URL):
```bash
npx prisma migrate deploy
```

### Seed Initial Admin Account
To seed the initial admin account (`admin@hiretrack.ai`), run:
```bash
npm run db:seed
```
This inserts the `Acme Inc.` organization, admin, recruiter, and candidate mock data into the production database.

---

## 6. Sentry Integration (Optional)

1. Run `npx @sentry/wizard -i nextjs` locally or set the `SENTRY_AUTH_TOKEN` environment variable in Vercel to automatically compile and upload source maps during build step.
