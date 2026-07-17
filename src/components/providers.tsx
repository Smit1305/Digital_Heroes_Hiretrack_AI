'use client'

import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes stale time
            gcTime: 10 * 60 * 1000,   // 10 minutes cache time
            retry: 1,
            refetchOnWindowFocus: false, // Prevent query refetch on window focus
            refetchOnMount: false,       // Prevent query refetch on component remount if data is stale
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>

      </QueryClientProvider>
    </SessionProvider>
  )
}
