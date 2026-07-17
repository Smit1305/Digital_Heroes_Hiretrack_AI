import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_URL: z.string().url('AUTH_URL must be a valid URL').optional(),

  // OAuth (optional, only required when providers are configured)
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('HireTrack AI'),

  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof envSchema>

// Validate and export environment variables
// Throws at startup if required variables are missing
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables. Check .env.example for required variables.')
}

export const env = parsed.data
