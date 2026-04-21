import * as path from 'path'
import { Frequency, MultiStepCheck } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.1 + §2.2 — chained call through product catalog into order service
new MultiStepCheck('api-order-flow', {
  name: 'API · Order flow (multistep)',
  group: platformApiGroup,
  tags: ['svc:api', 'tier:1', 'platform-api'],
  runtimeId: '2025.04',
  frequency: Frequency.EVERY_1M,
  code: {
    entrypoint: path.join(__dirname, 'order-flow.spec.ts'),
  },
})
