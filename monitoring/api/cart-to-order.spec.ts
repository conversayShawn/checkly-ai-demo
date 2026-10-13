import { randomUUID } from 'crypto'
import { expect, test } from '@playwright/test'

// full add-to-cart chain.
// MultiStepCheck body: product → add to cart → read cart → recommendations →
// shipping quote → empty cart, threading the services the storefront calls when
// a customer buys. Each run uses its own session so parallel runs don't collide.

const base = 'https://prod-otel-demo.checkly.engineering/api'
const headers = { Accept: 'application/json' }

const productId = 'OLJCESPC7Z'
const sessionId = `synthetic-${randomUUID()}`

test(`add-to-cart chain for ${productId}`, async ({ request }) => {
  await test.step(`GET /api/products/${productId}`, async () => {
    const res = await request.get(`${base}/products/${productId}`, { headers })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(productId)
    expect(body.priceUsd.units).toBeGreaterThan(0)
  })

  await test.step('POST /api/cart', async () => {
    const res = await request.post(`${base}/cart`, {
      headers,
      params: { currencyCode: 'USD' },
      data: { item: { productId, quantity: 1 }, userId: sessionId },
    })
    expect(res.status()).toBe(200)
  })

  await test.step('GET /api/cart', async () => {
    const res = await request.get(`${base}/cart`, {
      headers,
      params: { sessionId, currencyCode: 'USD' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.items).toHaveLength(1)
    expect(body.items[0].productId).toBe(productId)
  })

  await test.step('GET /api/recommendations', async () => {
    const res = await request.get(`${base}/recommendations`, {
      headers,
      params: { productIds: productId },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  await test.step('GET /api/shipping', async () => {
    const res = await request.get(`${base}/shipping`, {
      headers,
      params: {
        itemList: JSON.stringify([{ productId, quantity: 1 }]),
        currencyCode: 'USD',
        address: JSON.stringify({ zipCode: '10001' }),
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.currencyCode).toBe('USD')
  })

  await test.step('DELETE /api/cart', async () => {
    const res = await request.delete(`${base}/cart`, { headers, data: { userId: sessionId } })
    expect(res.status()).toBe(204)
  })
})
