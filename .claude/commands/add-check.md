---
description: Add a new check. $ARGUMENTS describes what to monitor (e.g. "GET /orders/:id", "TCP db:5432", "uptime for status.example.com").
---

Add a new check based on: **$ARGUMENTS**

Decide the right construct:

- HTTP endpoint with assertions → `ApiCheck` in `monitoring/api/<name>.check.ts`, assign to `platformApiGroup`
- Chained/stateful HTTP flow → `MultiStepCheck` (`.check.ts` + sibling `.spec.ts`) in `monitoring/api/`, `platformApiGroup`
- Full-page UX flow → new `.spec.ts` under `monitoring/browser/` + a corresponding `BrowserCheck` construct in `monitoring/browser/browser.check.ts` (group: `storefrontGroup`)
- UX flow that belongs in an existing suite → add to `monitoring/browser/suites/{suite}/` (runs inside the existing `PlaywrightCheck` in `storefrontGroup`)
- Pure URL uptime → `UrlMonitor` in `monitoring/uptime/`, assign to `sreGroup`
- TCP port → `TcpMonitor` in `monitoring/uptime/`, assign to `sreGroup`
- Cron/job ping → `HeartbeatMonitor` in `monitoring/uptime/`, assign to `sreGroup`

Groups model team ownership (Storefront / Platform API / SRE), not check type.

Conventions:

- Filenames end in `.check.ts` (except raw Playwright suite specs, which end in `.spec.ts`)
- Every construct takes a stable `logicalId` — prefix with `api-`, `uptime-`, `suite-`, etc.
- API checks target the storefront API at `https://prod-otel-demo.checkly.engineering/api` — public, no auth header
- Every check carries two tags for filtering: `svc:web|api|checkout` (which status-page service it rolls up to) and `tier:1|2|3` (1 = pages, 2 = notifies, 3 = logs only). Customer-facing checks also carry `public`.
- A `tier:1` check also carries `incident:web|api|checkout` so the matching automation rule
  in `monitoring/status-page.check.ts` opens an incident on that status page component when
  it fails. Don't use the deprecated per-check `triggerIncident`.
- When done, run `npm run test` to dry-run **only the new check** using `-g` or `--only`
