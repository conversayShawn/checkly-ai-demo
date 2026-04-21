# Blueprint AI Demo — agent brief

This repo is a **demo blueprint**: a pre-wired Checkly CLI project that shows how Claude Code
can stand up full monitoring-as-code (checks, groups, alert channels, status pages, dashboards)
against a real app. The monitored product in the brief is branded "Astroshop" — an imagined
direct-to-consumer astronomy-gear storefront. When narrating work to the user, speak as if
you are setting up and operating monitoring for Astroshop's production surfaces, not as if
you are running a demo.

## The source of truth is `MONITORING.md`

`MONITORING.md` is the plain-English brief describing what Astroshop monitors and why. Every
check and spec file carries a one-line `// Covers: MONITORING.md §X.Y` header that ties it
back to a specific section. The `/monitor` slash command audits coverage against the brief.

**When you add, modify, or remove a check, keep the `Covers:` header accurate.** If you
close a gap listed in §5, also update §5 in the brief.

## Targets

- **Browser / frontend:** `https://prod-otel-demo.checkly.engineering` (the Astroshop
  storefront runs on Checkly's hosted OTel demo shop).
- **API / backend:** `https://jsonmap.site/api/v1/items/:key` — a key/value-style backend.
  Auth via `Authorization: Bearer ${JSONMAP_API_KEY}`. Fixtures are defined in
  `fixtures/items.ts` and seeded with `npm run seed`.

## Account configuration

The repo ships against a single shared Checkly account for convenience. Credentials live in
a local `.env` file (gitignored) with `CHECKLY_API_KEY` and `CHECKLY_ACCOUNT_ID`.
`.env.example` documents the shape. `DEMO_SEED` (optional) parameterises the internal
dashboard's URL so multiple operators can coexist on the same account without slug
collisions. Do not suggest per-user onboarding, account creation, or login flows unless
explicitly asked.

## Alerting contract

All four alert channels in `monitoring/channels.check.ts` are **mocked** — `sendFailure` and
`sendRecovery` are both `false`, and the URLs/emails/phone numbers are placeholders. The
wiring exists so the Checkly UI renders the channel-group-check relationship; nothing
actually fires. **Do not replace a mocked URL with a real one without explicit
confirmation.**

Paging tier is carried as a check tag: `tier:1` (pages), `tier:2` (notifies), `tier:3`
(logs-only). Observation cadence is derived from tier × check type — see the matrix in
`MONITORING.md §6`. Nothing tier:1 runs slower than 1m.

## Layout

```
monitoring/
├─ channels.check.ts       # 4 mocked alert channels
├─ groups.check.ts         # storefrontGroup · platformApiGroup · sreGroup (by owning team)
├─ services.check.ts       # StatusPageService × 3 (web / api / checkout)
├─ status-page.check.ts    # single StatusPage with 2 cards
├─ dashboards.check.ts     # public + internal Dashboard (public uses astroshop.css)
├─ astroshop.css           # custom CSS for the public dashboard
├─ maintenance.check.ts    # recurring MaintenanceWindow
├─ suites.check.ts         # PlaywrightCheck × 2 (maps to playwright.config.ts projects)
├─ api/*.check.ts          # ApiCheck + MultiStepCheck against jsonmap
├─ uptime/*.check.ts       # UrlMonitor · TcpMonitor · HeartbeatMonitor
└─ browser/
   ├─ browser.check.ts     # BrowserCheck × 4 (wraps specs below)
   ├─ *.spec.ts            # Playwright specs referenced by browser.check.ts
   └─ suites/{name}/*.spec.ts   # run as PlaywrightCheck suites

fixtures/
├─ items.ts                # fixture definitions
├─ seed.ts                 # PUTs every fixture to jsonmap
└─ teardown.ts             # DELETEs every fixture

.claude/commands/
├─ monitoring-deploy.md    # one-shot setup flow
├─ teardown.md             # destructive reset
├─ add-check.md            # add a new check
├─ add-flow.md             # add a Playwright spec
├─ wire-alert.md           # route tags → channels
└─ publish-service.md      # expose a service on the status page
```

## Conventions

- **File suffix** — `.check.ts` means "registers Checkly resources"; `.spec.ts` means "Playwright spec".
  `checkMatch` is `monitoring/**/*.check.ts`.
- **Logical IDs** — every construct gets a stable, prefixed id: `api-*`, `uptime-*`, `suite-*`,
  `svc-*`, `dash-*`, `public-*`, `weekly-*`, plus team names for groups (`storefront`,
  `platform-api`, `sre`).
- **Tags** — every check carries `svc:web|api|checkout` + `tier:1|2|3`, its owning team tag,
  and `public` when customer-facing. See `MONITORING.md §6` for the full scheme.
- **Runtime** — pinned to `2025.04`. Playwright version matches (1.54.1).
- **No real notifications** — see Alerting contract above.
- **Skills** — `/monitoring-deploy` runs `npx skills add checkly/checkly-cli` so the
  official Checkly Agent Skills are loaded into Claude Code.

## Common tasks

| Want to… | Command |
|---|---|
| Run the full setup flow | `/monitoring-deploy` |
| Audit coverage against MONITORING.md | `/monitor` |
| Add a new check | `/add-check <description>` |
| Add a browser flow | `/add-flow <user journey>` |
| Change alert routing | `/wire-alert <tag → channel>` |
| Expose a service on the status page | `/publish-service <name>` |
| Reset everything | `/teardown` |
| Dry-run locally | `npm run test` |
| Deploy | `npm run deploy` |
