'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Wraps page content with a fluid slide/fade transition.
 * Uses AnimatePresence to orchestrate exit/entry transitions.
 * Respects prefers-reduced-motion to prevent accessibility issues.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={
          shouldReduceMotion
            ? { opacity: 1, transition: { duration: 0.18 } }
            : { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
        exit={
          shouldReduceMotion
            ? { opacity: 0, transition: { duration: 0.15 } }
            : { opacity: 0, y: -10, transition: { duration: 0.15, ease: [0.55, 0.055, 0.675, 0.19] } }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
