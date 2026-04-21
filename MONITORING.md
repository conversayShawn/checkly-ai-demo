# Astroshop — Monitoring & SLOs

**Status:** Active · **Owner:** SRE (co-edited by service teams) · **Last reviewed:** 2026-04-03 · **Review cadence:** Monthly

Single source of truth for what we monitor in production and why. Every check in
`monitoring/` references a section here via a `// Covers: MONITORING.md §X.Y`
header. If a check has no cited section, it shouldn't exist; if a section has no
check, that's a gap and belongs in §5.

---

## The product

Astroshop is our direct-to-consumer storefront for astronomy gear (telescopes,
binoculars, mounts, accessories). Production: `https://prod-otel-demo.checkly.engineering`.

Revenue spine: **browse → product detail → cart → checkout**. Any break in that
chain is a P1 — treat it as user-visible outage until proven otherwise.
Non-revenue journeys (account, support, content) are covered by their owning
teams and are out of scope here.

The storefront reads from an internal product/order API (`jsonmap.site`, Bearer-
auth). That API is the only backend dependency in scope for this document.

## Service ownership

| Surface | Owner | Primary oncall |
|---|---|---|
| Storefront UI | Storefront | `#oncall-storefront` |
| Product & order APIs | Platform API | `#oncall-platform-api` |
| Uptime / infra / CDN | SRE | `#oncall-sre` |
| Search | Search (sister team) | `#oncall-search` |

Paging policy: alert channels in `monitoring/channels.check.ts` route to each team's
oncall rotation. Silenced-by-default channels are intentional — see §6.

---

## §1. Customer journeys

Flows a paying customer has to complete. If one of these fails in production,
someone loses a sale. Each is covered by at least one Playwright check running
from two regions on 10-minute cadence.

- **§1.1** — Customer can load the homepage and see featured products
- **§1.2** — Customer can open a product detail page from a listing
- **§1.3** — Customer can switch display currency (USD ↔ EUR) and see prices update
- **§1.4** — Customer can follow a "You May Also Like" recommendation to a new product
- **§1.5** — Customer can add a product to the cart from a product page
- **§1.6** — Customer can select a quantity greater than 1 and add to cart
- **§1.7** — Customer can empty their cart
- **§1.8** — Customer can complete a checkout and see an order confirmation
- **§1.9** — Customer can apply a discount code at checkout — _gap, see §5_
- **§1.10** — Homepage renders on a mobile viewport (drift canary, not a revenue gate)

---

## §2. Backend surfaces

The APIs the storefront depends on. If any of these degrade, users see it
indirectly (missing product data, stalled checkout, empty recommendations).
Each is covered by an API check with status code + body assertions.

- **§2.1** — Product catalog: `GET /items`, `GET /items/:key`
- **§2.2** — Order service: `GET /items/:orderKey` (orders are stored keyed by id)
- **§2.3** — Platform health endpoint: `GET /items/system-health` → `{status:"ok"}`
- **§2.4** — Inventory service: `GET /inventory/:sku` → `{available, warehouse}`.
  Called on every product detail page; blocks add-to-cart when `available: 0`.
- **§2.5** — Pricing service: `GET /pricing/:sku` → `{base, currency, discount}`.
  Called on product pages and cart; wrong price = refund tickets.
- **§2.6** — Recommendations: `GET /recommendations/:sku` → `{recommendedSkus[]}`.
  Powers "You May Also Like" (§1.4). Nice-to-have, not revenue-critical.
- **§2.7** — Payment gateway health: `GET /payment/health` → `{status, provider}`.
  Checkout dependency; red here means place-order will fail downstream.
- **§2.8** — Shipping estimates: `GET /shipping/:postcode` → `{cost, etaDays}`.
  Called during checkout step; slow = cart abandonment.
- **§2.9** — Search API: `GET /search?q=` — _gap, see §5_
- **§2.10** — Catalog depth canary: `GET /items` returns ≥ 16 items.
  Not a liveness check — §2.1 already covers that. Guards against fixture drift,
  accidental bulk deletes, and botched re-seeds.

---

## §3. Platform operations

Signals that don't map to a single user journey but tell us whether the platform
itself is alive. These run on a 1-minute cadence from every region.

- **§3.1** — Homepage reachability: HTTP 200 + TCP :443 open, latency under budget
- **§3.2** — Scheduled jobs: nightly backup heartbeat (24h cadence, 2h grace)
- **§3.3** — SSL certificate expiry on `prod-otel-demo.checkly.engineering`.
  Hourly canary; Checkly alerts on upcoming expiry with weeks of lead time.

---

## §4. SLOs and error budgets

Targets below are committed numbers; changing a threshold in a check file without
updating this table (or vice versa) is considered a drift bug. Error budget is
computed over a rolling 30-day window.

| Surface | Target | Notes |
|---|---|---|
| Homepage availability (§3.1) | 99.9% | 43.2 min/month budget. HTTP + TCP both count. |
| Homepage median response | < 3s | p50 from all regions. Above this = UX degradation. |
| Product catalog API (§2.1) | p95 < 3s, fail > 10s | Degraded between 3–10s. Backend is cached; sustained p95 breach implies cache miss storm. |
| Platform health endpoint (§2.3) | p95 < 3.5s, fail > 10s | Threshold widened after the Feb regression (INC-412). |
| Inventory API (§2.4) | p95 < 3s, fail > 10s | Loosened from 1.5s after the platform shared the same read path as catalog — tightening is a Q3 objective, not a paging decision. |
| Pricing API (§2.5) | p95 < 3s, fail > 10s | Same story as inventory — shared read path forced the widen; revisit when the pricing edge cache ships. |
| Recommendations API (§2.6) | p95 < 5s, fail > 10s | Deliberately tolerant — recs degrade gracefully on the frontend. |
| Payment gateway health (§2.7) | p95 < 3s, fail > 10s | If this breaches, pause merchandising pushes that drive checkout volume. |
| Shipping API (§2.8) | p95 < 3s, fail > 10s | Shipping latency shows up as dead air on the checkout step. |
| Checkout end-to-end (§1.8) | p95 < 10s for "Place Order" | Measured by the cart-and-checkout suite. |
| TCP :443 reachability (§3.1) | response < 3s | Generous — this is a liveness signal, not a perf one. |
| Nightly backup (§3.2) | Ping every 24h, 2h grace | Heartbeat deactivated until the new backup job is promoted (see STORE-3041). |

When a budget is 50% consumed, the owning team gets a notification; at 100%,
feature work for the affected surface pauses until we're back under budget.

---

## §5. Known coverage gaps

Surfaces we know are undermonitored and the reason they're not covered yet.
Not a wishlist — every entry here has a ticket and an owner.

- **§1.9 — Discount code at checkout.** The coupon engine is owned by Growth;
  their telemetry covers backend validation but we don't yet assert the
  user-facing flow end-to-end. Waiting on the new coupon UI (STORE-2847, Q2).
  Owner: Storefront.
- **§2.9 — Search API.** Search is mid-migration to the new Elasticsearch
  cluster (STORE-2919). Monitoring will be added once the new endpoint is
  promoted to `/search/v2` and the old one is decommissioned. Owner: Search.

If you're adding a gap, include a ticket reference and a named owner — an
uncaptured gap is a silent outage waiting to happen.

---

## §6. Alerting contract

- Alert channel definitions live in `monitoring/channels.check.ts`.
- Email, Slack, SMS, and webhook channels are wired to every group so the
  check-group-channel relationship is visible in the Checkly UI.
- **Channels are currently silenced** (`sendFailure: false`) pending the
  rotation handoff from the old Opsgenie setup (STORE-3102). Do not flip to
  `true` without SRE sign-off — doing so will page six people who aren't yet
  in the right rotation.
- **Paging tiers** are carried as check tags:
  - `tier:1` — pages the owning oncall (all revenue-spine checks).
  - `tier:2` — notifies via email + Slack only, no phone. Secondary signals.
  - `tier:3` — logs-only, for background or nice-to-have checks (e.g. recommendations).
  Routing is enforced through the alert-channel wiring per group.
- **Observation cadence** is a function of tier × check type. We don't set
  frequency ad-hoc — it's derived from the table below so that what we spend on
  observation matches what we'd do about a failure. If we won't page on it, we
  don't watch it by the minute.

  | Tier | Uptime (URL/TCP) | API | MultiStep | Browser / Playwright |
  |---|---|---|---|---|
  | `tier:1` (pages) | 30s | 1m | 1m | 1m |
  | `tier:2` (notifies) | 5m | 10m | — | 15m |
  | `tier:3` (logs) | 30m | 30m | 30m | 30m |

  The `tier:1` row is a hard floor: nothing we'd page on runs slower than 1m.

  Heartbeats are outside this table — their period is dictated by the upstream
  job they track, not by tier.
- Incident creation is wired via `triggerIncident` on the product-list API
  check (§2.1) to the Public API service on the status page.

---

## §7. References

- **Public status page:** `https://astroshop.checkly-status-page.com`
- **Public dashboard:** `https://astroshop-status.checkly-dashboards.com`
- **Internal dashboard** (auth required): ask #oncall-sre for the current URL
- **Maintenance windows:** weekly, Sunday 02:00–03:00 UTC (`monitoring/maintenance.check.ts`)
- **Runbooks:** `RUNBOOKS/checkout-degraded.md`, `RUNBOOKS/catalog-5xx.md` (private repo)
- **Incident log:** #incidents channel, postmortems in the `postmortems/` Notion space

## How to update this document

1. Open a PR against this file **and** the matching check(s) in the same changeset.
2. Tag the owning team for review (see §ownership).
3. If you're closing a gap from §5, remove the entry; if you're opening one,
   add it with a ticket + owner.
4. SRE does a full read-through every quarter; the `Last reviewed` date at the
   top is updated then.
