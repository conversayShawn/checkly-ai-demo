import { expect, test } from '@playwright/test'

// body of the order-flow multistep check.
// MultiStepCheck body: chain two API calls (list → detail) against the mock API.
// This file is referenced by order-flow.check.ts and is NOT picked up by
// browserChecks.testMatch (which only scans monitoring/browser/*.spec.ts).

const headers = {
  Accept: 'application/json',
  Authorization: `Bearer ${process.env.JSONMAP_API_KEY}`,
}

test('list products then fetch one', async ({ request }) => {
  let firstKey: string | undefined

  await test.step('GET /api/v1/items', async () => {
    const res = await request.get('https://jsonmap.site/api/v1/items', { headers })
    expect(res.status()).toBe(200)
    const items = await res.json()
    expect(Array.isArray(items)).toBe(true)
    firstKey = items[0]?.key
    expect(firstKey).toBeTruthy()
  })

  await test.step('GET /api/v1/items/:key', async () => {
    const res = await request.get(`https://jsonmap.site/api/v1/items/${firstKey}`, { headers })
    expect(res.status()).toBe(200)
  })
})
