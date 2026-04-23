import { expect, test } from '@playwright/test'

// SSL certificate expiry on prod-otel-demo.
// Minimal navigation; the real work is done by `sslCheckDomain` on the
// BrowserCheck construct, which alerts on upcoming cert expiry.
test('Homepage responds 200 (SSL cert canary)', async ({ page }) => {
  const res = await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBe(200)
})
