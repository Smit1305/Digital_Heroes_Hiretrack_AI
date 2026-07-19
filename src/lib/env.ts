import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/hiretrack'),

  // Auth (NextAuth v5 and traditional names)
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters').optional().default('fallback-secret-for-build-step-min-32-chars'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional().default('fallback-secret-for-build-step-min-32-chars'),
  AUTH_URL: z.string().url('AUTH_URL must be a valid URL').optional(),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),

  // OAuth Google
  AUTH_GOOGLE_ID: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OAuth GitHub
  AUTH_GITHUB_ID: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Vercel Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Upstash Redis
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),

  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://digital-heroes-hiretrack-ai.vercel.app'),
  NEXT_PUBLIC_APP_NAME: z.string().default('HireTrack AI'),

  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof envSchema>

// Pre-process and normalize environment variables for auth compatibility
const rawEnv = { ...process.env }

// Fallbacks for NextAuth keys
rawEnv.AUTH_SECRET = rawEnv.AUTH_SECRET || rawEnv.NEXTAUTH_SECRET || 'fallback-secret-for-build-step-min-32-chars'
rawEnv.NEXTAUTH_SECRET = rawEnv.NEXTAUTH_SECRET || rawEnv.AUTH_SECRET || 'fallback-secret-for-build-step-min-32-chars'
rawEnv.AUTH_URL = rawEnv.AUTH_URL || rawEnv.NEXTAUTH_URL
rawEnv.NEXTAUTH_URL = rawEnv.NEXTAUTH_URL || rawEnv.AUTH_URL

// Fallbacks for Google OAuth keys
rawEnv.AUTH_GOOGLE_ID = rawEnv.AUTH_GOOGLE_ID || rawEnv.GOOGLE_CLIENT_ID
rawEnv.GOOGLE_CLIENT_ID = rawEnv.GOOGLE_CLIENT_ID || rawEnv.AUTH_GOOGLE_ID
rawEnv.AUTH_GOOGLE_SECRET = rawEnv.AUTH_GOOGLE_SECRET || rawEnv.GOOGLE_CLIENT_SECRET
rawEnv.GOOGLE_CLIENT_SECRET = rawEnv.GOOGLE_CLIENT_SECRET || rawEnv.AUTH_GOOGLE_SECRET

// Fallbacks for GitHub OAuth keys
rawEnv.AUTH_GITHUB_ID = rawEnv.AUTH_GITHUB_ID || rawEnv.GITHUB_CLIENT_ID
rawEnv.GITHUB_CLIENT_ID = rawEnv.GITHUB_CLIENT_ID || rawEnv.AUTH_GITHUB_ID
rawEnv.AUTH_GITHUB_SECRET = rawEnv.AUTH_GITHUB_SECRET || rawEnv.GITHUB_CLIENT_SECRET
rawEnv.GITHUB_CLIENT_SECRET = rawEnv.GITHUB_CLIENT_SECRET || rawEnv.AUTH_GITHUB_SECRET

// Validate and export environment variables
const parsed = envSchema.safeParse(rawEnv)

if (!parsed.success) {
  console.warn('⚠️ Invalid or missing environment variables during env validation:')
  console.warn(parsed.error.flatten().fieldErrors)
}

const data = parsed.success ? parsed.data : (rawEnv as unknown as Env)

export const env = data

