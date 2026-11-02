import { defineConfig } from '@playwright/test';

// The walkthroughs in HANDOVER.md on sample data (NEXT_PUBLIC_API_MOCK=1): no API, no database, no tile server.
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: { baseURL: `http://localhost:${PORT}`, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: {
    command: `node scripts/copy-maplibre-worker.mjs && next dev --port ${PORT}`,
    url: `http://localhost:${PORT}/sign-in`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_API_MOCK: '1', NEXT_PUBLIC_MAP_STYLE_URL: '/map-style-plain.json' },
  },
});
