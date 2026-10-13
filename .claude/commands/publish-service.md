---
description: Surface a service on the public status page. $ARGUMENTS is the service name (e.g. "Search API").
---

Publish a service for: **$ARGUMENTS**

The status page is a `StatusPageV3`; everything lives in `monitoring/status-page.check.ts`.

1. Add a `StatusPageV3Component` pointing at the existing page, with the next free
   `displayOrder`:
   ```ts
   export const searchComponent = new StatusPageV3Component('svc-<slug>', {
     statusPage,
     type: 'SERVICE',
     name: '<Display Name>',
     displayOrder: <n>,
   })
   ```
2. Add a `StatusPageV3AutomationRule` (`rule-<slug>`) with `tags: ['incident:<slug>']`,
   `components: [{ component: searchComponent, targetImpact: 'MAJOR_OUTAGE' }]` and
   `notifySubscribers: false`.
3. Tag the relevant `tier:1` check(s) with `incident:<slug>` so a failure opens an incident
   on the new component. Don't use the deprecated `StatusPageService` or per-check
   `triggerIncident`.
4. Run `npm run test` then `npm run deploy` and print the updated status page URL.
