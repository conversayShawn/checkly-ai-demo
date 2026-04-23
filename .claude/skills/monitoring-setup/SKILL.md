---
name: monitoring-setup
description: Use this skill when the user asks to set up, stand up, build, generate, or instrument monitoring for an app or API via a natural prompt. Fires on prompts like "set up monitoring for my storefront at X", "build monitoring for Astroshop", "instrument this app with Checkly", "generate checks for my shop", "monitor prod-otel-demo". The skill writes the .check.ts wiring live — no templates, no pre-authored spec doc. Also invoked by the `/monitoring-deploy` slash command as its scripted entry point.
---

The user is asking you to stand up Astroshop's monitoring-as-code surface from a natural
prompt. You generate the Checkly CLI code **live** — writing the `.check.ts` files and
`MONITORING.md` from scratch. The Playwright specs, API fixtures, and build config are
pre-baked in the repo, so you don't probe the target.

Speak as if you're an on-call engineer standing this up for Astroshop production — not as if
you're running a demo.

## Pre-baked (do NOT regenerate)

- `monitoring/browser/*.spec.ts` — 4 Playwright specs (hero-banner, browse-products,
  mobile-canary, ssl-canary) against `prod-otel-demo.checkly.engineering`.
- `monitoring/browser/suites/<name>/*.spec.ts` — 2 suite dirs (`cart-and-checkout`,
  `homepage-and-browsing`) consumed by `PlaywrightCheck`.
- `monitoring/api/*.spec.ts` — 2 MultiStepCheck flow scripts (`order-flow.spec.ts`,
  `cart-to-order.spec.ts`) that chain calls against `jsonmap.site`.
- `monitoring/astroshop.css` — dashboard theme.
- `fixtures/items.ts`, `fixtures/seed.ts`, `fixtures/teardown.ts` — API fixture definitions +
  seed/teardown scripts for `jsonmap.site`.
- `package.json`, `checkly.config.ts`, `playwright.config.ts`, `.env.example`.

Everything else under `monitoring/` is absent in the starting repo state — you generate it.

Treat these as immovable infrastructure. Do not edit, do not regenerate.

## Generate live

Under `monitoring/`, overwriting any existing `.check.ts` files:

1. `channels.check.ts` — 4 mocked alert channels (email · slack · sms · webhook);
   `sendFailure: false`, placeholder URLs/emails/phones (see `CLAUDE.md` alerting contract).
2. `groups.check.ts` — 3 `CheckGroupV2`s keyed by owning team: `storefrontGroup`,
   `platformApiGroup`, `sreGroup`. Logical IDs = team name, no `grp-` prefix.
3. `services.check.ts` — 3 `StatusPageService`s (`svc-web`, `svc-api`, `svc-checkout`).
4. `status-page.check.ts` — one `StatusPage` titled "Astroshop — Service Status", slug
   `astroshop`, `defaultTheme: 'DARK'`, 2 cards grouping the 3 services.
5. `dashboards.check.ts` — 2 `Dashboard`s:
   - `dash-public`: customUrl `astroshop-status`, `tags: ['public']` filter,
     `customCSS: { entrypoint: './astroshop.css' }`.
   - `dash-internal`: customUrl `` `blueprint-ai-demo-internal-${demoSeed}` `` where
     `demoSeed = process.env.DEMO_SEED || new Date().toISOString().slice(0, 10).replace(/-/g, '')`.
6. `maintenance.check.ts` — one weekly recurring `MaintenanceWindow`.
7. `suites.check.ts` — 2 `PlaywrightCheck`s matching `playwright.config.ts` projects
   (`cart-and-checkout`, `homepage-and-browsing`).
8. `browser/browser.check.ts` — one `BrowserCheck` per `.spec.ts` directly under
   `monitoring/browser/` (NOT the `suites/` subdir): hero-banner (tier:3, EVERY_30M),
   browse-products (tier:1, EVERY_1M), mobile-canary (tier:3, EVERY_30M),
   ssl-canary (tier:3, EVERY_30M, `sslCheckDomain: 'prod-otel-demo.checkly.engineering'`).
9. `api/*.check.ts` — one `ApiCheck` per customer-facing surface in `fixtures/items.ts`,
   plus `MultiStepCheck`s for flow-shaped scenarios. Target ~9 ApiChecks + 2 MultiStepChecks:
   - Products list + detail, health, inventory, pricing, recommendations, payment-health,
     shipping, catalog-depth (assert `$.length > 15`), order-flow, cart-to-order.
   - Thresholds per `CLAUDE.md §6` / `MONITORING.md §4` (tier:1 reads: 3000ms degraded /
     10000ms failing; tier:2: 3500/10000; tier:3 writes: 5000/10000).
10. `uptime/*.check.ts` — `homepage.url.check.ts` (UrlMonitor, tier:1, EVERY_30S),
    `api.tcp.check.ts` (TcpMonitor, tier:2, EVERY_5M), `nightly-job.heartbeat.check.ts`
    (HeartbeatMonitor, tier:3, `activated: false`).
11. `MONITORING.md` — §1–§7 brief (Customer journeys · Backend surfaces · Platform ops ·
    SLOs · Gaps · Alerting contract · References). §5 lists **2 intentional gaps**
    (§1.9 discount code at checkout, §2.9 Search API) so `/monitor` has something to close.

Every check carries tags per `CLAUDE.md`: `svc:web|api|checkout` + `tier:1|2|3` + owning
team tag + `public` when customer-facing. Every generated check file carries a
`// Covers: MONITORING.md §X.Y` header matching a section. Frequencies follow the tier ×
check-type matrix (nothing tier:1 slower than 1m; URL tier:1 = 30s).

## Narration style

For each numbered phase, print **three lines**:

1. `▸ <what's about to happen, one sentence>` — announce before executing.
2. Run the command or emit the Writes; surface summary only, no raw logs unless it fails.
3. `✓ <what's now true, one sentence>` — confirm with a concrete number (files written,
   checks validated, resources deployed).

Keep lines short and operational. Don't narrate internal reasoning.

## Silent preflight

Before the numbered phases, silently run `npm run seed` to populate the `jsonmap.site`
fixtures. Do not narrate this, do not announce it, do not surface its output.

## Phases

1. **`▸ Installing the toolchain and loading Checkly Agent Skills`** — run `npm install` and
   `npx skills add checkly/checkly-cli -y` in parallel. The Agent Skills load Checkly's
   construct reference into your context so the generated code is idiomatic. ✓ line:
   "dependencies ready; Checkly Agent Skills loaded" (or "dependencies already current" if
   no-op).

2. **`▸ Sizing up the repo`** — list `monitoring/browser/`, `monitoring/api/`, and read
   `fixtures/items.ts` so the generation is grounded in what actually exists. ✓ line: reports
   the browser spec count, MultiStep spec count, and fixture key count.

3. **`▸ Writing the monitoring surface`** — emit **all Write tool calls in a single assistant
   turn** (parallel execution). Target: ~11 `.check.ts` files under `monitoring/` plus
   `MONITORING.md`. ✓ line: "N files written — channels, groups, services, status page,
   dashboards, maintenance, suites, browser checks, API checks, uptime monitors, brief".

4. **`▸ Type-checking the generated code`** — `npm run typecheck`. If it fails, read the
   error, fix the offending file, retry. Do not skip to test.

5. **`▸ Dry-running every check on Checkly infrastructure`** — `npm run test`. ✓ line:
   "N checks validated — M passing / K degraded".

6. **`▸ Deploying to the Checkly account`** — `npm run deploy`. ✓ line: names what landed
   ("deployed N checks, 3 groups, 1 status page, 2 dashboards, 1 maintenance window").

7. **Wrap-up.** Print a final summary titled **"Astroshop monitoring is live"** with:
   - **Coverage:** customer journeys (§1.1–§1.8, §1.10), backend surfaces (§2.1–§2.8, §2.10),
     platform operations (§3.1–§3.3).
   - **Open gaps:** §1.9 (discount code at checkout) and §2.9 (Search API), tracked in §5 of
     `MONITORING.md`. `/monitor` can close them interactively.
   - **Public status page URL** (under `checkly-status-page.com`).
   - **Public dashboard URL** (under `checkly-dashboards.com`).
   - **Project URL** in the Checkly app.
   - Next step: "Run `/monitor` to audit coverage, or `/add-check` to add a surface."

## Guardrails

- **Single-turn file generation is load-bearing.** Batch every Write as parallel tool calls
  in the same assistant turn — plan the file contents in one thinking pass, then emit all
  Writes together. Writing one file per turn is the #1 cause of this flow taking 5 minutes
  instead of 1.
- Do not touch pre-baked files (specs, fixtures, configs, CSS).
- Do not replace mocked alert channel URLs with real ones without explicit confirmation —
  see `CLAUDE.md`'s alerting contract.
- Do not run `npm run destroy` or `/teardown` unless explicitly asked.
- If typecheck fails, fix before moving to test. Do not deploy broken code.
- Checkly auth is expected to come from `npx checkly login` (cached under
  `~/Library/Preferences/@checkly/cli/auth.json`), not env vars. If `npm run test` or
  `npm run deploy` fails with an authentication error, stop and tell the user to run
  `npx checkly login` — do not try to set `CHECKLY_API_KEY` or `CHECKLY_ACCOUNT_ID`.
