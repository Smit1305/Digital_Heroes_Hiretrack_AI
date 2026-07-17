'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Animated SVG illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <svg
          width="280"
          height="200"
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
          aria-hidden="true"
        >
          {/* Floor shadow */}
          <ellipse cx="140" cy="180" rx="100" ry="10" className="fill-muted/60" />

          {/* Left "4" */}
          <motion.g
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          >
            <rect x="20" y="50" width="18" height="100" rx="4" className="fill-primary/20" />
            <rect x="20" y="100" width="65" height="18" rx="4" className="fill-primary/20" />
            <rect x="67" y="30" width="18" height="130" rx="4" className="fill-primary/30" />
          </motion.g>

          {/* Center "0" — magnifying glass */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
          >
            <circle cx="140" cy="90" r="40" strokeWidth="16" className="stroke-primary/20 fill-none" />
            <line x1="168" y1="120" x2="195" y2="155" strokeWidth="14" strokeLinecap="round" className="stroke-primary/30" />
            {/* Sparkle inside magnifying glass */}
            <motion.circle
              cx="130"
              cy="80"
              r="5"
              className="fill-primary/40"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.circle
              cx="148"
              cy="75"
              r="3"
              className="fill-primary/30"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            />
          </motion.g>

          {/* Right "4" */}
          <motion.g
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          >
            <rect x="202" y="50" width="18" height="100" rx="4" className="fill-primary/20" />
            <rect x="202" y="100" width="65" height="18" rx="4" className="fill-primary/20" />
            <rect x="248" y="30" width="18" height="130" rx="4" className="fill-primary/30" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="max-w-md"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Try searching or head back to the dashboard.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go back
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      </motion.div>

      {/* Keyboard shortcut hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-10 flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        Press{' '}
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl+K
        </kbd>{' '}
        to search everything
      </motion.p>
    </div>
  )
}
