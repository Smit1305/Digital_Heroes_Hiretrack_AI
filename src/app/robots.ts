import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

/**
 * Next.js App Router robots.txt — automatically served at /robots.txt
 * Dashboard, API, and auth callback routes are disallowed for crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/faq', '/docs', '/careers'],
        disallow: [
          '/dashboard',
          '/jobs',
          '/candidates',
          '/pipeline',
          '/interviews',
          '/analytics',
          '/settings',
          '/onboarding',
          '/notifications',
          '/help',
          '/api/',
          '/auth/verify',
          '/auth/reset-password',
          '/auth/forgot-password',
          '/auth/error',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
