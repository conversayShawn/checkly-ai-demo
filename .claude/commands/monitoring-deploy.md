---
description: One-shot setup. Installs deps, registers Checkly Agent Skills, seeds fixtures, generates the .check.ts wiring and MONITORING.md live, typechecks, tests, deploys.
---

Run the `monitoring-setup` skill against Astroshop. Follow the phases and narration
structure defined in `.claude/skills/monitoring-setup/SKILL.md` exactly — silent preflight
(`npm run seed`), then the numbered phases:

1. Install the toolchain and load Checkly Agent Skills (`npm install` + `npx skills add
   checkly/checkly-cli -y`, in parallel).
2. Size up the repo (list pre-baked specs under `monitoring/browser/` and `monitoring/api/`,
   read `fixtures/items.ts`).
3. Write the monitoring surface — emit **all** `.check.ts` + `MONITORING.md` Write calls in
   a single assistant turn for parallel execution.
4. `npm run typecheck`.
5. `npm run test`.
6. `npm run deploy`.
7. Wrap-up summary ("Astroshop monitoring is live") with status page URL, dashboard URL,
   project URL, coverage, and open gaps.

This is the explicit, operator-triggered entry point for the same flow that natural prompts
like *"set up monitoring for Astroshop"* fire automatically via the skill. The skill is the
source of truth for phase content — do not improvise, do not skip the batched-write trick
(it's what keeps the generation phase under ~60 seconds).
