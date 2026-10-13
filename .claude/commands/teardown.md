---
description: Wipe everything. Destroys every Checkly resource this project deployed.
---

Destructive reset for starting over from a clean account. Confirm with the user **once**
before running, then:

1. `npm run destroy` — runs `npx checkly destroy --force` to remove every resource in this
   project from the connected Checkly account.

Do not `rm` any local files. Config and checks all stay.
