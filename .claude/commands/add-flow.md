---
description: Add a new Playwright browser flow. $ARGUMENTS is the user journey (e.g. "apply coupon at checkout").
---

Add a new Playwright spec for: **$ARGUMENTS**

Decide placement:

- **Standalone check** (one top-level user journey, auto-registered via `browserChecks.testMatch`):
  drop a new `.spec.ts` at the top of `monitoring/browser/`.
- **Part of an existing suite** (cohesive group of related tests):
  drop it inside `monitoring/browser/suites/homepage-and-browsing/` or
  `monitoring/browser/suites/cart-and-checkout/`. The matching `PlaywrightCheck` in
  `monitoring/suites.check.ts` will pick it up automatically.

Conventions:

- Use `baseURL` — don't hardcode `https://prod-otel-demo.checkly.engineering`
- Prefer `getByRole` and `getByText`; avoid brittle CSS selectors
- Use `{ waitUntil: 'domcontentloaded' }` on `page.goto`
- Group related assertions inside `test.describe` blocks

After writing, run `npm run test` to dry-run.
