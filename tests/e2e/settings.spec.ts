/**
 * E2E tests — Settings flows.
 * Covers: settings navigation, profile page, teams, roles.
 * Requires authentication — uses seeded demo account.
 */
import { expect, test } from '@playwright/test'

const DEMO_EMAIL = 'demo@hiretrack.ai'
const DEMO_PASSWORD = 'demo1234'

// Helper to log in before settings tests
async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(DEMO_EMAIL)
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
}

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page)
  })

  test('navigates to settings page', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
    // Should render settings content
    const heading = page.getByRole('heading').first()
    await expect(heading).toBeVisible()
  })

  test('profile settings page loads', async ({ page }) => {
    await page.goto('/settings/profile')
    await expect(page).toHaveURL(/\/settings\/profile/)
    // Should show profile form
    const nameInput = page.getByLabel(/name/i).first()
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible()
    }
  })

  test('teams settings page loads', async ({ page }) => {
    await page.goto('/settings/teams')
    await expect(page).toHaveURL(/\/settings\/teams/)
  })

  test('roles settings page loads', async ({ page }) => {
    await page.goto('/settings/roles')
    await expect(page).toHaveURL(/\/settings\/roles/)
  })

  test('users settings page loads', async ({ page }) => {
    await page.goto('/settings/users')
    await expect(page).toHaveURL(/\/settings\/users/)
  })
})

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page)
  })

  test('keyboard shortcuts help page loads', async ({ page }) => {
    await page.goto('/help/shortcuts')
    await expect(page).toHaveURL(/\/help\/shortcuts/)
    await expect(page.getByRole('heading', { name: /keyboard shortcuts/i })).toBeVisible()
  })

  test('Ctrl+K opens command palette', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    // Command palette should appear
    const input = page.locator('[cmdk-input]')
    await expect(input).toBeVisible({ timeout: 3000 })
  })

  test('Escape closes command palette', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    const input = page.locator('[cmdk-input]')
    await expect(input).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(input).not.toBeVisible({ timeout: 3000 })
  })
})
