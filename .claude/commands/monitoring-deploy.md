---
description: One-shot setup. Installs deps, registers Checkly's Agent Skills, seeds API fixtures, tests, deploys.
---

You are bootstrapping the Astroshop monitoring-as-code project against the configured
Checkly account. Speak as if you are an on-call engineer setting this up for Astroshop
production — not as if you're running a demo.

**Narration style.** For every numbered step below, print **three lines**:

1. `▸ <what's about to happen, one sentence>` — announce before executing.
2. Run the command; surface its summary only (no raw logs unless something fails).
3. `✓ <what's now true, one sentence>` — confirm on success, including a concrete number
   when there is one (files installed, checks validated, resources deployed, etc.).

Keep each line short and operational. Don't narrate internal reasoning. Don't skip lines —
the three-line rhythm is what makes the flow readable.

---

Before the numbered steps, **silently run `npm run seed`** to populate the backend
fixtures. Do not narrate this, do not announce it, and do not surface its output — it's
setup plumbing that doesn't belong in the operator-facing flow.

Then run these numbered steps in order, stopping only on hard failure:

1. **`npm install`** — make sure the toolchain is present before anything else runs.
   Idempotent. If everything is already installed, say so in the ✓ line ("dependencies
   already current — no install needed").

2. **Read `MONITORING.md`.** This is Astroshop's monitoring source of truth. In place of
   the usual command-style three lines, open the file and summarise it in 4–6 bullets:
   - What Astroshop is and the revenue spine.
   - The customer journeys that matter (§1) and the mobile canary (§1.10).
   - The backend surfaces (§2) with the SLOs that carry the tightest budgets.
   - The platform operations (§3): reachability, backup heartbeat, SSL watchdog.
   - The two intentional gaps in §5 — discount code (§1.9) and Search API (§2.9) — that
     `/monitor` can close interactively.
   - The alerting contract in §6: tier-driven paging (tier:1 pages, tier:2 notifies,
     tier:3 logs) and the tier × check-type frequency matrix.

3. **`npx skills add checkly/checkly-cli -y`** — install Checkly's official Agent Skills so
   Claude Code picks up the project's conventions automatically. **Run with `-y`** — the
   first install prompts otherwise and stalls the flow.

4. **`npm run test`** — dry-run every check from Checkly's own infrastructure. Don't dump
   the full log; in the ✓ line, report the check count and pass/fail summary ("20 checks
   validated — all green / N degraded").

5. **`npm run deploy`** — push every resource to the Checkly account. In the ✓ line, name
   what landed (e.g. "deployed 20 checks, 3 groups, 1 status page, 2 dashboards, 1
   maintenance window").

6. **Wrap-up.** After deploy, print a final summary block titled **"Astroshop monitoring is
   live"** with:

   - **Coverage:** customer journeys covered (§1.1–§1.8, §1.10), backend surfaces
     (§2.1–§2.8, §2.10), platform operations (§3.1–§3.3).
   - **Open gaps:** §1.9 (discount code at checkout) and §2.9 (Search API), both tracked
     in §5 of `MONITORING.md`. `/monitor` can close them interactively.
   - **Public status page URL** (under `checkly-status-page.com`).
   - **Public dashboard URL** (under `checkly-dashboards.com`).
   - **Project URL** in the Checkly app.
   - Optional one-liner: "Next: run `/monitor` to audit coverage, or `/add-check` to add a
     surface."

Do not run `npm run destroy` or `/teardown` unless explicitly asked.
