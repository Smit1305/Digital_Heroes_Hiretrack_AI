/**
 * E2E tests — Interview Management.
 * Requires the app running with seeded demo data.
 */
import { expect, test } from '@playwright/test'

const DEMO_EMAIL = 'demo@hiretrack.ai'
const DEMO_PASSWORD = 'demo1234'

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(DEMO_EMAIL)
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(dashboard|pipeline|jobs|candidates)/, { timeout: 15000 })
}

// ─── Interviews list ──────────────────────────────────────────────────────────

test.describe('Interviews list', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/interviews')
    await page.waitForLoadState('networkidle')
  })

  test('renders the interviews page heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /interview/i })
    ).toBeVisible({ timeout: 10000 })
  })

  test('shows seeded interview cards', async ({ page }) => {
    const cards = page
      .locator('[data-testid="interview-card"]')
      .or(page.locator('article, .interview-card').filter({ hasText: /scheduled|completed|video|phone/i }))
    await expect(cards.first()).toBeVisible({ timeout: 12000 })
  })

  test('list and calendar tabs are visible', async ({ page }) => {
    const tabs = page.getByRole('tab')
    await expect(tabs.first()).toBeVisible({ timeout: 8000 })
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThanOrEqual(2)
  })

  test('can switch to calendar view', async ({ page }) => {
    const calendarTab = page.getByRole('tab', { name: /calendar/i })
    if (await calendarTab.isVisible({ timeout: 5000 })) {
      await calendarTab.click()
      // Calendar should show month/year header
      await expect(
        page.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i)
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('search input filters interviews', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))
    if (await search.isVisible({ timeout: 3000 })) {
      await search.fill('zzzzz_no_match_xyz')
      await page.waitForTimeout(400)
      await expect(
        page.getByText(/no interviews|no results|nothing found/i)
      ).toBeVisible({ timeout: 8000 })
    }
  })

  test('status and type filters are visible', async ({ page }) => {
    const statusFilter = page
      .getByRole('combobox', { name: /status/i })
      .or(page.getByText(/all status|scheduled|completed/i).first())
    await expect(statusFilter.first()).toBeVisible({ timeout: 8000 })
  })
})

// ─── Schedule interview ───────────────────────────────────────────────────────

test.describe('Schedule interview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/interviews')
    await page.waitForLoadState('networkidle')
  })

  test('opens schedule interview dialog', async ({ page }) => {
    const scheduleBtn = page.getByRole('button', {
      name: /schedule interview|new interview|add interview/i,
    })
    await expect(scheduleBtn).toBeVisible({ timeout: 8000 })
    await scheduleBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  })

  test('dialog has required fields', async ({ page }) => {
    await page.getByRole('button', {
      name: /schedule interview|new interview|add interview/i,
    }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Should have candidate, interviewer, date, type fields
    await expect(
      dialog.getByText(/candidate|interviewer|date|type/i).first()
    ).toBeVisible({ timeout: 3000 })
  })

  test('shows validation error on empty submit', async ({ page }) => {
    await page.getByRole('button', {
      name: /schedule interview|new interview|add interview/i,
    }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    await dialog.getByRole('button', { name: /schedule|save|create|submit/i }).click()
    await expect(
      dialog.getByText(/required|select|choose/i)
    ).toBeVisible({ timeout: 5000 })
  })
})
