import { expect, test } from '@playwright/test'

// Covers: MONITORING.md §1.1 + §1.2 — homepage → hot products → product detail page
test('Browse hot products and open a product page', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'The best telescopes to see the world closer' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Go Shopping' }).click()
  await expect(page.getByRole('heading', { name: 'Hot Products' })).toBeVisible()

  await expect(page.getByText('National Park Foundation Explorascope')).toBeVisible()

  await page.getByRole('link', { name: /Roof Binoculars/ }).click()
  await expect(page.getByRole('button', { name: /Add To Cart/ })).toBeVisible()
})
