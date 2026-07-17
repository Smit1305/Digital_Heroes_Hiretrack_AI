import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

// Extend vitest's expect with jest-dom matchers
expect.extend(matchers)

// ─── Environment variables required by env.ts ─────────────────────────────────
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hiretrack_test'
process.env.AUTH_SECRET = 'test-secret-at-least-32-characters-long!!'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
;(process.env as any).NODE_ENV = 'test'

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('127.0.0.1'),
  }),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))
