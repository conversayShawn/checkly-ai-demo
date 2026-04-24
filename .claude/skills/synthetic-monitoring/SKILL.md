---
name: synthetic-monitoring
description: Use this skill when the user asks to set up, stand up, build, generate, or instrument synthetic monitoring for an app or API via a natural prompt. Fires on prompts like "set up monitoring for my storefront at X", "build monitoring for Astroshop", "instrument this app with Checkly", "generate checks for my shop", "monitor prod-otel-demo". The skill writes the .check.ts wiring live — no templates, no pre-authored spec. Also invoked by the `/monitoring-deploy` slash command as its scripted entry point.
---

Stand up Astroshop's monitoring-as-code surface live. Read `openapi.yaml`, then write every
`.check.ts` file plus `MONITORING.md` from scratch. Conventions (tags, logical-ID prefixes,
tier × frequency matrix) live in `CLAUDE.md`.

## Already present (do NOT regenerate)

- `openapi.yaml` — API surface, with `x-monitoring.service` and `x-monitoring.criticality`
  per endpoint; `x-monitoring-flows` for the two MultiStep flows.
- `monitoring/browser/*.spec.ts` — 4 Playwright specs:
  `hero-banner` (tier:3), `browse-products` (tier:1), `mobile-canary` (tier:3),
  `ssl-canary` (tier:3 + `sslCheckDomain: 'prod-otel-demo.checkly.engineering'`).
- `monitoring/browser/suites/` — `cart-and-checkout`, `homepage-and-browsing`.
  PlaywrightCheck project names match exactly.
- `monitoring/api/*.spec.ts` — `order-flow.spec.ts`, `cart-to-order.spec.ts` (see
  `x-monitoring-flows`).
- `monitoring/astroshop.css`, `fixtures/*`, configs.

## What to generate

- **API checks** — one `ApiCheck` per `openapi.yaml` `path` entry. Tier from
  `x-monitoring.criticality` (critical → tier:1, routine → tier:2, low → tier:3),
  `svc:*` tag from `x-monitoring.service`. Each `x-monitoring-flows` entry →
  `MultiStepCheck` wrapping its `.spec.ts` by path.
- **Browser checks** — one `BrowserCheck` per spec listed above; tiers are authoritative.
- **Uptime** — `UrlMonitor` (homepage, tier:1, EVERY_30S), `TcpMonitor` (`jsonmap.site`,
  tier:2), `HeartbeatMonitor` (deactivated, tier:3).
- **Orchestration** — alert channels, 3 team groups (`storefrontGroup`, `platformApiGroup`,
  `sreGroup`), 3 status-page services, 1 status page, 2 dashboards (public themed with
  `astroshop.css`, internal with `DEMO_SEED`-scoped URL), 1 weekly `MaintenanceWindow`,
  2 `PlaywrightCheck`s matching the suite dirs.

No `// Covers:` headers, no `§X.Y` numbering — retired.

## MONITORING.md

Written last in the same Write batch. Short post-hoc summary: what Astroshop is, what's
instrumented and why, intentional gaps, public URLs. Half a page, no section numbering.

## Narration

Each numbered phase prints **three lines**: `▸ announce`, execute, `✓ confirm with a
concrete number`.

## Phases

**Preflight (silent, background, fire once each):**
- Track A: `npm install && npm run seed` (chained — seed needs `tsx` from `node_modules`).
- Track B: `npx skills add checkly/checkly-cli -y` (safety net; on established demo boxes
  it's already installed).

**Before writing any check file, invoke the `checkly` skill** via the Skill tool in your
first assistant message (alongside the preflight bashes and the `openapi.yaml` Read). That
loads the current Checkly construct reference (V2 groups, `request: {}` shapes,
`AssertionBuilder` / `UrlAssertionBuilder` APIs, `pwProjects` / `playwrightConfigPath` on
`PlaywrightCheck`, etc.) into your context. Without it you will emit older-schema code from
training-data memory and burn minutes rediscovering breakages via `npm run test`.

1. **`▸ Reading the API spec`** — Read `openapi.yaml`. Batch with the preflight Bashes in
   the first assistant message. ✓: "N endpoints + M flows".
2. **`▸ Writing the monitoring surface`** — **get the first Write out as fast as possible,
   then keep writing without pausing to plan.** In the **first assistant message** (same
   message as the preflight bashes and the `openapi.yaml` Read), also emit Writes for the
   deterministic orchestration files that don't depend on the spec —
   `monitoring/channels.check.ts`, `monitoring/groups.check.ts`, `monitoring/services.check.ts`.
   From there, continuously emit the next file you already know how to write: status page →
   dashboards → maintenance → suites → uptime → browser → API checks → MultiStep checks →
   `MONITORING.md` last. Don't pre-plan files you haven't started yet; don't deliberate on
   batch sizing; just write the next obvious file.
3. **`▸ Dry-running checks on Checkly`** — `npm run test` (compiles end-to-end; no separate
   typecheck needed). If compile errors, fix and retry.
4. **`▸ Deploying`** — `npm run deploy`.
5. **Wrap-up** — "Astroshop monitoring is live": what landed, intentional gaps, public
   status page URL (`checkly-status-page.com`), public dashboard URL
   (`checkly-dashboards.com`), project URL. Next step: "`/add-check` to add a surface,
   `/add-flow` for a new journey."

## Guardrails

- **Keep writing continuously.** The expensive thing isn't the number of Writes per turn —
  it's thinking blocks *between* Writes. Don't pre-plan the full surface; don't deliberate
  on which file "should" come next. Write the next file you already have in your head, then
  the next.
- **Every construct shape comes from the `checkly` skill, not from memory.** Common pitfalls
  if you skip this: `CheckGroup` (deprecated) vs `CheckGroupV2`, `url`/`host` at the top
  level vs nested under `request: {}`, headers as an object vs array of `{key, value}`,
  `jsonBody().isArray()` (doesn't exist), `PlaywrightCheck.projectName` (doesn't exist —
  use `playwrightConfigPath` + `pwProjects`). If you haven't invoked the checkly skill yet,
  do so before writing.
- **Read exactly one file: `openapi.yaml`.** No specs, no configs, no `fixtures/items.ts`.
  If uncertain about a detail, emit reasonable code and let phase 3 catch mismatches.
- Do not touch pre-baked files. Do not replace mocked alert channel URLs. Do not run
  `npm run destroy` without being asked.
- Auth is via `npx checkly login`. If test/deploy errors on auth, stop and tell the user —
  don't set `CHECKLY_API_KEY`/`CHECKLY_ACCOUNT_ID`.
