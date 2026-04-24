---
description: One-shot setup. Kicks off deps, Agent Skills, and fixture seeding in the background, generates the .check.ts wiring live (plus a post-hoc MONITORING.md summary), tests, deploys.
---

Run the `synthetic-monitoring` skill against Astroshop. Follow the phases and narration
structure defined in `.claude/skills/synthetic-monitoring/SKILL.md` exactly.

**Background preflight** — at the very start, kick off these two tracks non-blocking
(`run_in_background: true`) and immediately proceed:
- Track A: `npm install && npm run seed` (chained — seed needs `tsx` from `node_modules`).
- Track B: `npx skills add checkly/checkly-cli -y`

**Then the numbered phases:**

1. Read `openapi.yaml` (the single input that describes the API surface, with
   `x-monitoring` hints driving tier and svc tags). Browser specs, suite dirs, and
   MultiStep flow paths are already listed in the skill; no need to `ls` — runs while the
   background toolchain load continues.
2. Write the monitoring surface — emit **all** `.check.ts` Write calls in a single
   assistant turn for parallel execution. `MONITORING.md` is the last Write in the batch,
   a short post-hoc summary of what went in and why; it does not drive construct choice.
   Runs concurrently with the background `npm install` + Agent Skills load.
3. `npm run test` — Checkly's test compiles the TS project, so no separate typecheck phase
   is needed. This is the natural barrier for the background installs.
4. `npm run deploy`.
5. Wrap-up summary ("Astroshop monitoring is live") with status page URL, dashboard URL,
   project URL, and intentional gaps to address next.

This is the explicit, operator-triggered entry point for the same flow that natural prompts
like *"set up monitoring for Astroshop"* fire automatically via the skill. The skill is the
source of truth for phase content — do not improvise, do not skip the batched-write trick
(it's what keeps the generation phase under ~60 seconds).
