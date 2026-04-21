import {
  AlertEscalationBuilder,
  CheckGroupV2,
  RetryStrategyBuilder,
} from 'checkly/constructs'
import { allChannels } from './channels.check'

// Groups mirror team ownership from MONITORING.md §Service ownership so that
// check-level pages route to the right oncall rotation.
//
// Tag axes (see MONITORING.md §6 Alerting contract):
//   - group tag: owning team (`storefront` / `platform-api` / `sre`)
//   - `public`: surfaced on the public status page / dashboard
//   - per-check: `svc:web|api|checkout` + `tier:1|2|3`

export const storefrontGroup = new CheckGroupV2('storefront', {
  name: 'Storefront',
  activated: true,
  muted: false,
  runtimeId: '2025.04',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['storefront', 'public'],
  alertChannels: allChannels,
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(2),
  retryStrategy: RetryStrategyBuilder.fixedStrategy({
    baseBackoffSeconds: 60,
    maxRetries: 2,
    sameRegion: true,
  }),
  concurrency: 5,
})

export const platformApiGroup = new CheckGroupV2('platform-api', {
  name: 'Platform API',
  activated: true,
  muted: false,
  runtimeId: '2025.04',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['platform-api'],
  alertChannels: allChannels,
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(2),
  environmentVariables: [
    { key: 'JSONMAP_API_KEY', value: process.env.JSONMAP_API_KEY ?? '', secret: true },
  ],
  concurrency: 10,
})

export const sreGroup = new CheckGroupV2('sre', {
  name: 'SRE',
  activated: true,
  muted: false,
  tags: ['sre', 'public'],
  alertChannels: allChannels,
  concurrency: 5,
})
