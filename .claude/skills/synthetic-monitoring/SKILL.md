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
  (not the `suites/` subdir). Read the spec filenames and the descriptive comment at the top
  of each to pick a sensible tier and frequency per the matrix in `CLAUDE.md`.
- **API checks** — read `fixtures/items.ts` to see what data exists on `jsonmap.site`. Build
  `ApiCheck`s for the customer-facing surfaces those fixtures imply. Build `MultiStepCheck`s
  wrapping the pre-baked `monitoring/api/*.spec.ts` flow scripts by path.
- **Uptime monitors** — at minimum one `UrlMonitor` for the homepage, one `TcpMonitor` for
  `jsonmap.site`, and one `HeartbeatMonitor` (deactivated) for a representative batch job.
- **Orchestration** — alert channels, groups (by team ownership — `storefrontGroup`,
  `platformApiGroup`, `sreGroup`), status-page services and status page, two dashboards
  (public themed with `astroshop.css`, internal with a `DEMO_SEED`-scoped URL), one weekly
  maintenance window, and two `PlaywrightCheck`s matching the suite projects in
  `playwright.config.ts`.

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

## Silent preflight

Before the numbered phases, silently run `npm run seed` to populate the `jsonmap.site`
fixtures. Do not narrate.

## Phases

1. **`▸ Installing the toolchain and loading Checkly Agent Skills`** — run `npm install` and
   `npx skills add checkly/checkly-cli -y` in parallel. ✓ line: "dependencies ready; Checkly
   Agent Skills loaded" (or "already current" if no-op).

2. **`▸ Sizing up the repo`** — list `monitoring/browser/` and `monitoring/api/`, read
   `fixtures/items.ts`, reread `CLAUDE.md` for conventions. ✓ line reports the browser spec
   count, MultiStep spec count, and fixture key count.

3. **`▸ Writing the monitoring surface`** — emit **all Write tool calls in a single assistant
   turn** (parallel execution). Plan contents in one thinking pass, then batch. `MONITORING.md`
   is the last Write in the batch. ✓ line reports total file count.

4. **`▸ Type-checking`** — `npm run typecheck`. If it fails, read the error, fix, retry.

5. **`▸ Dry-running checks on Checkly`** — `npm run test`. ✓ line: "N checks validated —
   M passing / K degraded".

6. **`▸ Deploying`** — `npm run deploy`. ✓ line: names what landed.

7. **Wrap-up.** Print a summary titled **"Astroshop monitoring is live"** with:
   - What got instrumented (one-line count per surface).
   - Intentional gaps to address next.
   - Public status page URL (under `checkly-status-page.com`).
   - Public dashboard URL (under `checkly-dashboards.com`).
   - Project URL in the Checkly app.
   - Next step: "Use `/add-check` to add a surface, or `/add-flow` for a new user journey."

## Guardrails

- **Single-turn file generation is load-bearing.** Emit every Write in one assistant turn.
  Writing one file per turn drags the generation phase from ~60s to 5 minutes.
- Do not touch pre-baked files (specs, fixtures, configs, CSS).
- Do not introduce `// Covers: MONITORING.md §X.Y` headers or `§X.Y` numbering anywhere.
  That convention is retired — checks are self-describing via filename + tags.
- Do not replace mocked alert channel URLs with real ones without explicit confirmation.
- Do not run `npm run destroy` or `/teardown` unless explicitly asked.
- If typecheck fails, fix before moving to test. Do not deploy broken code.
- Checkly auth is expected from `npx checkly login`, not env vars. If `npm run test` or
  `npm run deploy` fails with an authentication error, stop and tell the user to run
  `npx checkly login` — do not try to set `CHECKLY_API_KEY` or `CHECKLY_ACCOUNT_ID`.
