import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e', workers: 1, retries: 0,
  use: { baseURL: 'http://localhost:5175', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5175', url: 'http://localhost:5175', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
