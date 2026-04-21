import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import { sreGroup } from '../groups.check'

// Covers: MONITORING.md §3.1 — Homepage reachability (HTTP)
new UrlMonitor('uptime-homepage', {
  name: 'Astroshop homepage',
  activated: true,
  group: sreGroup,
  tags: ['svc:web', 'tier:1', 'sre', 'public'],
  frequency: Frequency.EVERY_30S,
  maxResponseTime: 10_000,
  degradedResponseTime: 5000,
  request: {
    url: 'https://prod-otel-demo.checkly.engineering/',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})
