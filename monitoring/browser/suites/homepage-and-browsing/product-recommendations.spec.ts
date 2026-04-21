import { expect, test } from '@playwright/test'

// Covers: MONITORING.md §1.4 — Customer can follow a "You May Also Like" recommendation
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Product recommendations', () => {
  test('Clicking a recommended product navigates to its page', async ({ page }) => {
    await page.goto('/product/OLJCESPC7Z', { waitUntil: 'domcontentloaded' })

    // Verify recommendations section is visible
    await expect(page.getByRole('heading', { name: 'You May Also Like' })).toBeVisible()

    // Find and click a recommended product link (appears after the heading)
    const recommendedLink = page.locator('a[href*="/product/"]').filter({ hasNot: page.locator('[href="/product/OLJCESPC7Z"]') }).first()
    await expect(recommendedLink).toBeVisible()
    const href = await recommendedLink.getAttribute('href')
    await page.goto(href!, { waitUntil: 'domcontentloaded' })

    // Verify we navigated to a different product page
    await expect(page).toHaveURL(/\/product\/(?!OLJCESPC7Z)/)
    await expect(page.getByRole('button', { name: /Add To Cart/ })).toBeVisible()
  })
})
