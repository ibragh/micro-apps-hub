import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — one webServer per "tier-1" app, plus a single
 * shared baseURL for smoke. Apps are run via `vite preview` on assigned
 * ports.
 */
const tier1 = [
  { slug: 'seerah-quiz', port: 4201 },
  { slug: 'today-history', port: 4202 },
  { slug: 'saudi-history-quiz', port: 4203 },
  { slug: 'guess-saudi-player', port: 4204 },
  { slug: 'if-minister', port: 4205 },
  { slug: 'history-court', port: 4206 },
  { slug: 'news-detective', port: 4207 },
  { slug: 'last-minute-decision', port: 4208 },
  { slug: 'knowledge-auction', port: 4209 },
  { slug: 'time-traveler', port: 4210 },
  { slug: 'saudi-time-machine', port: 4211 },
  { slug: 'national-memory', port: 4212 },
  { slug: 'history-secrets', port: 4213 },
  { slug: 'odd-archive', port: 4214 },
  { slug: 'hub', port: 4220 },
];

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: tier1.map((a) => ({
    command: `pnpm --filter @mofeed/${a.slug} preview --port ${a.port} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${a.port}/`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  })),
});

export const tier1Apps = tier1;
