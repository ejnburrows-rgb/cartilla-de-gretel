import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function setupErrorTracking(page: any) {
  const errors: string[] = [];
  page.on('pageerror', (err: any) => errors.push(err.message));
  page.on('response', (response: any) => {
    // Fail on same-origin >=400 responses, ignore external analytics/fonts etc if any
    if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1')) {
      errors.push(`HTTP ${response.status()} on ${response.url()}`);
    }
  });
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

test.describe('Student Route Smoke Test', () => {
  const proofDir = path.join(process.cwd(), 'docs/proofs/student-route-smoke');

  test.beforeAll(() => {
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
  });

  const testScenarios = [
    { name: 'Phone', viewport: { width: 375, height: 667 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Laptop', viewport: { width: 1280, height: 720 } }
  ];

  for (const { name, viewport } of testScenarios) {
    test(`Smoke test student routes on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const errors = setupErrorTracking(page);

      // 1. Student entry (/cartilla)
      await page.goto('/cartilla');
      await expect(page.locator('text=La Cartilla de Gretel').first()).toBeVisible();
      await expect(page.locator('img[alt*="Gretel"]').first()).toBeVisible();
      await page.screenshot({ path: path.join(proofDir, `${name.toLowerCase()}-entry.png`) });

      // 2. Lesson list (/cartilla/lecciones)
      await page.goto('/cartilla/lecciones');
      await expect(page.locator('text=Mis lecciones')).toBeVisible();
      await page.screenshot({ path: path.join(proofDir, `${name.toLowerCase()}-lecciones.png`) });

      // 3. Legacy student login redirect (/cartilla/student-login)
      await page.goto('/cartilla/student-login');
      // In open mode / student-login redirect -> /cartilla/unirse -> /cartilla/lecciones
      await page.waitForURL('**/cartilla/lecciones');
      await expect(page.locator('text=Mis lecciones')).toBeVisible();

      // 4. Progress page (/cartilla/mi-progreso)
      await page.goto('/cartilla/mi-progreso');
      await expect(page.locator('h1').filter({ hasText: /progreso/i }).first()).toBeVisible();
      await page.screenshot({ path: path.join(proofDir, `${name.toLowerCase()}-progreso.png`) });

      // 5. Reload on progress page
      await page.reload();
      await expect(page.locator('h1').filter({ hasText: /progreso/i }).first()).toBeVisible();

      // 6. UI Back navigation: Click back link on mi-progreso to lecciones
      const leccionesBackLink = page.locator('a[href="/cartilla/lecciones"]').first();
      await leccionesBackLink.click();
      await page.waitForURL('**/cartilla/lecciones');
      await expect(page.locator('text=Mis lecciones')).toBeVisible();

      // Click Cartilla back link on lecciones to /cartilla
      const cartillaBackLink = page.locator('a[href="/cartilla"]').first();
      await cartillaBackLink.click();
      await page.waitForURL('**/cartilla');
      await expect(page.locator('text=La Cartilla de Gretel').first()).toBeVisible();

      // 7. 404 / broken links handling
      await page.goto('/cartilla/esta-ruta-no-existe');
      await expect(page.locator('text=404').first()).toBeVisible();

      // 8. Browser back button navigation
      await page.goBack();
      await page.waitForURL('**/cartilla');
      await expect(page.locator('text=La Cartilla de Gretel').first()).toBeVisible();

      // 9. Verify no unexpected errors (ignore intentional 404s)
      const unexpectedErrors = errors.filter(e => {
        return !e.includes('404') && !e.includes('esta-ruta-no-existe');
      });
      expect(unexpectedErrors).toHaveLength(0);
    });
  }
});
