---
description: Root-cause a failing or degraded Checkly check. $ARGUMENTS optionally names the surface (e.g. "checkout", "catalog").
---

Run the `root-cause` skill against the Astroshop monitoring surface. $ARGUMENTS (if given)
names the surface to investigate — e.g. `/rca checkout`, `/rca payment`, `/rca catalog`.
If $ARGUMENTS is empty, investigate the most recently failing check.

Follow the narration structure defined in `.claude/skills/root-cause/SKILL.md` exactly —
the four fixed sections (Scanning, Error group, Checkly RCA, Recommended next action). Do
not improvise the frame; only the Checkly RCA block's content is allowed to vary.
