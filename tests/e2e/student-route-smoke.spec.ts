import { test, expect } from '@playwright/test';

function setupErrorTracking(page: any) {
  const errors: string[] = [];
  page.on('pageerror', (err: any) => errors.push(err.message));
  page.on('console', (msg: any) => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      errors.push(msg.text());
    }
  });
  return errors;
}

test.describe('Student Route Smoke Test', () => {
  const testScenarios = [
    { name: 'Mobile', viewport: { width: 375, height: 667 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Desktop', viewport: { width: 1280, height: 720 } }
  ];

  for (const { name, viewport } of testScenarios) {
    test(`Smoke test student routes on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const errors = setupErrorTracking(page);

      // 1. Student entry
      await page.goto('/cartilla');
      await expect(page.locator('text=La Cartilla de Gretel').first()).toBeVisible();

      // 2. Lesson list
      await page.goto('/cartilla/lecciones');
      await expect(page.locator('text=Mis lecciones')).toBeVisible();

      // 3. Progress page
      await page.goto('/cartilla/mi-progreso');
      // In unauthenticated mode, it defaults to showing some base UI, wait for a heading
      await expect(page.locator('h1').filter({ hasText: /progreso/i }).first()).toBeVisible();

      // 4. Reloads
      await page.reload();
      await expect(page.locator('h1').filter({ hasText: /progreso/i }).first()).toBeVisible();

      // 5. Join route
      await page.goto('/cartilla/unirse');
      // In open mode, it redirects to /cartilla/lecciones! See playwright.config.ts comments.
      await page.waitForURL('**/cartilla/lecciones');
      await expect(page.locator('text=Mis lecciones')).toBeVisible();

      // 6. 404/broken links
      await page.goto('/cartilla/esta-ruta-no-existe');
      await expect(page.locator('text=404').first()).toBeVisible();

      // 7. Basic navigation/back paths
      await page.goBack();
      await expect(page.locator('text=Mis lecciones').first()).toBeVisible();

      // 8. Verify no unexpected errors
      expect(errors.filter(e => !e.includes('404'))).toHaveLength(0);
    });
  }
});
