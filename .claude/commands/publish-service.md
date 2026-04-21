---
description: Surface a service on the public status page. $ARGUMENTS is the service name (e.g. "Search API").
---

Publish a service for: **$ARGUMENTS**

1. Open `monitoring/services.check.ts` and add a new `StatusPageService`:
   ```ts
   export const searchService = new StatusPageService('svc-<slug>', { name: '<Display Name>' })
   ```
2. Open `monitoring/status-page.check.ts` and add the service to an existing card, or create a
   new card if it doesn't fit an existing one.
3. Open the relevant check(s) and wire `triggerIncident` to the new service so that a failure
   on that check automatically opens an incident scoped to it.
4. Run `npm run test` then `npm run deploy` and print the updated status page URL.
