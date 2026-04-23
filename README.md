# Blueprint AI Demo

A **pull-and-run Checkly CLI project** designed to be driven by Claude Code. Clone it, run
one slash command, and you'll have a full monitoring-as-code setup — checks of every major
type, groups, alert channels (mocked), a public status page, two dashboards, a maintenance
window, and CI — deployed to your Checkly account.

This repo is not meant to be a reference architecture. It's a **demo blueprint**: every
decision optimizes for quickly standing up a complete, realistic-looking monitoring surface
against a sample e-commerce target ("Astroshop") that a presenter can pitch against.

## Before you run it

1. **Log in to Checkly** from the CLI — this is a prerequisite for `npm run test` and
   `npm run deploy`:
   ```
   npx checkly login
   ```
   Pick the shared demo account from the team vault when prompted. Credentials get
   cached under `~/Library/Preferences/@checkly/cli/auth.json`, so every subsequent
   command runs non-interactively.
2. Drop the jsonmap key (and optionally a `DEMO_SEED`) into `.env`:
   ```
   cp .env.example .env
   # fill in JSONMAP_API_KEY
   # optionally set DEMO_SEED so your internal dashboard URL is unique
   ```
3. Make sure Claude Code is installed and you're signed in.

## The one-shot flow

Two entry points, same flow:

```
claude
> set up monitoring for Astroshop        # natural prompt — auto-fires the synthetic-monitoring skill
> /monitoring-deploy                     # explicit slash command — same phases, scripted
```

Either path runs:

1. `npm install` + `npx skills add checkly/checkly-cli -y` (in parallel).
2. Sizes up the repo (pre-baked Playwright specs under `monitoring/browser/` and
   `monitoring/api/`, plus API fixtures in `fixtures/items.ts`).
3. **Generates the monitoring surface live** — writes every `.check.ts` file in a single
   batched turn (targeting ~60 seconds), then a short `MONITORING.md` summarizing what
   went in and why.
4. `npm run typecheck` → `npm run test` → `npm run deploy`.

(Backend fixtures on `jsonmap.site` are seeded silently as setup plumbing — it doesn't
surface in the narrated flow.)

The repo ships with `monitoring/` intentionally empty of `.check.ts` files — only the
pre-baked Playwright specs, API fixtures, and dashboard CSS are committed. The Checkly
wiring appears live on screen as Claude writes it, and `MONITORING.md` is the last artifact
written: a post-hoc summary, not a pre-authored spec. When the flow finishes, the status
page and dashboard URLs print alongside the list of intentional gaps to address next.

## Extend it interactively

Show Claude generating new monitoring in-context:

| Prompt | What happens |
|---|---|
| `/add-check GET /orders/:id` | Writes an `ApiCheck` into `monitoring/api/`, wires it to `platformApiGroup` |
| `/add-flow apply coupon at checkout` | Writes a new Playwright spec into `monitoring/browser/` |
| `/publish-service Orders` | Adds a `StatusPageService` and card on the status page |
| `/wire-alert api → slack` | Narrows a group's alert channels |
| `/teardown` | `npx checkly destroy --force` + jsonmap teardown |

## What's in the box

| Construct | File |
|---|---|
| Mocked alert channels (Email · Slack · SMS · Webhook) | `monitoring/channels.check.ts` |
| `CheckGroupV2` × 3 (Storefront · Platform API · SRE) | `monitoring/groups.check.ts` |
| `StatusPageService` × 3 + `StatusPage` | `monitoring/services.check.ts` + `status-page.check.ts` |
| `Dashboard` × 2 (public + internal) with custom CSS | `monitoring/dashboards.check.ts` + `monitoring/astroshop.css` |
| `MaintenanceWindow` (weekly, recurring) | `monitoring/maintenance.check.ts` |
| `PlaywrightCheck` × 2 (test suites) | `monitoring/suites.check.ts` |
| `ApiCheck` × 9 + `MultiStepCheck` × 2 | `monitoring/api/*.check.ts` |
| `UrlMonitor` · `TcpMonitor` · `HeartbeatMonitor` | `monitoring/uptime/*.check.ts` |
| `BrowserCheck` × 4 (hero, browse, mobile canary, SSL canary) | `monitoring/browser/browser.check.ts` |
| Suite specs (7 tests across 2 suites) | `monitoring/browser/suites/**/*.spec.ts` |
| GitHub Actions (test on PR, deploy on main) | `.github/workflows/checkly.yml` |

## Alert channels are mocked

All four channels ship with `sendFailure: false` and placeholder URLs/emails. The wiring
exists so the Checkly UI renders the check-group-channel graph; nothing actually alerts.
Don't replace a placeholder without confirming first.

## Useful commands

```bash
npm run seed        # PUT fixtures to jsonmap.site
npm run teardown    # DELETE fixtures
npm run test        # npx checkly test
npm run deploy      # npx checkly deploy --force
npm run destroy     # npx checkly destroy --force
npm run typecheck   # tsc --noEmit
```

## Links

- [Checkly CLI docs](https://www.checklyhq.com/docs/cli/)
- [Constructs reference](https://www.checklyhq.com/docs/cli/constructs-reference/)
- [Checkly Agent Skills announcement](https://www.checklyhq.com/blog/checkly-agent-skills/)
- [OTel Demo app (the browser target behind Astroshop)](https://prod-otel-demo.checkly.engineering)
- [jsonmap.site (the API backend)](https://jsonmap.site)
