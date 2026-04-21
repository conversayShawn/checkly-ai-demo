---
description: Wipe everything. Destroys Checkly resources and clears jsonmap fixtures.
---

Destructive reset for re-running the demo from scratch. Confirm with the user **once**
before running, then:

1. `npm run destroy` — runs `npx checkly destroy --force` to remove every resource in this
   project from the connected Checkly account.
2. `npm run teardown` — DELETEs the jsonmap fixtures.

Do not `rm` any local files. Config, checks, and fixtures definitions all stay.
