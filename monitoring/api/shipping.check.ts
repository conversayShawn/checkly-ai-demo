import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.8 — Shipping estimate (per-postcode cost + ETA)
// Called during checkout; slow = cart abandonment.
new ApiCheck('api-shipping', {
  name: 'API · GET /shipping/:postcode',
  group: platformApiGroup,
  tags: ['svc:checkout', 'tier:1', 'platform-api'],
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/shipping-10001',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.postcode').equals('10001'),
      AssertionBuilder.jsonBody('$.etaDays').greaterThan(0),
    ],
  },
})
