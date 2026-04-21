import { expect, test } from '@playwright/test'

// Covers: MONITORING.md §1.1 — Customer can load the homepage and see featured products
// This test is part of a Playwright Check Suite, configured in playwright.config.ts

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('Homepage loads with hero banner', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The best telescopes to see the world closer' })).toBeVisible()
  })

  test('Hot products section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Hot Products' })).toBeVisible()
    await expect(page.getByText('National Park Foundation Explorascope')).toBeVisible()
  })

  test('Currency selector is available', async ({ page }) => {
    await expect(page.getByRole('combobox').first()).toBeVisible()
  })
})
