import * as path from 'path'
import { Dashboard } from 'checkly/constructs'

// Unique suffix for the internal dashboard so multiple presenters can deploy
// against the shared Checkly account without slug collisions. Stable for the
// day when DEMO_SEED is unset; overridable via .env for cross-day stability.
const demoSeed =
  process.env.DEMO_SEED || new Date().toISOString().slice(0, 10).replace(/-/g, '')

new Dashboard('dash-public', {
  header: 'Astroshop — System Status',
  description: 'Live monitoring of astroshop.com customer-facing surfaces.',
  customUrl: 'astroshop-status',
  tags: ['public'],
  width: 'FULL',
  refreshRate: 60,
  paginate: false,
  hideTags: false,
  useTagsAndOperator: false,
  showHeader: true,
  showP95: true,
  showP99: false,
  isPrivate: false,
  customCSS: { entrypoint: path.join(__dirname, 'astroshop.css') },
})

new Dashboard('dash-internal', {
  header: 'Blueprint AI Demo — Internal',
  description: 'Full monitoring surface, engineering-only.',
  customUrl: `blueprint-ai-demo-internal-${demoSeed}`,
  tags: ['storefront', 'platform-api', 'sre'],
  useTagsAndOperator: false,
  width: 'FULL',
  refreshRate: 60,
  paginate: true,
  paginationRate: 60,
  showHeader: true,
  showP95: true,
  showP99: true,
  expandChecks: true,
  isPrivate: true,
})
