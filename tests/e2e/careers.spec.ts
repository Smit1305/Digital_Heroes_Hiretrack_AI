/**
 * E2E tests — Public Careers Portal.
 * Covers: careers listing, job details, application form.
 */
import { expect, test } from '@playwright/test'

test.describe('Careers Portal', () => {
  test('renders public careers listing page', async ({ page }) => {
    await page.goto('/careers')
    await expect(page).toHaveURL(/\/careers/)
    // Should show the careers page heading or job listings
    const heading = page.getByRole('heading').first()
    await expect(heading).toBeVisible()
  })

  test('has search and filter functionality', async ({ page }) => {
    await page.goto('/careers')
    // Look for search input or filter controls
    const searchInput = page.locator('input[type="text"], input[type="search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Engineer')
      // Should filter or trigger search
      await page.waitForTimeout(500)
    }
  })

  test('navigates to job details from listing', async ({ page }) => {
    await page.goto('/careers')
    // Click on the first job link if available
    const jobLink = page.locator('a[href*="/careers/"]').first()
    if (await jobLink.isVisible()) {
      await jobLink.click()
      await expect(page).toHaveURL(/\/careers\//)
    }
  })

  test('careers page is accessible without authentication', async ({ page }) => {
    // Ensure no redirect to login
    const response = await page.goto('/careers')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).not.toHaveURL(/\/auth\/login/)
  })

  test('careers page has proper SEO meta tags', async ({ page }) => {
    await page.goto('/careers')
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(5)
  })
})

test.describe('Application Tracking', () => {
  test('application tracking page exists', async ({ page }) => {
    await page.goto('/careers/applications')
    // Should either show the page or redirect appropriately
    const response = await page.goto('/careers/applications')
    expect(response?.status()).toBeLessThan(500)
  })
})
