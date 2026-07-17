import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Run unit + integration tests (E2E runs separately via Playwright)
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    // Environment variables needed before any module is imported
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/hiretrack_test',
      AUTH_SECRET: 'test-secret-at-least-32-characters-long!!',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'test',
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'tests/e2e/**',
        'prisma/**',
        'src/**/*.d.ts',
        'src/app/**',
        'src/components/ui/**',
        'src/__mocks__/**',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },

    mockReset: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Redirect @prisma/client to the manual mock (no DB connection needed)
      '@prisma/client': resolve(__dirname, './src/__mocks__/@prisma/client.ts'),
      // Redirect next/cache so server actions don't blow up in jsdom
      'next/cache': resolve(__dirname, './src/__mocks__/next/cache.ts'),
      // Redirect next/headers
      'next/headers': resolve(__dirname, './src/__mocks__/next/headers.ts'),
      // next-auth pulls in next/server (without .js) which fails in vitest ESM
      'next/server': resolve(__dirname, './src/__mocks__/next/server.ts'),
      // Mock next-auth entirely so it doesn't try to load Next.js server internals
      'next-auth': resolve(__dirname, './src/__mocks__/next-auth.ts'),
    },
  },
})
