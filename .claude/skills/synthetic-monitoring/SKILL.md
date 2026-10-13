---
name: synthetic-monitoring
description: Use this skill when the user asks to set up, stand up, build, generate, or instrument synthetic monitoring for an app or API via a natural prompt. Fires on prompts like "set up monitoring for my storefront at X", "build monitoring for Astroshop", "instrument this app with Checkly", "generate checks for my shop", "monitor prod-otel-demo". The skill writes the .check.ts wiring live — no templates, no pre-authored spec. Also invoked by the `/monitoring-deploy` slash command as its scripted entry point.
---

Stand up Astroshop's monitoring-as-code surface live. Read `openapi.yaml`, then write every
`.check.ts` file plus `MONITORING.md` from scratch. Conventions (tags, logical-ID prefixes,
tier × frequency matrix) live in `CLAUDE.md`.

## Already present (do NOT regenerate)

- `openapi.yaml` — API surface, with `x-monitoring.service`, `x-monitoring.criticality`
  and a ready-to-request `x-monitoring.example` per endpoint; `x-monitoring-flows` for the
  two MultiStep flows.
- `monitoring/browser/*.spec.ts` — 4 Playwright specs:
  `hero-banner` (tier:3), `browse-products` (tier:1), `mobile-canary` (tier:3),
  `ssl-canary` (tier:3 + `sslCheckDomain: 'prod-otel-demo.checkly.engineering'`).
- `monitoring/browser/suites/` — two suites, both **tier:1** (they cover revenue-critical
  flows, not canaries):
  - `cart-and-checkout/` (Playwright project name `'Cart & Checkout'`) — checkout funnel
    (product → cart → checkout). `svc:checkout`.
  - `homepage-and-browsing/` (Playwright project name `'Homepage & Browsing'`) — homepage
    + product browsing + recommendations. `svc:web`.
  **`pwProjects` must use the project `name` from `playwright.config.ts` verbatim**
  (`'Cart & Checkout'`, `'Homepage & Browsing'`) — NOT the directory slug. Passing the
  slug deploys silently but the suite resolves zero tests at run time.
- `monitoring/api/*.spec.ts` — `order-flow.spec.ts`, `cart-to-order.spec.ts` (see
  `x-monitoring-flows`).
- `monitoring/astroshop.css`, configs.

## What to generate

- **API checks** — one `ApiCheck` per `openapi.yaml` `path` entry, **`group: platformApiGroup`**.
  Tier from `x-monitoring.criticality` (critical → tier:1, routine → tier:2, low → tier:3),
  `svc:*` tag from `x-monitoring.service`. **Build each request URL as the spec's
  `servers[0].url` + the endpoint's `x-monitoring.example`, verbatim** — the example is
  already URL-encoded (the shipping quote takes JSON in its query string), so don't
  re-encode or rebuild it from the parameter list. The API is public: no auth header, no
  secrets. Each `x-monitoring-flows` entry → `MultiStepCheck` wrapping its `.spec.ts` by
  path, also `group: platformApiGroup`.
- **Browser checks** — one `BrowserCheck` per spec listed above, **`group: storefrontGroup`**;
  tiers are authoritative.
- **Uptime** — `UrlMonitor` (homepage, tier:1, EVERY_30S), `TcpMonitor`
  (`prod-otel-demo.checkly.engineering:443`, tier:2), `HeartbeatMonitor` (deactivated, tier:3). All three belong to `sreGroup`.
- **Orchestration** — alert channels, 3 team groups (`storefrontGroup`, `platformApiGroup`,
  `sreGroup`), 1 status page with 3 components and 3 automation rules (see below),
  2 dashboards (public themed with
  `astroshop.css`, internal Ops dashboard), 1 weekly `MaintenanceWindow`,
  2 `PlaywrightCheck`s matching the suite dirs (both **`group: storefrontGroup`**, **tier:1,
  EVERY_1M** per the matrix — checkout and browsing are revenue spine, not optional canaries).

  **The status page is a `StatusPageV3`, all in `monitoring/status-page.check.ts`.** One
  `StatusPageV3`, one `StatusPageV3Component` (`type: 'SERVICE'`) per service — `svc-web`,
  `svc-api`, `svc-checkout`, each pointing at the page via `statusPage` with its own
  `displayOrder` — and one `StatusPageV3AutomationRule` per component (`rule-web`,
  `rule-api`, `rule-checkout`) with `tags: ['incident:<svc>']`,
  `components: [{ component, targetImpact: 'MAJOR_OUTAGE' }]` and
  **`notifySubscribers: false`**. Every tier:1 check carries the matching `incident:<svc>`
  tag next to its `svc:<svc>` tag; tier:2 and tier:3 checks do not, so only checks we'd
  page on open an incident. Rules match on ANY listed tag, so never put `svc:*` or
  `tier:*` in a rule's `tags`.

  **Every check must explicitly set `group:` to one of the three groups.** Group assignment
  summary: BrowserCheck + PlaywrightCheck → `storefrontGroup`; ApiCheck + MultiStepCheck →
  `platformApiGroup`; UrlMonitor + TcpMonitor + HeartbeatMonitor → `sreGroup`. A group with
  zero checks after deploy means you forgot the `group:` property somewhere — verify with
  `npx checkly check list` before declaring the flow done.

  **Alert-channel placeholders must use formats Checkly's client-side validator accepts**
  (otherwise `npm run deploy` rejects them and you waste a retry loop). Use exactly:
  - Slack webhook: `https://hooks.slack.com/services/T00000000/B00000000/000000000000000000000000`
    (incrementing the trailing digits per channel: `…000000000000001`, `…000000000000002`).
  - Phone (PhoneCall/SMS): a valid E.164 reserved-for-fiction number, e.g. `+14155550100`,
    `+14155550101`, `+14155550102`. Never `+10000000000` or other shorter junk.
  - Email: `oncall-<team>@example.com` (RFC-valid).
  - Generic webhook: `https://example.com/webhooks/<team>`.

  All channels carry `sendFailure: false` and `sendRecovery: false` — wiring exists for the
  UI graph; nothing actually fires.

No `// Covers:` headers, no `§X.Y` numbering — retired.

## MONITORING.md

Written last in the same Write batch. Short post-hoc summary: what Astroshop is, what's
instrumented and why, intentional gaps, public URLs. Half a page, no section numbering.

## Narration

Each numbered phase prints **three lines**: `▸ announce`, execute, `✓ confirm with a
concrete number`.

## Phases

**Preflight (silent, background, fire once each):**
- Track A: `npm install`.
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
   `monitoring/channels.check.ts`, `monitoring/groups.check.ts`, `monitoring/status-page.check.ts`.
   From there, continuously emit the next file you already know how to write:
   dashboards → maintenance → suites → uptime → browser → API checks → MultiStep checks →
   `MONITORING.md` last. Don't pre-plan files you haven't started yet; don't deliberate on
   batch sizing; just write the next obvious file.
3. **`▸ Dry-running checks on Checkly`** — `npm run test` (compiles end-to-end; no separate
   typecheck needed). If compile errors, fix and retry. **Runtime check failures
   (red results) do NOT block deploy** — note them for the wrap-up and continue straight to
   phase 4 without asking the operator.
4. **`▸ Deploying`** — `npm run deploy` (runs `npx checkly deploy --force`). Always run it
   automatically once the project compiles — invoking this skill is the operator's approval
   to deploy, so never pause for confirmation here.
5. **Wrap-up** — "Astroshop monitoring is live": what landed, intentional gaps, public
   status page URL `https://<slug>.checkly-status-page.com`, public dashboard URL
   `https://<slug>.checkly-dashboards.com`. **The `customUrl` slug becomes a subdomain,
   not a path** — `checkly-status-page.com/<slug>` is a 404. **Do not invent a Checkly
   project URL** — `app.checklyhq.com/projects/...` is not a real path, don't print it.
   Next step: "`/add-check` to add a surface, `/add-flow` for a new journey."

## Guardrails

- **Keep writing continuously.** The expensive thing isn't the number of Writes per turn —
  it's thinking blocks *between* Writes. Don't pre-plan the full surface; don't deliberate
  on which file "should" come next. Write the next file you already have in your head, then
  the next.
- **Every construct shape comes from the `checkly` skill, not from memory.** Common pitfalls
  if you skip this: `CheckGroup` (deprecated) vs `CheckGroupV2`, `url`/`host` at the top
  level vs nested under `request: {}`, headers as an object vs array of `{key, value}`,
  `jsonBody().isArray()` / `jsonBody().isNotEmpty()` (don't exist — use `.isNotNull()` or
  a concrete `.equals()` / `.contains()` / `.isGreaterThan()`), `PlaywrightCheck.projectName`
  (doesn't exist — use `playwrightConfigPath` + `pwProjects`), `StatusPage` /
  `StatusPageService` with `cards` and per-check `triggerIncident` (deprecated — use
  `StatusPageV3`, `StatusPageV3Component`, `StatusPageV3AutomationRule`). If you haven't
  invoked the checkly skill yet, do so before writing.
- **No `themeColors` on the status page** — it needs a custom-theme-colors plan
  entitlement and deploy rejects it without one; `defaultTheme` is fine.
- **`playwrightConfigPath` is resolved relative to the `.check.ts` file**, not the repo
  root. `playwright.config.ts` lives at the repo root and `suites.check.ts` lives in
  `monitoring/`, so the correct value is `'../playwright.config.ts'`. Using
  `'./playwright.config.ts'` will ENOENT at validation time.
- **All customer-facing slugs (status page `url`, public dashboard `customUrl`) must include
  `DEMO_SEED`.** The shared Checkly account already owns plain slugs like `astroshop` and
  `astroshop-public` from prior demos — deploy will reject the second occurrence with
  "Custom domain or url … is already in use." Prefix every slug with its surface
  (`astroshop-status-${DEMO_SEED}`, `astroshop-public-${DEMO_SEED}`, etc.).
  `checkly.config.ts` guarantees `process.env.DEMO_SEED` is set before checks load, so no
  `?? 'fallback'` is needed at call sites.
- **`Dashboard.customCSS` takes a `{ entrypoint: './astroshop.css' }` reference, not a
  string of CSS content.** Don't `fs.readFileSync` the file and pass the contents — the
  construct expects a path so Checkly can bundle and host it. Wrong shape fails compile.
- **Never set `degradedResponseTime` below `3000` on an ApiCheck.** The backend API
  usually answers in under a second, but tighter thresholds don't fail the run on a slow
  response — they come back amber (`degraded`), which reads on stage like a real
  regression and costs a retry cycle to tune away. Use `degradedResponseTime: 3000` /
  `maxResponseTime: 8000` for single-item endpoints, and `5000` / `15000` for the full
  catalog list (`/products`), which is the heaviest payload the backend serves. Browser
  and Playwright checks need no override.
- **Assert only on what the spec promises.** Status 200 plus the endpoint's
  `x-monitoring.assertions` — don't invent body assertions for fields the spec doesn't
  name.
- **Read exactly one file: `openapi.yaml`.** No specs, no configs.
  If uncertain about a detail, emit reasonable code and let phase 3 catch mismatches.
- Do not touch pre-baked files. Do not replace mocked alert channel URLs. Do not run
  `npm run destroy` without being asked.
- **Generated code and `MONITORING.md` read as real production monitoring.** No `demo`,
  `sample`, `example`, `blueprint`, `walkthrough`, `for this flow`, or similar framing in
  identifiers, tags, comments, or summary prose. Every file should be indistinguishable
  from what Astroshop's on-call team would actually check into a real repo.
- Auth is via `npx checkly login`. If test/deploy errors on auth, stop and tell the user —
  don't set `CHECKLY_API_KEY`/`CHECKLY_ACCOUNT_ID` locally. The `.github/workflows/` files
  are the exception: CI runners have no cached login and do use those vars.
