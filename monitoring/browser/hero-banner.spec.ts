import { expect, test } from '@playwright/test'

// Customer can load the homepage and see featured products
// Referenced by monitoring/browser/browser.check.ts as a BrowserCheck entrypoint.
test('Hero banner is visible on homepage', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'The best telescopes to see the world closer' }),
  ).toBeVisible()
})
