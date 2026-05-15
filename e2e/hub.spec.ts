import { test, expect } from '@playwright/test';

const HUB_URL = 'http://127.0.0.1:4220/';

test.describe('hub', () => {
  test('lists all 30 mini apps as cards', async ({ page }) => {
    await page.goto(HUB_URL);
    const cards = page.getByTestId('hub-card');
    await expect(cards).toHaveCount(30);
  });

  test('tier-1 filter shows only ready apps', async ({ page }) => {
    await page.goto(HUB_URL);
    const initialCount = await page.getByTestId('hub-card').count();
    await page.getByRole('button', { name: 'جاهزة' }).click();
    const filteredCount = await page.getByTestId('hub-card').count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('cards point at subdomains or local anchors', async ({ page }) => {
    await page.goto(HUB_URL);
    const cards = await page.getByTestId('hub-card').all();
    for (const card of cards) {
      const href = await card.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^(https:\/\/|#)/);
    }
  });

  test('renders Arabic RTL', async ({ page }) => {
    await page.goto(HUB_URL);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
