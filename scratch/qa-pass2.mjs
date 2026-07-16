import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const resultsPath = '/home/user/cartilla-de-gretel/SCREENSHOTS/7.1-final-qa/results.json';
let results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath)) : [];

function saveResults() {
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
}

async function checkPage(context, url, name, opts = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message));

  try {
    if (opts.unlockProgress) {
      await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(() => {
        localStorage.setItem('cartilla.lesson-progress.v1', JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]));
      });
    }
    if (opts.needsDemoLogin) {
      await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.fill('input[type="email"]', 'leonore@cartilla.local');
      await page.fill('input[type="password"]', 'Cartilla2026!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);
    }
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    errors.push('nav error: ' + e.message);
  }

  const safeName = name.replace(/[^a-z0-9-]/gi, '_');
  try {
    await page.screenshot({ path: `/home/user/cartilla-de-gretel/SCREENSHOTS/7.1-final-qa/${context._qaViewport}/${safeName}.png`, fullPage: true, timeout: 10000 });
  } catch (e) {
    errors.push('screenshot error: ' + e.message);
  }

  const filteredErrors = errors.filter(e => !e.includes('ERR_CONNECTION_RESET') && !e.includes('fonts.googleapis'));
  results.push({ viewport: context._qaViewport, name, url, errors: filteredErrors });
  saveResults();
  console.log(`[${context._qaViewport}] ${name}: ${filteredErrors.length} real errors${filteredErrors.length ? ' -- ' + JSON.stringify(filteredErrors) : ''}`);
  await page.close();
}

const pages = [
  { url: 'http://localhost:5173/', name: '01-splash-landing' },
  { url: 'http://localhost:5173/login', name: '02-login' },
  { url: 'http://localhost:5173/cartilla/unirse', name: '03-student-join' },
  { url: 'http://localhost:5173/cartilla/teacher', name: '04-teacher-dashboard', needsDemoLogin: true },
  { url: 'http://localhost:5173/cartilla/teacher/roster', name: '05-teacher-roster', needsDemoLogin: true },
  { url: 'http://localhost:5173/cartilla/teacher/reportes', name: '06-teacher-reportes', needsDemoLogin: true },
  { url: 'http://localhost:5173/cartilla/teacher/guia', name: '07-teacher-guia', needsDemoLogin: true },
  { url: 'http://localhost:5173/cartilla/presentar/1', name: '08-flipchart-lesson1', needsDemoLogin: true },
  { url: 'http://localhost:5173/cartilla/imprimir/all', name: '09-imprimir-all', needsDemoLogin: true },
  { url: 'http://localhost:5173/cartilla/lecciones', name: '10-student-lecciones', unlockProgress: true },
  { url: 'http://localhost:5173/cartilla/leccion/1', name: '11-student-leccion1', unlockProgress: true },
  { url: 'http://localhost:5173/cartilla/leccion/17', name: '12-student-leccion17', unlockProgress: true },
];

const argViewport = process.argv[2]; // 'desktop' or 'phone'
const viewportDef = argViewport === 'phone'
  ? { name: 'phone', width: 390, height: 844 }
  : { name: 'desktop', width: 1280, height: 800 };

const context = await browser.newContext({ viewport: { width: viewportDef.width, height: viewportDef.height } });
context._qaViewport = viewportDef.name;
for (const p of pages) {
  await checkPage(context, p.url, p.name, p);
}
await context.close();
await browser.close();
console.log('DONE', viewportDef.name);
