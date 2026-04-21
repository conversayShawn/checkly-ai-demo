import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'
import { apiService } from '../services.check'

// Covers: MONITORING.md §2.1 — Product catalog list
new ApiCheck('api-products-list', {
  name: 'API · GET /products',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:1', 'platform-api'],
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [AssertionBuilder.statusCode().equals(200)],
  },
  triggerIncident: {
    service: apiService,
    severity: 'MAJOR',
    name: 'Public API is failing to return products',
    description: 'The product list endpoint is not returning a 200.',
    notifySubscribers: true,
  },
})

// Covers: MONITORING.md §2.1 — Product catalog detail
new ApiCheck('api-product-detail', {
  name: 'API · GET /products/:key',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:1', 'platform-api'],
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/product-telescope-starter',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.sku').equals('TELE-001'),
    ],
  },
})
