---
name: synthetic-monitoring
description: Use this skill when the user asks to set up, stand up, build, generate, or instrument synthetic monitoring for an app or API via a natural prompt. Fires on prompts like "set up monitoring for my storefront at X", "build monitoring for Astroshop", "instrument this app with Checkly", "generate checks for my shop", "monitor prod-otel-demo". The skill writes the .check.ts wiring live — no templates, no pre-authored spec. Also invoked by the `/monitoring-deploy` slash command as its scripted entry point.
---

The user is asking you to stand up Astroshop's monitoring-as-code surface from a natural
prompt. You generate the Checkly CLI code **live** — reading the repo's already present Playwright
specs and API fixtures to decide what to instrument, then writing the `.check.ts` files from
scratch. The target URL and API base are configured in `CLAUDE.md`; you don't probe them.

Speak as if you're an on-call engineer standing this up for Astroshop production — not as if
you're running a demo.

## Already present (do NOT regenerate)

- `monitoring/browser/*.spec.ts` — Playwright specs against `prod-otel-demo.checkly.engineering`.
- `monitoring/browser/suites/<name>/*.spec.ts` — suite specs for `PlaywrightCheck`.
- `monitoring/api/*.spec.ts` — `MultiStepCheck` flow scripts against `jsonmap.site`.
- `monitoring/astroshop.css` — dashboard theme.
- `fixtures/items.ts`, `fixtures/seed.ts`, `fixtures/teardown.ts`.
- `package.json`, `checkly.config.ts`, `playwright.config.ts`, `.env.example`.

Everything else under `monitoring/` is absent in the starting repo state — you generate it.

## What to generate

You decide the shape of the monitoring surface. Use the repo's inputs to ground your
choices — do not follow a prescribed checklist:

- **Browser checks** — one `BrowserCheck` per `.spec.ts` directly under `monitoring/browser/`
  (not the `suites/` subdir). Pick tier and frequency from the **filename alone** (e.g.
  `hero-banner` / `browse-products` are hot customer paths → tier:1; `mobile-canary` and
  `ssl-canary` are canaries → tier:3). Do **not** open the spec files to "confirm" — the
  filenames are self-describing and opening them wastes seconds per file.
- **API checks** — read `fixtures/items.ts` once to see what data exists on `jsonmap.site`.
  Build `ApiCheck`s for the customer-facing surfaces those fixtures imply. Build
  `MultiStepCheck`s wrapping the pre-baked `monitoring/api/*.spec.ts` flow scripts **by path
  only** (don't open them either).
- **Uptime monitors** — at minimum one `UrlMonitor` for the homepage, one `TcpMonitor` for
  `jsonmap.site`, and one `HeartbeatMonitor` (deactivated) for a representative batch job.
- **Orchestration** — alert channels, groups (by team ownership — `storefrontGroup`,
  `platformApiGroup`, `sreGroup`), status-page services and status page, two dashboards
  (public themed with `astroshop.css`, internal with a `DEMO_SEED`-scoped URL), one weekly
  maintenance window, and two `PlaywrightCheck`s — one per suite directory you `ls`'d
  (`cart-and-checkout` and `homepage-and-browsing`). The Playwright project names in
  `playwright.config.ts` already match those directory names exactly — do **not** open
  `playwright.config.ts` to verify.

Tags, naming, logical-ID prefixes, and the tier × frequency matrix are all fixed in
`CLAUDE.md`. Follow them exactly. **Do not** add `// Covers:` headers or `§X.Y` numbering —
those conventions are retired.

## MONITORING.md is an output, not a driver

Write `MONITORING.md` **last**, after the checks are in place. It is a short, post-hoc
summary of what you built and why — not a spec, not verbose, no section numbering. Half a
page at most. Suggested shape:

- What Astroshop is (one paragraph).
- What's instrumented, grouped by surface — one line per check with the reason.
- Intentional gaps (what you'd add next, and why you didn't).
- Public status page / dashboard URLs.

## Narration style

For each numbered phase, print **three lines**:

1. `▸ <what's about to happen, one sentence>` — announce before executing.
2. Run the command or emit the Writes; surface summary only, no raw logs unless it fails.
3. `✓ <what's now true, one sentence>` — confirm with a concrete number.

Keep lines short and operational.

## Background preflight (non-blocking)

At the very start of the flow, kick off **two background tracks** (Bash tool with
`run_in_background: true`) and immediately proceed — do not wait, do not narrate, do not
surface their output:

- **Track A:** `npm install && npm run seed` — install first, then seed (seed depends on
  `tsx` from `node_modules`, so it **must** wait for install). Chained `&&` in a single
  background shell. Typical time: 5–15s cold, ~3s warm.
- **Track B:** `npx skills add checkly/checkly-cli -y` — loads the Checkly construct
  reference into Claude's context; 5–10s on first run, <1s cached.

Both tracks finish well before phase 3 (`npm run test`), which is the natural barrier. Phase
2 (code generation) runs concurrently — generation is purely local Writes and doesn't depend
on `node_modules`, Agent Skills, or seeded fixtures being present yet.

**Fire each preflight track exactly once.** Do not re-seed, re-install, or re-add Agent
Skills "to be safe" after the initial background fires. The seed is idempotent and has a
skip-path; one run is enough. If a preflight track fails with a non-zero exit code, surface
the error to the operator — do **not** silently retry.

## Phases

1. **`▸ Sizing up the repo`** (must complete in under ~3 seconds) — do exactly three things,
   **in one parallel tool batch**:
   - `ls monitoring/browser/` and `ls monitoring/browser/suites/` and `ls monitoring/api/`
     to enumerate spec filenames.
   - Read `fixtures/items.ts` (single Read).
   - That's it. `CLAUDE.md` is already in context — don't reread. Do **not** open any
     `.spec.ts` file; filenames alone carry intent.
   ✓ line: "N browser specs, M MultiStep specs, K fixture keys; toolchain still loading
   in background".

2. **`▸ Writing the monitoring surface`** — emit **all Write tool calls in a single assistant
   turn** (parallel execution). Plan contents in one thinking pass, then batch. `MONITORING.md`
   is the last Write in the batch. This runs concurrently with the background `npm install` +
   Agent Skills load from the preflight; the two tracks converge at phase 3. ✓ line reports
   total file count.

3. **`▸ Dry-running checks on Checkly`** — `npm run test`. Checkly's test compiles the TS
   project end-to-end, so no separate typecheck phase is needed. By now the background
   toolchain load has long since finished. If compile errors surface, read, fix, retry.
   ✓ line: "N checks validated — M passing / K degraded".

4. **`▸ Deploying`** — `npm run deploy`. ✓ line: names what landed.

5. **Wrap-up.** Print a summary titled **"Astroshop monitoring is live"** with:
   - What got instrumented (one-line count per surface).
   - Intentional gaps to address next.
   - Public status page URL (under `checkly-status-page.com`).
   - Public dashboard URL (under `checkly-dashboards.com`).
   - Project URL in the Checkly app.
   - Next step: "Use `/add-check` to add a surface, or `/add-flow` for a new user journey."

## Guardrails

- **Single-turn file generation is load-bearing.** Emit every Write in one assistant turn.
  Writing one file per turn drags the generation phase from ~60s to 5 minutes.
- **Read exactly one pre-baked file: `fixtures/items.ts`.** Nothing else. Not `.spec.ts`
  files, not `playwright.config.ts`, not `checkly.config.ts`, not `package.json`, not
  `tsconfig.json`. Filenames and `ls` output carry enough intent; the configs are already
  correct and match the conventions below. Opening files "to verify" is the #1 source of
  multi-minute hangs — if uncertain about a detail, **emit reasonable code and let
  `npm run test` (phase 3) catch any mismatch**. Don't pre-verify.
- Do not touch pre-baked files (specs, fixtures, configs, CSS).
- Do not introduce `// Covers: MONITORING.md §X.Y` headers or `§X.Y` numbering anywhere.
  That convention is retired — checks are self-describing via filename + tags.
- Do not replace mocked alert channel URLs with real ones without explicit confirmation.
- Do not run `npm run destroy` or `/teardown` unless explicitly asked.
- If `npm run test` surfaces compile errors, fix and rerun test. Do not deploy broken code.
- Checkly auth is expected from `npx checkly login`, not env vars. If `npm run test` or
  `npm run deploy` fails with an authentication error, stop and tell the user to run
  `npx checkly login` — do not try to set `CHECKLY_API_KEY` or `CHECKLY_ACCOUNT_ID`.
