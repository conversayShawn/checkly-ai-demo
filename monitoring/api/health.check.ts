import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.3 — Platform health endpoint
new ApiCheck('api-health', {
  name: 'API · GET /system/health',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:2', 'platform-api'],
  frequency: Frequency.EVERY_10M,
  degradedResponseTime: 3500,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: 'https://jsonmap.site/api/v1/items/system-health',
    headers: [{ key: 'Authorization', value: `Bearer ${process.env.JSONMAP_API_KEY}` }],
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.status').equals('ok'),
    ],
  },
})
