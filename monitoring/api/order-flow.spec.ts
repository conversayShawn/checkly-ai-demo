import { expect, test } from '@playwright/test'

// body of the order-flow multistep check.
// MultiStepCheck body: chain two API calls (list → detail) against the storefront API.
// This file is referenced by order-flow.check.ts and is NOT picked up by
// browserChecks.testMatch (which only scans monitoring/browser/*.spec.ts).

const base = 'https://prod-otel-demo.checkly.engineering/api'
const headers = { Accept: 'application/json' }

test('list products then fetch one', async ({ request }) => {
  let firstId: string | undefined

  await test.step('GET /api/products', async () => {
    const res = await request.get(`${base}/products`, { headers })
    expect(res.status()).toBe(200)
    const products = await res.json()
    expect(Array.isArray(products)).toBe(true)
    firstId = products[0]?.id
    expect(firstId).toBeTruthy()
  })

  await test.step('GET /api/products/:id', async () => {
    const res = await request.get(`${base}/products/${firstId}`, { headers })
    expect(res.status()).toBe(200)
    const product = await res.json()
    expect(product.id).toBe(firstId)
  })
})
