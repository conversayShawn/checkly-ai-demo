import { expect, test } from '@playwright/test'

// Customer can empty their cart
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Cart management', () => {
  test('Empty cart button clears all items', async ({ page }) => {
    // Add a product to cart
    await page.goto('/product/OLJCESPC7Z', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Add To Cart/ }).click()
    await page.waitForURL('/cart')

    // Verify cart has the product
    await expect(page.getByRole('heading', { name: 'Shopping Cart', exact: true })).toBeVisible()
    await expect(page.getByText('National Park Foundation Explorascope')).toBeVisible()

    // Click Empty Cart
    await page.getByRole('button', { name: 'Empty Cart' }).click()

    // Verify cart is empty
    await expect(page.getByRole('heading', { name: 'Your shopping cart is empty!' })).toBeVisible()
  })
})
