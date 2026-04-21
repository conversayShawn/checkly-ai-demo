import dotenv from 'dotenv'
import path from 'path'
import { fixtures } from './items'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const API = 'https://jsonmap.site/api/v1/items'
const KEY = process.env.JSONMAP_API_KEY

if (!KEY) {
  console.error('JSONMAP_API_KEY is not set.')
  process.exit(1)
}

async function del(key: string): Promise<void> {
  const res = await fetch(`${API}/${key}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${KEY}` },
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE /${key} failed: ${res.status} ${await res.text()}`)
  }
}

async function main(): Promise<void> {
  console.log(`Removing ${fixtures.length} fixtures from ${API}…`)
  for (const { key } of fixtures) {
    await del(key)
    console.log(`  ✓ ${key}`)
  }
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
