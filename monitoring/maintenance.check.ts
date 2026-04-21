import { MaintenanceWindow } from 'checkly/constructs'

// Weekly maintenance window — pauses any check tagged 'blueprint'
// every Sunday 02:00–03:00 UTC.
new MaintenanceWindow('weekly-maintenance', {
  name: 'Weekly maintenance',
  tags: ['blueprint'],
  startsAt: new Date('2026-01-04T02:00:00.000Z'),
  endsAt: new Date('2026-01-04T03:00:00.000Z'),
  repeatInterval: 1,
  repeatUnit: 'WEEK',
})
