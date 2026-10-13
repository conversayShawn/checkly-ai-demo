---
name: root-cause
description: Use this skill when the user asks you to investigate, diagnose, dig into, explain, find the cause of, or triage a failing or degraded monitoring check. Activates on prompts like "dig into the checkout failure", "what's breaking Astroshop", "why is payment failing", "root cause this", "diagnose the degraded catalog check", "what went wrong with the homepage". Do NOT activate for generic troubleshooting questions that aren't about a deployed Checkly check.
---

The user is pointing at a failing or degraded check on the Astroshop monitoring surface
and wants a root-cause narrative suitable for on-call. Your job is to identify the right
check, trigger Checkly's native RCA, and recommend the next action from the check's own
tags (tier + owning team) — no external spec document is consulted.

Speak as if you're an on-call SRE working the incident — not as if you're running a demo.

## Narration structure

This is the load-bearing part of this skill. The Checkly RCA output itself is an LLM
summary and will vary slightly in wording run-to-run; the frame around it must be
deterministic so the investigation always reads the same shape.

Print the investigation as four fixed sections, in this order:

### 1. `▸ Scanning for impacted checks`
**Batch both list calls in parallel** in a single assistant message:
`npx checkly checks list --status failing --output json` and
`npx checkly checks list --status degraded --output json`. Identify the check the user
is pointing at:
- If they named a service (e.g. "checkout", "payment", "catalog"), filter by name or the
  `svc:<name>` tag.
- Otherwise, take the most recently-regressing failing check; fall back to degraded.
Print one line naming the check, its tier tag, and its owning-team tag.
`✓ <check name> — tier:<N>, owner:<team>, started failing <N>m ago`

### 2. `▸ Pulling the most recent error group`
Run `npx checkly checks get <id> --output json` and extract the first entry from
`errorGroups`. Print one line summarising the error (first 120 chars of the message) and
its error-group ID.

### 3. `▸ Triggering Checkly root-cause analysis`
**Two calls, no polling:**

1. `npx checkly rca run -e <error-group-id> -w` — **no `-o` flag**. `-w` blocks until the
   analysis completes, but only with the default output. ⚠ The CLI silently disables `-w`
   when paired with **any** `--output`/`-o` value (md, json, etc.), prints
   "--watch is not supported with --output ..., ignoring", and returns immediately with
   `status: pending`, which forces a polling loop that wastes minutes. Plain `rca run -w`
   is the only way to actually block.
2. `npx checkly rca get <rca-id> -o md` — instant, fetches the formatted markdown for
   display (the analysis is already done).

Print the markdown under a clear heading so the audience sees it's Checkly's output, not
yours:

```
━━━ Checkly RCA ━━━
<raw markdown from checkly rca get>
━━━━━━━━━━━━━━━━━━
```

**Do not poll** with `until ... grep -q completed; do sleep N; done` patterns. The
blocking call in step 1 is the only wait you need.

### 4. **Recommended next action**
One or two lines naming what the on-call engineer should do, derived from the check's own
tags (tier + owning team, both present on the check file and returned by
`checkly checks get`):
- tier:1 → "Page `#oncall-<team>` and confirm the automated incident on the status page's
  <service> component."
- tier:2 → "Notify `#oncall-<team>` via Slack; ticket within the hour."
- tier:3 → "Log for the daily review; no paging required."
If a matching runbook exists in `RUNBOOKS/` (e.g. `checkout-degraded.md`,
`catalog-5xx.md`), name it. Otherwise say "No runbook for this surface — worth adding
after resolution."

## Guardrails

- Never invent an error group ID — always pull it from `checkly checks get <id>`.
- If no check is failing or degraded, say so plainly and stop. Do not make up a
  finding.
- Do not rerun RCA on the same error group in the same session — reuse the existing
  result via `checkly rca get <rca-id>` if available.
- **Never poll** with `until ... do sleep N; done` patterns waiting for RCA completion.
  The blocking `rca run -w` (no `-o`) call is the only wait you should do. If you find
  yourself writing a sleep loop, you either forgot `-w` or paired it with any `-o` flag
  (which silently disables it).
- Do not escalate (flip alert channel to real, create a real incident, page anyone)
  without explicit confirmation.

## Trigger phrasing tips for operators

The skill fires most reliably on prompts that include both an action verb (*dig into*,
*diagnose*, *root-cause*, *what's breaking*) and a surface name that maps to a tag
(*checkout*, *payment*, *catalog*, *search*, *homepage*). A reliable on-stage formula:
**"Dig into the <surface> failure"** or **"Root-cause the <surface> check."**
