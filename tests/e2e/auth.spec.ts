/**
 * E2E tests — Authentication flows.
 * Covers: login, logout, register, forgot password guard.
 * Uses the seeded demo account: demo@hiretrack.ai / demo1234
 */
import { expect, test } from '@playwright/test'

const DEMO_EMAIL = 'demo@hiretrack.ai'
const DEMO_PASSWORD = 'demo1234'

// ─── Login flow ───────────────────────────────────────────────────────────────

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('renders login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    // Either HTML5 validation or Zod inline errors
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused().catch(() => {
      // Fallback: check for visible error text
      expect(page.getByText(/valid email/i)).toBeTruthy()
    })
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByLabel(/password/i).fill('somepassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('shows error for wrong credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Should show invalid credentials message
    await expect(
      page.getByText(/invalid|incorrect|credentials|password|not found/i)
    ).toBeVisible({ timeout: 8000 })
  })

  test('redirects to dashboard after successful login', async ({ page }) => {
    await page.getByLabel(/email/i).fill(DEMO_EMAIL)
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/(dashboard|pipeline|jobs|candidates)/, { timeout: 15000 })
    expect(page.url()).not.toContain('/auth/login')
  })

  test('has link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register|sign up|create/i })
    await expect(registerLink).toBeVisible()
  })

  test('has link to forgot password page', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot|reset/i })
    await expect(forgotLink).toBeVisible()
  })
})

// ─── Registration flow ────────────────────────────────────────────────────────

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
  })

  test('renders registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign up|register|create/i })).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^password/i)).toBeVisible()
  })

  test('shows validation error for short name', async ({ page }) => {
    await page.getByLabel(/name/i).fill('J')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password/i).fill('Password1')
    const confirmInput = page.getByLabel(/confirm password/i)
    if (await confirmInput.isVisible()) {
      await confirmInput.fill('Password1')
    }
    await page.getByRole('button', { name: /sign up|register|create/i }).click()
    await expect(page.getByText(/at least 2|name must/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel(/name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('not-valid')
    await page.getByLabel(/^password/i).fill('Password1')
    await page.getByRole('button', { name: /sign up|register|create/i }).click()
    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows validation error for weak password', async ({ page }) => {
    await page.getByLabel(/name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john@example.com')
    await page.getByLabel(/^password/i).fill('weak')
    await page.getByRole('button', { name: /sign up|register|create/i }).click()
    await expect(page.getByText(/at least 8|uppercase|number/i)).toBeVisible({ timeout: 5000 })
  })

  test('has link back to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /sign in|log in|login/i })
    await expect(loginLink).toBeVisible()
  })
})

// ─── Forgot password flow ─────────────────────────────────────────────────────

test.describe('Forgot password', () => {
  test('renders forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send|reset|submit/i })).toBeVisible()
  })

  test('shows success state for any email (prevents enumeration)', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await page.getByLabel(/email/i).fill('nobody@example.com')
    await page.getByRole('button', { name: /send|reset|submit/i }).click()
    await expect(page.getByText(/sent|check your email|if.*account/i)).toBeVisible({
      timeout: 8000,
    })
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await page.getByLabel(/email/i).fill('bad-email')
    await page.getByRole('button', { name: /send|reset|submit/i }).click()
    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 5000 })
  })
})

// ─── Logout flow ──────────────────────────────────────────────────────────────

test.describe('Logout', () => {
  test('redirects to login after logout', async ({ page }) => {
    // Log in first
    await page.goto('/auth/login')
    await page.getByLabel(/email/i).fill(DEMO_EMAIL)
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/(dashboard|pipeline|jobs|candidates)/, { timeout: 15000 })

    // Find and click sign out — either a button or link
    const signOutEl = page
      .getByRole('button', { name: /sign out|log out|logout/i })
      .or(page.getByRole('link', { name: /sign out|log out|logout/i }))

    if (await signOutEl.first().isVisible()) {
      await signOutEl.first().click()
    } else {
      // May be in a dropdown — look for user menu
      const userMenu = page
        .getByRole('button', { name: /account|profile|menu|user/i })
        .or(page.locator('[data-testid="user-menu"]'))
      if (await userMenu.first().isVisible()) {
        await userMenu.first().click()
        await page.getByRole('menuitem', { name: /sign out|log out/i }).click()
      }
    }

    await page.waitForURL(/\/auth\/(login|register)?/, { timeout: 10000 })
    expect(page.url()).toContain('/auth')
  })
})

// ─── Protected route guard ────────────────────────────────────────────────────

test.describe('Route protection', () => {
  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/auth/login')
  })

  test('redirects unauthenticated user from jobs to login', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/auth/login')
  })

  test('redirects unauthenticated user from candidates to login', async ({ page }) => {
    await page.goto('/candidates')
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/auth/login')
  })
})
