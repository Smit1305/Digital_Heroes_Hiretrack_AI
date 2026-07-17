/**
 * E2E tests — Jobs CRUD.
 * Requires the app to be running with seeded demo data.
 */
import { expect, test } from '@playwright/test'

const DEMO_EMAIL = 'demo@hiretrack.ai'
const DEMO_PASSWORD = 'demo1234'

// ─── Helper: log in before each test ─────────────────────────────────────────

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(DEMO_EMAIL)
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(dashboard|pipeline|jobs|candidates)/, { timeout: 15000 })
}

// ─── Jobs list ────────────────────────────────────────────────────────────────

test.describe('Jobs list', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')
  })

  test('renders the jobs page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /jobs/i })).toBeVisible()
  })

  test('shows seeded job listings', async ({ page }) => {
    // Seed script creates at least 6 jobs
    const jobCards = page.locator('[data-testid="job-card"]').or(
      page.locator('.job-card, article').filter({ hasText: /engineer|developer|manager/i })
    )
    await expect(jobCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('search input is visible', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))).toBeVisible()
  })

  test('shows empty state when search returns no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))
    await searchInput.fill('zzzzz_no_match_xyz')
    await page.waitForTimeout(400) // debounce
    await expect(page.getByText(/no jobs|no results|found nothing/i)).toBeVisible({ timeout: 8000 })
  })

  test('status filter dropdown is visible', async ({ page }) => {
    const filterEl = page
      .getByRole('combobox', { name: /status/i })
      .or(page.getByText(/all status|filter by status/i))
    await expect(filterEl.first()).toBeVisible()
  })
})

// ─── Create job ───────────────────────────────────────────────────────────────

test.describe('Create job', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')
  })

  test('opens create job dialog', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new job|create job|add job|post job/i })
    await expect(createBtn).toBeVisible()
    await createBtn.click()
    await expect(
      page.getByRole('dialog').or(page.locator('[role="dialog"]'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /new job|create job|add job|post job/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Click the submit button without filling any fields
    await dialog.getByRole('button', { name: /create|save|submit/i }).click()
    // Should show validation error for title
    await expect(dialog.getByText(/required|at least|title/i)).toBeVisible({ timeout: 5000 })
  })

  test('creates a new job successfully', async ({ page }) => {
    const uniqueTitle = `Test Job E2E ${Date.now()}`

    await page.getByRole('button', { name: /new job|create job|add job|post job/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Fill required fields
    await dialog.getByLabel(/title/i).fill(uniqueTitle)
    await dialog.getByLabel(/description/i).fill(
      'This is a test job created by the E2E test suite with enough description text.'
    )

    // Submit
    await dialog.getByRole('button', { name: /create|save|submit/i }).click()

    // Should close dialog and show success toast / new job card
    await expect(dialog).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 })
  })
})

// ─── Job detail ───────────────────────────────────────────────────────────────

test.describe('Job detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')
  })

  test('navigates to job detail page', async ({ page }) => {
    // Click first available job card or title link
    const firstJobLink = page
      .getByRole('link', { name: /engineer|developer|manager|designer/i })
      .first()
    
    if (await firstJobLink.isVisible({ timeout: 5000 })) {
      await firstJobLink.click()
      await page.waitForURL(/\/jobs\/[^/]+$/, { timeout: 10000 })
      await expect(page.getByRole('heading')).toBeVisible()
    } else {
      // Fallback: click a card directly
      await page.locator('article, [data-testid="job-card"]').first().click()
      await page.waitForURL(/\/jobs\//, { timeout: 10000 })
    }
  })
})
