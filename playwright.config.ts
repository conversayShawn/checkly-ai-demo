import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'https://prod-otel-demo.checkly.engineering',
    viewport: { width: 1280, height: 720 },
    trace: 'on',
  },
  projects: [
    {
      name: 'Homepage & Browsing',
      testDir: './monitoring/browser/suites/homepage-and-browsing/',
      use: {
        ...devices['Desktop Chrome'],
        userAgent: `${devices['Desktop Chrome'].userAgent} (Checkly, https://www.checklyhq.com)`,
      },
    },
    {
      name: 'Cart & Checkout',
      testDir: './monitoring/browser/suites/cart-and-checkout/',
      use: {
        ...devices['Desktop Chrome'],
        userAgent: `${devices['Desktop Chrome'].userAgent} (Checkly, https://www.checklyhq.com)`,
      },
    },
  ],
})
