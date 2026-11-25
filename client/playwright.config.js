import { randomBytes } from 'node:crypto'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from '@playwright/test'

loadEnv({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true })

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 720 },
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 1000,
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
        : {}),
    },
  },
  webServer: [
    {
      command: 'npm run start',
      cwd: '..',
      url: 'http://127.0.0.1:5001/api/health',
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        PORT: '5001',
        MONGODB_DB_NAME: 'PortfolioE2E',
        JWT_SECRET: randomBytes(32).toString('hex'),
        CLIENT_ORIGIN: 'http://127.0.0.1:4173',
      },
    },
    {
      command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
