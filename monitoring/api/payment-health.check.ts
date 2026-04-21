import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.7 — Payment gateway health
// Checkout dependency; if this is red, place-order will fail downstream.
new ApiCheck('api-payment-health', {
  name: 'API · GET /payment/health',
  group: platformApiGroup,
  tags: ['svc:checkout', 'tier:1', 'platform-api'],
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/payment-health',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.status').equals('ok'),
      AssertionBuilder.jsonBody('$.provider').equals('stripe'),
    ],
  },
})
