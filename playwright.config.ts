import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, timeout: 45000,
  use: { baseURL: 'http://localhost:3100', channel: 'chrome', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: process.env.TEST_PRODUCTION ? 'node node_modules/next/dist/bin/next start -p 3100' : 'node node_modules/next/dist/bin/next dev -p 3100',
    url: 'http://localhost:3100', reuseExistingServer: false, timeout: 120000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_WIX_CLIENT_ID: 'test-client',
      NEXT_PUBLIC_WIX_STAFF_MIKE_RESOURCE_ID: '11111111-1111-4111-8111-111111111111',
      NEXT_PUBLIC_WIX_STAFF_HARLEY_RESOURCE_ID: '22222222-2222-4222-8222-222222222222',
      NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID: '33333333-3333-4333-8333-333333333333',
      NEXT_PUBLIC_WIX_GIFT_CARD_URL: 'https://example.test/gift',
      WIX_CONTACT_SECRET: 'test-only',
    },
  },
});
