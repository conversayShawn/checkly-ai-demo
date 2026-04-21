import { Frequency, TcpAssertionBuilder, TcpMonitor } from 'checkly/constructs'
import { sreGroup } from '../groups.check'

// Covers: MONITORING.md §3.1 — Homepage reachability (TCP :443)
new TcpMonitor('uptime-api-tcp', {
  name: 'Astroshop TCP :443',
  activated: true,
  group: sreGroup,
  tags: ['svc:web', 'tier:2', 'sre', 'public'],
  frequency: Frequency.EVERY_5M,
  maxResponseTime: 5000,
  degradedResponseTime: 3000,
  request: {
    hostname: 'prod-otel-demo.checkly.engineering',
    port: 443,
    assertions: [TcpAssertionBuilder.responseTime().lessThan(3000)],
  },
})
