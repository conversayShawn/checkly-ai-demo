import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.5 — Pricing service (per-SKU base price + discount)
// Pricing is cheap to compute and sits in the cart path, so the SLO is tight.
new ApiCheck('api-pricing', {
  name: 'API · GET /pricing/:sku',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:1', 'platform-api'],
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/pricing-BINO-002',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.sku').equals('BINO-002'),
      AssertionBuilder.jsonBody('$.currency').equals('USD'),
    ],
  },
})
