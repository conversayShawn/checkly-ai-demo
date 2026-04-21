---
description: Route a set of checks to an alert channel. $ARGUMENTS names the tag and channel (e.g. "api → slack").
---

Wire alerting for: **$ARGUMENTS**

Model:

- Alert channels live in `monitoring/channels.check.ts` (all four are mocked — `sendFailure:false`).
- Groups in `monitoring/groups.check.ts` already attach `allChannels` to every group. In most
  demo requests, the right edit is to either:
  1. Add a new mocked channel and include it in `allChannels`, or
  2. Change a specific group's `alertChannels` array to a narrower subset, or
  3. Enable `sendFailure: true` on one channel **only if** the user explicitly wants live alerts
     (and in that case, confirm the target URL is real before flipping it).

Never replace a mocked channel's URL/phone/email with a real one without explicit confirmation —
this repo's contract is that nothing alerts by default.
