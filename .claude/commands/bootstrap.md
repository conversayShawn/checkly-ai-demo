---
description: One-shot setup. Installs Checkly's Agent Skills, seeds API fixtures, tests, deploys.
---

You are bootstrapping the Astroshop monitoring-as-code project against the configured
Checkly account. Narrate each step in one short line. Don't expand details unless a step
fails.

Run in this order, stopping only on hard failure:

1. **Read `MONITORING.md` first.** It's the source of truth for what Astroshop monitors and
   why. Summarize in 3–5 bullets: what the product is, the user journeys that matter, the
   backend surfaces, and note the intentional gaps in §5 that `/monitor` can surface later.
2. `npx skills add checkly/checkly-cli -y` — installs Checkly's official Agent Skills so
   Claude Code picks up project conventions. **Run with `-y` (non-interactive)** — the
   first install prompts otherwise and stalls the flow.
3. `npm install`
4. `npm run seed` — seeds the jsonmap.site backend with the fixtures in `fixtures/items.ts`.
5. `npm run test` — dry-runs every check against Checkly's infrastructure. Show the summary
   only.
6. `npm run deploy` — deploys all resources to the Checkly account.
7. When `deploy` finishes, print a short wrap-up:
   - Coverage: customer journeys (§1.1–§1.8, §1.10), backend surfaces (§2.1–§2.8, §2.10),
     platform operations (§3.1–§3.3).
   - Open gaps: §1.9 (discount code at checkout) and §2.9 (Search API) — both tracked in
     §5 of `MONITORING.md`. `/monitor` can fill them.
   - Public status page URL (under `checkly-status-page.com`).
   - Public dashboard URL (under `checkly-dashboards.com`).
   - Project URL in the Checkly app.

Do not run `npm run destroy` or `/teardown` unless explicitly asked.
