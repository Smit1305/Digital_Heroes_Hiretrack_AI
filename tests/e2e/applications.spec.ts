import { expect, test } from '@playwright/test'

const DEMO_EMAIL = 'demo@hiretrack.ai'
const DEMO_PASSWORD = 'demo1234'

test.describe('Candidate & Offer Lifecycle E2E', () => {
  test('Candidate apply -> Recruiter offer -> Candidate accept flow', async ({ page }) => {
    // 1. Visit Careers list and click on first open role
    await page.goto('/careers')
    await page.waitForLoadState('networkidle')

    const firstJobLink = page.locator('h2.text-base a').first()
    await expect(firstJobLink).toBeVisible({ timeout: 12000 })
    const jobTitle = await firstJobLink.innerText()
    await firstJobLink.click()

    // 2. Job details page - Click Apply
    await page.waitForURL(/\/careers\/[^/]+\/jobs\/[^/]+$/)
    const applyLink = page.getByRole('link', { name: /apply for this job/i })
    await expect(applyLink).toBeVisible()
    await applyLink.click()

    // 3. Application Form
    await page.waitForURL(/\/careers\/[^/]+\/jobs\/[^/]+\/apply$/)
    const email = `candidate.${Date.now()}@example.com`
    const firstName = 'Jane'
    const lastName = 'Doe'

    await page.getByLabel(/first name/i).fill(firstName)
    await page.getByLabel(/last name/i).fill(lastName)
    await page.getByLabel(/email address/i).fill(email)
    await page.getByLabel(/phone number/i).fill('+15551234567')
    await page.getByLabel(/linkedin/i).fill('https://linkedin.com/in/janedoe-e2e')
    await page.getByLabel(/cover letter/i).fill('I am very interested in this opportunity.')

    // Upload dummy resume
    const fileInput = page.locator('input[type="file"]#resume-upload')
    await fileInput.setInputFiles({
      name: 'resume.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('E2E candidate resume content details.'),
    })

    // Wait for upload toast
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible({ timeout: 10000 })

    // Submit form
    await page.getByRole('button', { name: /submit application/i }).click()

    // Wait for success screen
    await expect(page.getByText(/application submitted/i)).toBeVisible({ timeout: 15000 })
    const trackingLinkEl = page.locator('a:has-text("careers/applications/")')
    await expect(trackingLinkEl).toBeVisible()
    const trackingUrl = await trackingLinkEl.getAttribute('href')
    expect(trackingUrl).not.toBeNull()

    // 4. Visit Tracking Portal as candidate
    await page.goto(trackingUrl!)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /application status/i })).toBeVisible()
    await expect(page.getByText(/Jane Doe/i)).toBeVisible()
    await expect(page.getByText(/applied/i).first()).toBeVisible()

    // 5. Sign in as recruiter to review and make offer
    await page.goto('/auth/login')
    await page.getByLabel(/email/i).fill(DEMO_EMAIL)
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/(dashboard|pipeline|jobs|candidates)/, { timeout: 15000 })

    // Search and open candidate profile
    await page.goto('/candidates')
    await page.waitForLoadState('networkidle')
    const searchCandidate = page.getByPlaceholder(/search/i)
    await searchCandidate.fill(email)
    await page.waitForTimeout(500) // wait for filter

    const candidateRow = page.locator('table tbody tr').first()
    await expect(candidateRow).toBeVisible()
    await candidateRow.click() // Open detail view

    // Candidate details page
    await page.waitForURL(/\/candidates\/[^/]+$/)
    const appsTab = page.getByRole('tab', { name: /applications/i })
    await appsTab.click()

    // Make offer
    const makeOfferBtn = page.getByRole('button', { name: /make formal job offer/i })
    await expect(makeOfferBtn).toBeVisible()
    await makeOfferBtn.click()

    // Fill offer dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel(/salary/i).fill('125000')

    // Select start date (e.g. 1st of next month)
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setDate(1)
    const yyyyMmDd = futureDate.toISOString().split('T')[0]
    await dialog.getByLabel(/start date/i).fill(yyyyMmDd)

    await dialog.getByLabel(/details/i).fill('Including standard health perks and stock options.')
    await dialog.getByRole('button', { name: /send job offer/i }).click()

    // Verify dialog closed and offer shows as PENDING
    await expect(dialog).not.toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/offer status/i)).toBeVisible()
    await expect(page.getByText(/pending/i).first()).toBeVisible()

    // 6. Sign out recruiter
    await page.goto('/dashboard')
    await page.locator('button[aria-label*="user"], button[aria-label*="profile"], button:has(.rounded-full)').first().click()
    const signOutBtn = page.getByRole('menuitem', { name: /sign out/i }).or(page.getByText(/sign out/i))
    await signOutBtn.click()
    await page.waitForURL(/\/auth\/login|^\/$/)

    // 7. Go back to tracking page as candidate to accept offer
    await page.goto(trackingUrl!)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/review your formal offer/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/USD 125,000/i)).toBeVisible()

    // Click Accept Offer
    await page.getByRole('button', { name: /accept offer/i }).click()

    // Verify accept successful
    await expect(page.getByText(/you have accepted this offer/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/hired/i).first()).toBeVisible()
  })
})
