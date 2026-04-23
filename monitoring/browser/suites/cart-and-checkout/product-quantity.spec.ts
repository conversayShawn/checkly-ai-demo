import { expect, test } from '@playwright/test'

// Customer can select quantity > 1 and add to cart
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Product quantity selection', () => {
  test('Adding multiple quantities reflects in cart', async ({ page }) => {
    await page.goto('/product/OLJCESPC7Z', { waitUntil: 'domcontentloaded' })

    // Select quantity of 3 (second combobox — first is currency switcher)
    await page.getByRole('combobox').nth(1).selectOption('3')

    // Add to cart
    await page.getByRole('button', { name: /Add To Cart/ }).click()
    await page.waitForURL('/cart')

    // Verify cart page loads
    await expect(page.getByRole('heading', { name: 'Shopping Cart', exact: true })).toBeVisible()

    // Verify quantity shows 3
    await expect(page.getByText('3', { exact: true })).toBeVisible()

    // Verify total heading is visible
    await expect(page.getByRole('heading', { name: 'Total' })).toBeVisible()
  })
})
