import { headers } from 'next/headers'

const LIVE_DOMAIN = 'https://digital-heroes-hiretrack-ai.vercel.app'

/**
 * Resolves the public production URL of the application.
 * Guaranteed to NEVER return localhost links for email verification.
 */
export async function getAppBaseUrl(path: string = ''): Promise<string> {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''

  // 1. Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('netlify.app')) {
    const formatted = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`
    return `${formatted.replace(/\/$/, '')}${cleanPath}`
  }

  // 2. Check Vercel system environment variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}${cleanPath}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}${cleanPath}`
  }

  // 3. Check request headers
  try {
    const headerStore = await headers()
    const host = headerStore.get('x-forwarded-host') || headerStore.get('host')
    if (host && !host.includes('localhost') && !host.includes('netlify.app')) {
      const proto = headerStore.get('x-forwarded-proto') || 'https'
      return `${proto}://${host.replace(/\/$/, '')}${cleanPath}`
    }
  } catch {
    // Non-request context
  }

  // 4. Always default to live production Vercel URL
  return `${LIVE_DOMAIN}${cleanPath}`
}
