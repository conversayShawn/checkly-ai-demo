# Astroshop Monitoring Demo

A pull-and-run Checkly CLI project driven by Claude Code. **Two natural-language prompts**
stand up a complete monitoring-as-code surface against a sample e-commerce target
("Astroshop"), then trigger Checkly's native LLM-driven RCA when something breaks.

This is a **demo blueprint for the Solutions Engineering team** — not a reference
architecture. Optimize for: *looks real, lands fast, recovers cleanly*.

---

## Quick start

```bash
git clone https://github.com/conversayShawn/checkly-ai-demo.git
cd checkly-ai-demo
npm install                              # Checkly CLI 9.5+, Playwright 1.54.1
npx checkly login                        # pick the shared SE demo account
npx skills add checkly/checkly-cli -y    # Checkly Agent Skills for Claude Code
cp .env.example .env                     # optional: set DEMO_SEED=<your-initials>
claude                                   # then type prompt 1 below
```

No API keys, seed data, or backend env vars — the storefront API is public. Project
settings (`.claude/settings.json`) already pin thinking effort to **medium** and
`acceptEdits` mode with the Checkly/npm commands pre-allowed.

---

## The two demo prompts

These are the spine of the demo. Type them verbatim in `claude` from the repo root.

### 1. Build the monitoring  *(~60–90s with thinking effort = medium)*

> **Please monitor my webshop at https://prod-otel-demo.checkly.engineering/ and all its key APIs.**

Auto-fires the `synthetic-monitoring` skill. Claude reads `openapi.yaml`, generates every
`.check.ts` file **live** (channels, groups, status page with components and incident automation, dashboards,
maintenance window, browser checks, API checks, MultiStep flows, uptime monitors), tests
on Checkly infrastructure, deploys,
then writes `MONITORING.md` as a closing summary. Status page and dashboard URLs print in
the wrap-up.

### 2. Diagnose a failing check  *(~60–120s; floor is Checkly's RCA backend job)*

> **My checkout check started failing, could you run RCA and tell me what's going on?**

Auto-fires the `root-cause` skill. Claude finds failing checks, locates the latest error
group, runs Checkly's native RCA (an LLM ingests the Playwright traces — DOM snapshots,
network logs, screenshots, console output — for the last few failing runs), and prints a
markdown block with classification, root cause, user impact, and evidence. Frames the
next action by the check's tier + owning team.

**To trigger a failure on demand:** flip a feature flag on the OTel demo backend (e.g.
`adServiceFailure`, `cartServiceFailure`) and wait one tier:1 1-min cycle for the
cart-and-checkout suite to catch it.

### Fallbacks (if a natural prompt doesn't trigger the skill)

`/monitoring-deploy` mirrors prompt 1; `/rca [surface]` mirrors prompt 2 (e.g.
`/rca checkout`). Same flow, scripted invocation.

---

## Pre-demo checklist

⚠ Run through **every** item before showtime — several are silent failures that surface
mid-demo as a wall of red.

### 1. Checkly auth — `npx checkly login`

Pick the shared SE demo account from the team vault. Credentials cache under
`~/Library/Preferences/@checkly/cli/auth.json` and persist across sessions; per-machine
one-time setup.

### 2. Optional — `DEMO_SEED` in `.env`

```
cp .env.example .env
# set DEMO_SEED=<your-initials> for readable status page / dashboard slugs
```

The backend API is public, so there are no keys to configure. Without `DEMO_SEED` the
slugs get a short hash derived from your username and hostname.

### 3. Pre-install Checkly's Agent Skills

```
npx skills add checkly/checkly-cli -y
```

Loads the current Checkly construct reference. Without it, Claude writes from
training-data memory and emits older-schema code (`CheckGroup` instead of `CheckGroupV2`,
top-level `url`/`host` instead of nested `request: {}`) that fails the deploy. The skill
installs this in the background too as a safety net, but pre-installing skips a first-run
delay.

### 4. Confirm Claude's thinking effort is **medium or low**

The repo's `.claude/settings.json` sets `"effortLevel": "medium"`; check that nothing in
your user settings or `/config` overrides it upward. High effort spends 1–3+ minutes
deliberating before writing any `.check.ts` file — the single biggest source of dead air
on stage. Medium/low cuts that to seconds with no measurable quality loss for this task.

### 5. Pre-warm `node_modules` — `npm install`

A cold first run adds 5–15s. The flow installs in the background, but pre-warming makes
prompt 1 visibly snappier.

### 6. Dry-run prompt 1 once before customer-facing demos

Verify checks deploy, status page is populated, all three groups (Storefront / Platform
API / SRE) have checks. Then either leave it deployed (re-running prompt 1 is idempotent)
or `/teardown` to reset.

---

## Talking points while Claude works

Narrate to the customer in roughly this rhythm.

**During prompt 1 (synthetic-monitoring):**

- *Read + preflight, ~2s* — "Claude reads our OpenAPI spec — the same artifact your
  backend team already publishes. The `x-monitoring` extensions carry tier and
  status-page-service mapping per endpoint."
- *Live generation, ~30–60s* — "Watch the files appear. Channels, groups, status page,
  dashboards. ApiCheck per endpoint, BrowserCheck per pre-built Playwright spec,
  MultiStepCheck for the order flows. Tags, frequencies, group assignments — all derived
  from the spec, not hardcoded."
- *Test, ~10–30s* — "Checkly compiles the project and dry-runs every check on its own
  infrastructure. Catches schema errors before deploy."
- *Deploy, ~5–10s* — "Pushed. Status page and dashboards are live."

**During prompt 2 (root-cause):**

- *Scan + error group, ~5s* — "Listing every failing/degraded check across the account,
  then pulling the most recent error group — the bucket Checkly uses to group all
  failures with the same shape."
- *Checkly RCA, 30s–2min* — "Now Checkly's native RCA. The LLM ingests the Playwright
  traces — DOM snapshots, network requests, screenshots, console output — for the last
  few failing runs. **This isn't Claude reasoning over them; this is Checkly's own
  service.**"
- *Next action* — "Routed by the check's tier and owning team. Tier 1 → page on-call.
  Tier 2 → notify Slack. Tier 3 → log only."

---

## Gotchas

| Symptom | Cause | Fix |
|---|---|---|
| Status page / dashboard URL 404s | Used path-style; Checkly serves them as subdomains | Format is `https://<slug>.checkly-status-page.com`, never `…/<slug>` |
| SRE group empty after deploy | Uptime checks missing `group: sreGroup` property | `npx checkly check list`; redeploy if needed |
| RCA hangs for minutes | `rca run` paired with any `-o` flag silently disables `-w` | Skill enforces `npx checkly rca run -e <id> -w` (no `-o`); never sleep-poll |
| 1–3 min "Newspapering…" block before any code appears | High thinking effort overriding the repo's `medium` setting | Drop to medium/low (checklist step 4) |
| `CheckGroup is deprecated` warnings or schema errors at deploy | Agent Skills not loaded; Claude used outdated training-data shapes | Pre-install via checklist step 3 |
| Slack webhook / phone-number validator rejects a channel | Placeholder values too short or wrong format | Skill specifies valid placeholder shapes; don't override on stage |
| Dashboard slug collision on shared account | Multiple presenters with the same default `DEMO_SEED` | Set `DEMO_SEED=<initials>` in `.env` |
| Wrap-up references a non-existent `app.checklyhq.com/projects/...` URL | Hallucinated link | Skill explicitly forbids it; only print status-page + dashboard URLs |
| Generated check files contain `demo` / `sample` / `blueprint` framing | Skill drift / old run | Up-to-date skill bans demo language in code, comments, and `MONITORING.md` |

---

## What's in the repo

**Pre-baked (committed, immutable during the demo):**

| File | Purpose |
|---|---|
| `openapi.yaml` | API surface description with `x-monitoring.*` extensions driving tier/svc tag derivation |
| `monitoring/browser/*.spec.ts` | 4 Playwright specs (hero-banner, browse-products, mobile-canary, ssl-canary) |
| `monitoring/browser/suites/<dir>/*.spec.ts` | 7 spec files across 2 PlaywrightCheck suite projects (`cart-and-checkout`, `homepage-and-browsing`) |
| `monitoring/api/*.spec.ts` | 2 MultiStepCheck flow scripts (`order-flow.spec.ts`, `cart-to-order.spec.ts`) |
| `monitoring/astroshop.css` | Custom CSS for the public status dashboard |
| `package.json`, `checkly.config.ts`, `playwright.config.ts` | Tooling configs |

**Generated live by the `synthetic-monitoring` skill (not committed):**

- `monitoring/channels.check.ts` — 4 mocked alert channels (Email · Slack · SMS · Phone/Webhook)
- `monitoring/groups.check.ts` — 3 `CheckGroupV2`s by team ownership (storefront · platform-api · sre)
- `monitoring/status-page.check.ts` — `StatusPageV3` + 3 components + 3 automation rules
- `monitoring/dashboards.check.ts` — public (themed) + internal (DEMO_SEED-scoped)
- `monitoring/maintenance.check.ts`
- `monitoring/suites.check.ts` — `PlaywrightCheck` × 2 (tier:1)
- `monitoring/browser/browser.check.ts` — `BrowserCheck` × 4
- `monitoring/api/*.check.ts` — `ApiCheck` per OpenAPI endpoint + `MultiStepCheck` × 2
- `monitoring/uptime/*.check.ts` — `UrlMonitor` + `TcpMonitor` + `HeartbeatMonitor`
- `MONITORING.md` — post-hoc summary, not a driving spec

---

## Alert channels are mocked

All four channels ship with `sendFailure: false` and `sendRecovery: false`. The wiring
exists so Checkly's UI renders the channel-group-check graph; nothing actually fires.
**Do not flip `sendFailure: true` on stage** — the account is shared, and you'd page real
on-callers. If a customer asks about live alerting, walk them through what the production
wiring would look like, then leave the demo account silenced.

---

## Resetting between demos

```bash
npm run reset                       # destroy Checkly resources, restore working tree to last commit, upgrade CLI
npm run reset -- --no-upgrade       # same, but leave package.json / lockfile untouched
npm run reset -- --keep-generated   # destroy resources only; keep generated files for diffing
```

`reset` never touches ignored paths (`.env`, `node_modules`, `.checkly`). Re-running
prompt 1 afterwards re-generates everything from scratch.

---

## Useful commands

```bash
npm run test        # npx checkly test
npm run deploy      # npx checkly deploy --force
npm run destroy     # npx checkly destroy --force
npm run reset       # destroy + restore working tree + upgrade CLI (see above)
npm run typecheck   # tsc --noEmit (rarely needed; `npm run test` compiles too)
```

CI reference (not part of the demo flow): `.github/workflows/checkly-action.yml` uses the
official GitHub Action, `.github/workflows/checkly-cli.yml` runs plain `npx checkly` so it
ports to any CI provider. Both authenticate with `CHECKLY_API_KEY` / `CHECKLY_ACCOUNT_ID`
secrets instead of `checkly login`.

---

## Skills, commands, and where to look

- `.claude/skills/synthetic-monitoring/SKILL.md` — auto-triggers on prompt 1 phrasing.
- `.claude/skills/root-cause/SKILL.md` — auto-triggers on prompt 2 phrasing.
- `.claude/commands/monitoring-deploy.md` — scripted fallback for prompt 1.
- `.claude/commands/rca.md` — scripted fallback for prompt 2.
- `.claude/commands/{add-check,add-flow,publish-service,wire-alert,teardown}.md` — extension points to demo on top.
- `CLAUDE.md` — agent brief, conventions, alerting contract, tier × frequency matrix.

---

## Links

- [Checkly CLI docs](https://www.checklyhq.com/docs/cli/)
- [Constructs reference](https://www.checklyhq.com/docs/cli/constructs-reference/)
- [Checkly Agent Skills announcement](https://www.checklyhq.com/blog/checkly-agent-skills/)
- [OTel Demo app (browser + API target)](https://prod-otel-demo.checkly.engineering)
