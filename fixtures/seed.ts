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
  console.log(`Seeding ${fixtures.length} fixtures to ${API}…`)
  for (const { key, body } of fixtures) {
    await put(key, body)
    console.log(`  ✓ ${key}`)
  }
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
