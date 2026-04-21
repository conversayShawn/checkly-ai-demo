import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.6 — Recommendations service (powers "You May Also Like")
// Tolerant threshold — this is a nice-to-have; slow recs don't block a sale.
new ApiCheck('api-recommendations', {
  name: 'API · GET /recommendations/:sku',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:3', 'platform-api'],
  frequency: Frequency.EVERY_30M,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/recommendations-TELE-001',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.sku').equals('TELE-001'),
    ],
  },
})
