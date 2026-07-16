import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to home...");
    await page.goto('http://localhost:5173/');
    
    // Login as Matias
    console.log("Logging in as student...");
    await page.waitForSelector('text=Entrar', { timeout: 10000 });
    await page.click('text=Entrar');
    
    // Wait for the lesson list to load
    await page.waitForSelector('text=Lecciones', { timeout: 10000 });
    
    // Let's navigate to Leccion 1 (ID 1)
    console.log("Going to Lesson 1...");
    await page.goto('http://localhost:5173/cartilla/lecciones/1');
    await page.waitForTimeout(2000);
    // Find remolino
    const remolino = await page.locator('img[src*="remolino.webp"]').first();
    if (await remolino.count() > 0) {
      await remolino.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'SCREENSHOTS/remolino.png' });
      console.log("Captured remolino.png");
    } else {
      console.log("remolino not found on Lesson 1");
    }

    // Navigate to Lesson 3 (Vocal A)
    console.log("Going to Lesson 3...");
    await page.goto('http://localhost:5173/cartilla/lecciones/3');
    await page.waitForTimeout(2000);
    const abeja = await page.locator('img[src*="abeja.webp"]').first();
    if (await abeja.count() > 0) {
      await abeja.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'SCREENSHOTS/abeja.png' });
      console.log("Captured abeja.png");
    } else {
      console.log("abeja not found on Lesson 3");
    }

    const aguja = await page.locator('img[src*="aguja.webp"]').first();
    if (await aguja.count() > 0) {
      await aguja.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'SCREENSHOTS/aguja.png' });
      console.log("Captured aguja.png");
    } else {
      console.log("aguja not found on Lesson 3");
    }

    // Navigate to Lesson 5 (Vocal O)
    console.log("Going to Lesson 5...");
    await page.goto('http://localhost:5173/cartilla/lecciones/5');
    await page.waitForTimeout(2000);
    const oruga = await page.locator('img[src*="oruga.webp"]').first();
    if (await oruga.count() > 0) {
      await oruga.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'SCREENSHOTS/oruga.png' });
      console.log("Captured oruga.png");
    } else {
      console.log("oruga not found on Lesson 5");
    }

  } catch (err) {
    console.error("Error during screenshot capture", err);
  } finally {
    await browser.close();
  }
})();
