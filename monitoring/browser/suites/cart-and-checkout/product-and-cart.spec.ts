import { expect, test } from '@playwright/test'

// Covers: MONITORING.md §1.5 — Customer can add a product to the cart
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Product browsing and cart', () => {
  test('Navigate to a product and add to cart', async ({ page }) => {
    // Navigate to a product page directly
    await page.goto('/product/OLJCESPC7Z', { waitUntil: 'domcontentloaded' })

    // Verify Add To Cart button is available
    await expect(page.getByRole('button', { name: /Add To Cart/ })).toBeVisible()

    // Add to cart
    await page.getByRole('button', { name: /Add To Cart/ }).click()
    await page.waitForURL('/cart')

    // Verify product appears in cart
    await expect(page.getByText('National Park Foundation Explorascope')).toBeVisible()

    // Verify we land on the cart page
    await expect(page.getByRole('heading', { name: 'Shopping Cart', exact: true })).toBeVisible()
  })
})
