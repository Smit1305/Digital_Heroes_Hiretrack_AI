import { JsonLd } from '@/components/json-ld'
import { Providers } from '@/components/providers'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hiretrack.ai'

export const metadata: Metadata = {
  // Template applied to every page's <title>
  title: {
    default: 'HireTrack AI — Modern Applicant Tracking System',
    template: '%s — HireTrack AI',
  },
  description:
    'HireTrack AI is a collaborative ATS for modern hiring teams. Track candidates, schedule interviews, manage your pipeline, and make data-driven hiring decisions.',
  keywords: [
    'ATS',
    'applicant tracking system',
    'recruiting software',
    'hiring platform',
    'HR software',
    'candidate management',
    'interview scheduling',
    'hiring pipeline',
    'kanban',
    'analytics',
  ],
  authors: [{ name: 'HireTrack AI', url: APP_URL }],
  creator: 'HireTrack AI',
  publisher: 'HireTrack AI',

  // Canonical base — all page-level alternates.canonical extend this
  metadataBase: new URL(APP_URL),

  // Canonical for root
  alternates: { canonical: APP_URL },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'HireTrack AI',
    title: 'HireTrack AI — Modern Applicant Tracking System',
    description:
      'Collaborative ATS for modern hiring teams. Track candidates, schedule interviews, and make better hiring decisions.',
    images: [
      {
        url: `${APP_URL}/og-home.png`,
        width: 1200,
        height: 630,
        alt: 'HireTrack AI — Modern Applicant Tracking System',
        type: 'image/png',
      },
    ],
  },

  // Twitter / X card
  twitter: {
    card: 'summary_large_image',
    site: '@hiretrackAI',
    creator: '@hiretrackAI',
    title: 'HireTrack AI — Modern Applicant Tracking System',
    description: 'Collaborative ATS for modern hiring teams.',
    images: [
      {
        url: `${APP_URL}/og-home.png`,
        alt: 'HireTrack AI',
      },
    ],
  },

  // Robots — all public pages are indexable by default;
  // individual protected routes override this with noindex
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // App install metadata
  applicationName: 'HireTrack AI',
  category: 'business',

  // Verification placeholders (replace with real tokens)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? '',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Ensure interactive elements meet WCAG 44px minimum on mobile
  minimumScale: 1,
}

// Organization-level JSON-LD — rendered on every page
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HireTrack AI',
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  sameAs: [
    'https://github.com/your-org/hiretrack-ai',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Google Fonts (already handled by next/font, belt-and-suspenders) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <JsonLd data={orgJsonLd} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
