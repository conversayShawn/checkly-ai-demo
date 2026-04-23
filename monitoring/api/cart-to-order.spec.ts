import { expect, test } from '@playwright/test'

// full add-to-cart chain.
// MultiStepCheck body: product → inventory → pricing → recommendations → order,
// threading the per-SKU services the storefront calls when a customer buys.

const headers = {
  Accept: 'application/json',
  Authorization: `Bearer ${process.env.JSONMAP_API_KEY}`,
}

const base = 'https://jsonmap.site/api/v1/items'

test('add-to-cart chain for TELE-001', async ({ request }) => {
  await test.step('GET /items/product-telescope-starter', async () => {
    const res = await request.get(`${base}/product-telescope-starter`, { headers })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.sku).toBe('TELE-001')
  })

  await test.step('GET /items/inventory-TELE-001', async () => {
    const res = await request.get(`${base}/inventory-TELE-001`, { headers })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.available).toBeGreaterThan(0)
  })

  await test.step('GET /items/pricing-TELE-001', async () => {
    const res = await request.get(`${base}/pricing-TELE-001`, { headers })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.currency).toBe('USD')
    expect(body.base).toBeGreaterThan(0)
  })

  await test.step('GET /items/recommendations-TELE-001', async () => {
    const res = await request.get(`${base}/recommendations-TELE-001`, { headers })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.recommendedSkus)).toBe(true)
  })

  await test.step('GET /items/order-demo-1', async () => {
    const res = await request.get(`${base}/order-demo-1`, { headers })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('confirmed')
  })
})
