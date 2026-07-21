import { defineConfig } from 'checkly'
import { AlertEscalationBuilder, RetryStrategyBuilder } from 'checkly/constructs'
import * as crypto from 'crypto'
import dotenv from 'dotenv'
import * as os from 'os'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

// Stable per-machine slug used by status-page and dashboard URLs. Honors
// DEMO_SEED when set; otherwise derives a short hash from username+hostname
// so two operators on the same shared Checkly account don't collide on slugs.
// Lives here (not under monitoring/) to survive `git restore monitoring/`.
process.env.DEMO_SEED ??= crypto
  .createHash('sha1')
  .update(`${os.userInfo().username}@${os.hostname()}`)
  .digest('hex')
  .slice(0, 6)

export default defineConfig({
  projectName: 'Blueprint AI Demo',
  logicalId: 'blueprint-ai-demo',
  repoUrl: 'https://github.com/checkly/blueprint-ai-demo',
  checks: {
    runtimeId: '2025.04',
    frequency: 10,
    locations: ['us-east-1', 'eu-west-1'],
    retryStrategy: RetryStrategyBuilder.noRetries(),
    alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
    checkMatch: 'monitoring/**/*.check.ts',
    playwrightConfig: {
      timeout: 30_000,
      use: {
        baseURL: 'https://prod-otel-demo.checkly.engineering',
        viewport: { width: 1280, height: 720 },
      },
    },
  },
  cli: {
    runLocation: 'eu-central-1',
    reporters: ['list'],
    retries: 0,
  },
})
