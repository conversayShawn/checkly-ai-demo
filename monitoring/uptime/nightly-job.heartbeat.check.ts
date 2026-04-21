import { HeartbeatMonitor } from 'checkly/constructs'
import { sreGroup } from '../groups.check'

// Covers: MONITORING.md §3.2 — Scheduled jobs (nightly backup heartbeat)
// Deactivated on purpose — a fresh clone won't have a cron pinging this URL,
// so we don't want to alarm. Flip `activated: true` when a real job is wired up.
new HeartbeatMonitor('uptime-nightly-job', {
  name: 'Nightly backup job',
  activated: false,
  group: sreGroup,
  tags: ['svc:api', 'tier:3', 'sre'],
  period: 1,
  periodUnit: 'days',
  grace: 2,
  graceUnit: 'hours',
})
