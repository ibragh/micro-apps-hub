import { test, expect } from '@playwright/test';
import { tier1Apps } from '../playwright.config';

for (const app of tier1Apps) {
  test.describe(`${app.slug}`, () => {
    test('loads with RTL Arabic shell and main testid', async ({ page }) => {
      const errs: string[] = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errs.push(msg.text());
      });

      await page.goto(`http://127.0.0.1:${app.port}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(page.getByTestId('app-root')).toBeVisible();
      expect(errs).toEqual([]);
    });

    test('main heading is in Arabic', async ({ page }) => {
      await page.goto(`http://127.0.0.1:${app.port}/`);
      const text = await page.getByTestId('app-root').textContent();
      expect(text ?? '').toMatch(/[؀-ۿ]/);
    });
  });
}
