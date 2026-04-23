---
description: One-shot setup. Installs deps, registers Checkly Agent Skills, seeds fixtures, generates the .check.ts wiring live (plus a post-hoc MONITORING.md summary), typechecks, tests, deploys.
---

Run the `synthetic-monitoring` skill against Astroshop. Follow the phases and narration
structure defined in `.claude/skills/synthetic-monitoring/SKILL.md` exactly — silent preflight
(`npm run seed`), then the numbered phases:

1. Install the toolchain and load Checkly Agent Skills (`npm install` + `npx skills add
   checkly/checkly-cli -y`, in parallel).
2. Size up the repo (list pre-baked specs under `monitoring/browser/` and `monitoring/api/`,
   read `fixtures/items.ts`, reread `CLAUDE.md` for conventions).
3. Write the monitoring surface — emit **all** `.check.ts` Write calls in a single
   assistant turn for parallel execution. `MONITORING.md` is the last Write in the batch,
   a short post-hoc summary of what went in and why; it does not drive construct choice.
4. `npm run typecheck`.
5. `npm run test`.
6. `npm run deploy`.
7. Wrap-up summary ("Astroshop monitoring is live") with status page URL, dashboard URL,
   project URL, and intentional gaps to address next.

This is the explicit, operator-triggered entry point for the same flow that natural prompts
like *"set up monitoring for Astroshop"* fire automatically via the skill. The skill is the
source of truth for phase content — do not improvise, do not skip the batched-write trick
(it's what keeps the generation phase under ~60 seconds).
