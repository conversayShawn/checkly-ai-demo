---
description: Audit MONITORING.md coverage. Reports which sections are covered, flags gaps, and offers to fill them.
---

You are performing a **live coverage audit** on stage. The audience will read along.
Narrate each step in one short line.

### Step 1 — Read the brief out loud

Open `MONITORING.md` and summarize it in 3–5 bullets. Don't dump the whole file; give the
audience the product shape (what the system is, what journeys matter, what's intentionally
not covered).

### Step 2 — Scan coverage

Grep every `.check.ts` and `.spec.ts` file under `monitoring/` for `Covers: MONITORING.md §`
comments. Build a map of **section → covering files**.

```
grep -rn "Covers: MONITORING.md §" monitoring/ | sort
```

### Step 3 — Report the matrix

Print a compact table like:

```
§1.1  Load homepage                ✓  (hero-banner.spec.ts, suite homepage, browse-products)
§1.2  Open product detail page     ✓  (browse-products.spec.ts)
§1.3  Currency switcher            ✓  (currency-switcher.spec.ts)
§1.4  Product recommendations      ✓  (product-recommendations.spec.ts)
§1.5  Add to cart                  ✓  (product-and-cart.spec.ts)
§1.6  Select quantity              ✓  (product-quantity.spec.ts)
§1.7  Empty cart                   ✓  (cart-management.spec.ts)
§1.8  Complete checkout            ✓  (checkout.spec.ts)
§1.9  Apply discount code          ✗  GAP
§1.10 Mobile viewport canary       ✓  (mobile-canary.spec.ts)
§2.1  Product catalog              ✓  (products.check.ts × 2, order-flow body, cart-to-order body)
§2.2  Order service                ✓  (order-flow.check.ts, cart-to-order body)
§2.3  Health endpoint              ✓  (health.check.ts)
§2.4  Inventory                    ✓  (inventory.check.ts, cart-to-order body)
§2.5  Pricing                      ✓  (pricing.check.ts, cart-to-order body)
§2.6  Recommendations              ✓  (recommendations.check.ts, cart-to-order body)
§2.7  Payment gateway health       ✓  (payment-health.check.ts)
§2.8  Shipping estimate            ✓  (shipping.check.ts)
§2.9  Search API                   ✗  GAP
§2.10 Catalog depth canary         ✓  (catalog-depth.check.ts)
§3.1  Homepage reachability        ✓  (homepage.url, api.tcp)
§3.2  Scheduled jobs               ✓  (nightly-job.heartbeat — deactivated)
§3.3  SSL cert expiry              ✓  (ssl-canary.spec.ts, via sslCheckDomain)
```

### Step 4 — Offer to fill the gaps

State what's missing in plain English (e.g. "No check proves a customer can apply a discount
code at checkout" and "No check proves the search endpoint returns results"). Ask the user
which gap to fill. Do not pick one on their behalf.

### Step 5 — When the user picks a gap, generate the check

- Write the new file in the right place (`.spec.ts` for journeys, `.check.ts` for APIs).
- Add a `// Covers: MONITORING.md §X.Y — <one-line summary>` header.
- Remove the gap from §5 of `MONITORING.md` (that section is a list of intentional gaps —
  once filled, the entry should be struck through or deleted, with a one-word note).
- Run `npm run test` on the new check only to prove it works, then `npm run deploy`.
- When deploy finishes, rerun step 3 so the audience sees the row flip from ✗ to ✓.
