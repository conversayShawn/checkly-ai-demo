import { expect, test } from '@playwright/test'

// Covers: MONITORING.md §1.8 — Customer can complete checkout and see order confirmation
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Checkout flow', () => {
  test('Complete a purchase', async ({ page }) => {
    // Add a product to cart
    await page.goto('/product/OLJCESPC7Z', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Add To Cart/ }).click()
    await page.waitForURL('/cart')

    // Verify cart page with product and shipping address form
    await expect(page.getByRole('heading', { name: 'Shopping Cart', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible()

    // Verify payment section is visible
    await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible()

    // Place the order
    await page.getByRole('button', { name: 'Place Order' }).click()

    // Verify order confirmation
    await expect(page.getByRole('heading', { name: 'Your order is complete!' })).toBeVisible()
  })
})
