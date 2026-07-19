import type { NextConfig } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Content Security Policy directive map.
 * Kept permissive for development (unsafe-inline, blob:, data:).
 * Tighten script-src by adding hashes for production deployments.
 */
const cspHeader = [
  "default-src 'self'",
  // Scripts — allow self, inline (for Next.js hydration), and Google/GitHub OAuth redirects
  // unsafe-eval only in development (needed for hot-reload); removed in production
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''} https://accounts.google.com`,
  // Styles — allow self and inline (shadcn/ui uses inline styles)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images — allow self, data URIs, and blob for uploads
  "img-src 'self' data: blob: https:",
  // Connect — allow self and OAuth endpoints
  "connect-src 'self' https://accounts.google.com https://api.github.com",
  // Frames — disallow embedding; allow Google OAuth popup
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  // Media
  "media-src 'self' blob:",
  // Object
  "object-src 'none'",
  // Base URI — prevent base tag injection
  "base-uri 'self'",
  // Form action — restrict form targets
  "form-action 'self'",
  // Manifest
  "manifest-src 'self'",
  // Worker
  "worker-src 'self' blob:",
  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
]
  .join('; ')

const securityHeaders = [
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions policy — disable unnecessary browser APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // HSTS — only set in production
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: cspHeader.replace(/\n/g, ''),
  },
]

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  // Disable development indicators
  devIndicators: {
    buildActivity: false,
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Security headers applied to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Redirect /home → / for legacy links
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Redirect /pricing to register (no pricing page yet)
      {
        source: '/pricing',
        destination: '/auth/register',
        permanent: false,
      },
    ]
  },

  // Image optimisation — allow common hosting domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig
