import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e', workers: 1, retries: 0,
  use: { baseURL: 'http://localhost:5177', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort', url: 'http://localhost:5175', env: { VITE_API_URL: 'http://localhost:5175' }, reuseExistingServer: !process.env.CI },
    { command: 'npm run dev -- --host 127.0.0.1 --port 5177 --strictPort', url: 'http://localhost:5177', env: { VITE_API_URL: '' }, reuseExistingServer: !process.env.CI },
  ],
  projects: [
    { name: 'desktop', testMatch: 'original-ui.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', testMatch: 'original-ui.spec.ts', use: { ...devices['Pixel 7'] } },
    { name: 'server-desktop', testMatch: 'spending.spec.ts', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5175' } },
    { name: 'server-mobile', testMatch: 'spending.spec.ts', use: { ...devices['Pixel 7'], baseURL: 'http://localhost:5175' } },
  ],
})
