import { headers } from 'next/headers'

/**
 * Dynamically resolves the public base URL of the application.
 * Priority order:
 * 1. Configured NEXT_PUBLIC_APP_URL / AUTH_URL if it's a production URL
 * 2. Vercel deployment variables (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL)
 * 3. Request headers (x-forwarded-host / host)
 * 4. Configured NEXT_PUBLIC_APP_URL / AUTH_URL fallback
 * 5. Localhost fallback
 */
export async function getAppBaseUrl(path: string = ''): Promise<string> {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''

  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL
  if (envUrl && !envUrl.includes('localhost')) {
    const formatted = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`
    return `${formatted.replace(/\/$/, '')}${cleanPath}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}${cleanPath}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}${cleanPath}`
  }

  try {
    const headerStore = await headers()
    const host = headerStore.get('x-forwarded-host') || headerStore.get('host')
    const proto = headerStore.get('x-forwarded-proto') || (host && !host.includes('localhost') ? 'https' : 'http')
    if (host) {
      return `${proto}://${host.replace(/\/$/, '')}${cleanPath}`
    }
  } catch {
    // Suppress error if headers() is called outside request context
  }

  if (envUrl) {
    const formatted = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`
    return `${formatted.replace(/\/$/, '')}${cleanPath}`
  }

  return `http://localhost:3000${cleanPath}`
}
