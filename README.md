# Blueprint AI Demo

A **pull-and-run Checkly CLI demo** designed to be driven by Claude Code. Clone it, run one
slash command, and you'll have a full monitoring-as-code setup — checks of every major type,
groups, alert channels (mocked), a public status page, two dashboards, a maintenance window,
and CI — deployed to a shared demo Checkly account.

This repo is not meant to be a reference architecture. It's a **demo blueprint**: every
decision optimizes for "works in 60 seconds on stage".

## Before you demo

1. Grab the shared-demo-account credentials from the team vault and drop them into `.env`:
   ```
   cp .env.example .env
   # fill in CHECKLY_API_KEY, CHECKLY_ACCOUNT_ID, JSONMAP_API_KEY
   ```
2. Make sure Claude Code is installed and you're signed in.

## Read this first: `MONITORING.md`

`MONITORING.md` is the plain-English source of truth for what this demo monitors and why —
no Checkly jargon. Every check traces back to a section in that file via a one-line
`// Covers: MONITORING.md §X.Y` header comment, and `/monitor` audits coverage against
it live. The audience reads `MONITORING.md` first, then watches Claude generate the code.

## The demo (≈ 1 minute)

```
claude
> /demo-setup
```

`/demo-setup` runs, in order:

1. **Reads `MONITORING.md` out loud** so the audience sees the intent before any code moves.
2. `npx skills add checkly/checkly-cli -y` — installs Checkly's official Agent Skills.
3. `npm install`
4. `npm run seed` — creates fixture items on `jsonmap.site`.
5. `npm run test` — dry-runs every check on Checkly infra.
6. `npm run deploy` — deploys everything.

It prints the status page and dashboard URLs when done, plus which `MONITORING.md` sections
are covered and which are still gaps.

## The headline live moment: `/monitor`

```
> /monitor
```

`/monitor` reads `MONITORING.md`, greps every check/spec for `Covers: §X.Y` markers, and
prints a section-by-section coverage matrix. The intentional gaps in §5 of the brief
(discount code at checkout, search API) show up as `✗`. The presenter picks one; Claude
writes the missing check with narration, deploys, and the ✗ flips to ✓.

This is the moment that makes AI-first monitoring visible to someone who's never seen
Checkly before.

## Extend it live

Mid-demo, show Claude generating new monitoring in-context:

| Prompt | What happens |
|---|---|
| `/monitor` | Audits `MONITORING.md` coverage, flags gaps, offers to fill them |
| `/add-check GET /orders/:id` | Writes an `ApiCheck` into `monitoring/api/`, wires it to `apiGroup` |
| `/add-flow apply coupon at checkout` | Writes a new Playwright spec into `monitoring/browser/` |
| `/publish-service Orders` | Adds a `StatusPageService` and card on the status page |
| `/wire-alert api → slack` | Narrows a group's alert channels |
| `/demo-reset` | `npx checkly destroy --force` + jsonmap teardown |

## What's in the box

| Construct | File |
|---|---|
| Mocked alert channels (Email · Slack · SMS · Webhook) | `monitoring/channels.check.ts` |
| `CheckGroupV2` × 3 (api · browser · uptime) | `monitoring/groups.check.ts` |
| `StatusPageService` × 3 + `StatusPage` | `monitoring/services.check.ts` + `status-page.check.ts` |
| `Dashboard` × 2 (public + internal) | `monitoring/dashboards.check.ts` |
| `MaintenanceWindow` (weekly, recurring) | `monitoring/maintenance.check.ts` |
| `PlaywrightCheck` × 2 (test suites) | `monitoring/suites.check.ts` |
| `ApiCheck` × 2 + `MultiStepCheck` | `monitoring/api/*.check.ts` |
| `UrlMonitor` · `TcpMonitor` · `HeartbeatMonitor` | `monitoring/uptime/*.check.ts` |
| `BrowserCheck` × 2 (wrap top-level specs) | `monitoring/browser/browser.check.ts` |
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
- [OTel Demo app (target)](https://prod-otel-demo.checkly.engineering)
- [jsonmap.site (mock API)](https://jsonmap.site)
