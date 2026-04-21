import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.4 — Inventory service (per-SKU stock lookup)
// Blocks add-to-cart, so the threshold is tighter than the catalog.
new ApiCheck('api-inventory', {
  name: 'API · GET /inventory/:sku',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:1', 'platform-api'],
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/inventory-TELE-001',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.sku').equals('TELE-001'),
      AssertionBuilder.jsonBody('$.available').greaterThan(0),
    ],
  },
})
