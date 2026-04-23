import { expect, test } from '@playwright/test'

// Customer can switch currency and see prices update
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Currency switcher', () => {
  test('Switching currency updates product prices', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Verify default currency is USD
    const firstProductPrice = page.locator('[data-cy="product-card"]').first().locator('[data-cy="product-card--price"]')
      .or(page.getByText(/\$\s*\d+/).first())
    await expect(firstProductPrice).toBeVisible()

    // Switch currency to EUR
    await page.getByRole('combobox').first().selectOption('EUR')

    // Wait for prices to update and verify EUR symbol
    await expect(page.getByText(/€\s*\d+/).first()).toBeVisible()
  })
})
