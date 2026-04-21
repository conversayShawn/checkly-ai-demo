import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.10 — Catalog-depth canary.
// Not a liveness check — `api-products-list` already covers that. This asserts
// the listing has at least the expected number of items, catching fixture drift,
// accidental bulk deletes, and botched re-seeds. Storefront still works if a few
// rows go missing, so this is tier:3 — a record-keeping signal, not a pager.
new ApiCheck('api-catalog-depth', {
  name: 'API · catalog depth',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:3', 'platform-api'],
  frequency: Frequency.EVERY_30M,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.length').greaterThan(15),
    ],
  },
})
