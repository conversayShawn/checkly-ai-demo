# Blueprint AI Demo

A **pull-and-run Checkly CLI project** designed to be driven by Claude Code. Clone it, run
one slash command, and you'll have a full monitoring-as-code setup — checks of every major
type, groups, alert channels (mocked), a public status page, two dashboards, a maintenance
window, and CI — deployed to your Checkly account.

This repo is not meant to be a reference architecture. It's a **demo blueprint**: every
decision optimizes for quickly standing up a complete, realistic-looking monitoring surface
against a sample e-commerce target ("Astroshop") that a presenter can pitch against.

## Before you run it

1. Grab the shared account credentials from the team vault and drop them into `.env`:
   ```
   cp .env.example .env
   # fill in CHECKLY_API_KEY, CHECKLY_ACCOUNT_ID, JSONMAP_API_KEY
   # optionally set DEMO_SEED so your internal dashboard URL is unique
   ```
2. Make sure Claude Code is installed and you're signed in.

## Read this first: `MONITORING.md`

`MONITORING.md` is the plain-English source of truth for what Astroshop monitors and why —
no Checkly jargon. Every check traces back to a section in that file via a one-line
`// Covers: MONITORING.md §X.Y` header comment, and `/monitor` audits coverage against it
live. Start there — then watch Claude generate the code.

## The one-shot flow

```
claude
> /monitoring-deploy
```

`/monitoring-deploy` runs, in order:

1. `npm install` — always runs first so the toolchain is present.
2. **Reads `MONITORING.md`** so the product intent is on screen before any code moves.
3. `npx skills add checkly/checkly-cli -y` — installs Checkly's official Agent Skills.
4. `npm run test` — dry-runs every check on Checkly infrastructure.
5. `npm run deploy` — deploys everything.

(The backend fixtures on `jsonmap.site` are seeded silently as part of this command — it's
demo plumbing that doesn't surface in the narrated flow.)

It prints the status page and dashboard URLs when done, plus which `MONITORING.md` sections
are covered and which are still gaps.

## The headline moment: `/monitor`

```
> /monitor
```

`/monitor` reads `MONITORING.md`, greps every check/spec for `Covers: §X.Y` markers, and
prints a section-by-section coverage matrix. The intentional gaps in §5 of the brief
(discount code at checkout, search API) show up as `✗`. Pick one; Claude writes the missing
check, deploys it, and the ✗ flips to ✓.

This is the moment that makes AI-first monitoring-as-code tangible to someone who hasn't
seen Checkly before.

## Extend it interactively

Show Claude generating new monitoring in-context:

| Prompt | What happens |
|---|---|
| `/monitor` | Audits `MONITORING.md` coverage, flags gaps, offers to fill them |
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
