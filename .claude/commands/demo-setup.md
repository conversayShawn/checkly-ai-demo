---
description: One-shot setup. Installs Checkly's Agent Skills, seeds mock data, tests, deploys.
---

You are running the headline demo flow. Narrate each step in one short line so the audience
follows along. Don't expand details unless a step fails.

Run in this order, stopping only on hard failure:

1. **Read `MONITORING.md` out loud first.** This is the audience's anchor — a plain-English
   product brief for what we monitor and why. Summarize it in 3–5 bullets: what the system
   is, the user journeys that matter, the backend surfaces, and note that §5 lists gaps
   we'll revisit later via `/monitor`. Do not skip this step — without it, what happens
   next looks like magic.
2. `npx skills add checkly/checkly-cli -y` — talking point: **Checkly ships official Agent Skills**
   that teach Claude Code the project's conventions. Mention it out loud.
   **Run with `-y` (non-interactive)** — the first install prompts otherwise and hangs the demo.
3. `npm install`
4. `npm run seed` — seeds the jsonmap.site mock API with the fixtures in `fixtures/items.ts`.
5. `npm run test` — dry-runs every check on Checkly's infra. Show the summary only.
6. `npm run deploy` — deploys all resources to the shared demo Checkly account.
7. When `deploy` finishes, print a short wrap-up with:
   - Which MONITORING.md sections are now live (§1.1–1.8, §2.1–2.3, §3.1–3.2)
   - Which are still gaps (§1.9, §2.4) and that `/monitor` can fill them
   - The public status page URL (under `checkly-status-page.com`)
   - The public dashboard URL (under `checklyhq.com`)
   - The project URL in the Checkly app

Do not run `npm run destroy` or `/demo-reset` unless explicitly asked.
