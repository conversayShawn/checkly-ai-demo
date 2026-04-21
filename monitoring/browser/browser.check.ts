import * as path from 'path'
import { BrowserCheck, Frequency, RetryStrategyBuilder } from 'checkly/constructs'
import { sreGroup, storefrontGroup } from '../groups.check'

// Explicit BrowserCheck constructs for the specs at the top of monitoring/browser/.
// Declared explicitly (rather than via `browserChecks.testMatch`) so we can attach
// per-check tags — the auto-match path doesn't propagate tags in Checkly CLI today.

const sharedRetry = RetryStrategyBuilder.fixedStrategy({
  baseBackoffSeconds: 60,
  maxRetries: 2,
  sameRegion: true,
})

// Covers: MONITORING.md §1.1 — Customer can load the homepage and see featured products
// tier:3 because the headline-visible assertion overlaps with the Homepage URL monitor
// and the Suite · Homepage & Browsing check — this one is a drift canary, not a pager.
new BrowserCheck('browser-hero-banner', {
  name: 'Hero banner visible on homepage',
  group: storefrontGroup,
  tags: ['svc:web', 'tier:3', 'storefront', 'public'],
  frequency: Frequency.EVERY_30M,
  retryStrategy: sharedRetry,
  code: { entrypoint: path.join(__dirname, 'hero-banner.spec.ts') },
})

// Covers: MONITORING.md §1.1 + §1.2 — homepage → hot products → product detail page
new BrowserCheck('browser-browse-products', {
  name: 'Browse hot products and open a PDP',
  group: storefrontGroup,
  tags: ['svc:web', 'tier:1', 'storefront', 'public'],
  frequency: Frequency.EVERY_1M,
  retryStrategy: sharedRetry,
  code: { entrypoint: path.join(__dirname, 'browse-products.spec.ts') },
})

// Covers: MONITORING.md §1.10 — Mobile viewport canary.
// tier:3 — catches mobile-only CSS breakpoint regressions that desktop checks miss.
new BrowserCheck('browser-mobile-canary', {
  name: 'Mobile viewport canary',
  group: storefrontGroup,
  tags: ['svc:web', 'tier:3', 'storefront', 'public'],
  frequency: Frequency.EVERY_30M,
  retryStrategy: sharedRetry,
  code: { entrypoint: path.join(__dirname, 'mobile-canary.spec.ts') },
})

// Covers: MONITORING.md §3.3 — SSL certificate expiry on prod-otel-demo.
// tier:3 — cert expiry has weeks of lead time; sslCheckDomain triggers the
// Checkly-side cert watcher that alerts before the cert actually expires.
new BrowserCheck('browser-ssl-canary', {
  name: 'SSL cert canary — astroshop',
  group: sreGroup,
  tags: ['svc:web', 'tier:3', 'sre'],
  frequency: Frequency.EVERY_30M,
  sslCheckDomain: 'prod-otel-demo.checkly.engineering',
  code: { entrypoint: path.join(__dirname, 'ssl-canary.spec.ts') },
})
