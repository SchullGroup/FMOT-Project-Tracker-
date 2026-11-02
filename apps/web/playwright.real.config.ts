import { defineConfig } from '@playwright/test';

// The walkthrough against the real API (e2e-real/); the servers are started beforehand (see the spec's header).
export default defineConfig({
  testDir: './e2e-real',
  workers: 1,
  reporter: 'list',
  // An action that cannot happen fails after 30 seconds, with the page as it was, instead of at the end of the run.
  use: { baseURL: process.env.WEB_URL ?? 'http://localhost:3000', screenshot: 'only-on-failure', trace: 'retain-on-failure', actionTimeout: 30_000, navigationTimeout: 30_000 },
  outputDir: process.env.PW_OUTPUT ?? 'test-results-real',
});
