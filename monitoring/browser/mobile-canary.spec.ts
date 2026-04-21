import { expect, test } from '@playwright/test'

// Covers: MONITORING.md §1.10 — Mobile viewport canary.
// Runs the same hero-visible assertion at a mobile viewport to catch CSS
// breakpoint regressions that desktop checks miss (hidden nav, hero wrap, etc).
test.use({ viewport: { width: 390, height: 844 } })

test('Homepage renders correctly on mobile', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'The best telescopes to see the world closer' }),
  ).toBeVisible()
})
