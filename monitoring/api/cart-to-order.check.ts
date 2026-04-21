import * as path from 'path'
import { Frequency, MultiStepCheck } from 'checkly/constructs'
import { platformApiGroup } from '../groups.check'

// Covers: MONITORING.md §2.1 + §2.4 + §2.5 + §2.6 + §2.2 — end-to-end add-to-cart chain
new MultiStepCheck('api-cart-to-order', {
  name: 'API · Cart-to-order chain (multistep)',
  group: platformApiGroup,
  tags: ['svc:checkout', 'tier:1', 'platform-api'],
  runtimeId: '2025.04',
  frequency: Frequency.EVERY_1M,
  code: {
    entrypoint: path.join(__dirname, 'cart-to-order.spec.ts'),
  },
})
