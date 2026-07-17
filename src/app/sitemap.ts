import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

/**
 * Next.js App Router sitemap — automatically served at /sitemap.xml
 * Only public, indexable pages are listed. Dashboard routes are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${APP_URL}/careers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/features`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/docs/getting-started`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/docs/features`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/docs/deployment`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${APP_URL}/docs/security`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${APP_URL}/auth/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/auth/register`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}

