import dotenv from 'dotenv'
import path from 'path'
import { fixtures } from './items'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const API = 'https://jsonmap.site/api/v1/items'
const KEY = process.env.JSONMAP_API_KEY

if (!KEY) {
  console.error('JSONMAP_API_KEY is not set. Copy .env.example → .env and fill it in.')
  process.exit(1)
}

async function get(key: string): Promise<Response> {
  return fetch(`${API}/${key}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${KEY}` },
  })
}

async function put(key: string, body: unknown): Promise<void> {
  const res = await fetch(`${API}/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`PUT /${key} failed: ${res.status} ${await res.text()}`)
  }
}

async function main(): Promise<void> {
  // Skip-if-already-seeded: probe the first fixture as a sentinel. Cheap
  // single round-trip that avoids the full PUT loop on repeat runs.
  // If fixtures get corrupted out-of-band, run `npm run teardown && npm run seed`.
  const sentinel = fixtures[0].key
  const probe = await get(sentinel)
  if (probe.ok) {
    console.log(`Fixtures already present (sentinel "${sentinel}" returned 200). Skipping seed.`)
    return
  }

  console.log(`Seeding ${fixtures.length} fixtures to ${API}…`)
  await Promise.all(
    fixtures.map(({ key, body }) =>
      put(key, body).then(() => console.log(`  ✓ ${key}`)),
    ),
  )
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
