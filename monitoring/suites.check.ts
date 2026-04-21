import { PlaywrightCheck } from 'checkly/constructs'
import { storefrontGroup } from './groups.check'

// Playwright Check Suites — each wraps a named project from playwright.config.ts
// and runs the whole suite as a single Checkly check.

// Covers: MONITORING.md §1.1 + §1.3 + §1.4 (via the homepage-and-browsing suite)
new PlaywrightCheck('suite-homepage-and-browsing', {
  name: 'Suite · Homepage & Browsing',
  group: storefrontGroup,
  tags: ['svc:web', 'tier:1', 'storefront', 'public'],
  frequency: 1,
  playwrightConfigPath: '../playwright.config.ts',
  pwProjects: ['Homepage & Browsing'],
})

// Covers: MONITORING.md §1.5 + §1.6 + §1.7 + §1.8 (via the cart-and-checkout suite)
new PlaywrightCheck('suite-cart-and-checkout', {
  name: 'Suite · Cart & Checkout',
  group: storefrontGroup,
  tags: ['svc:checkout', 'tier:1', 'storefront', 'public'],
  frequency: 1,
  playwrightConfigPath: '../playwright.config.ts',
  pwProjects: ['Cart & Checkout'],
})
