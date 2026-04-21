import { defineConfig } from 'checkly'
import { AlertEscalationBuilder, RetryStrategyBuilder } from 'checkly/constructs'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

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
