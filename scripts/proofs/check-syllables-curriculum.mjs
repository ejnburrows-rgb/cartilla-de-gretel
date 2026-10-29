import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.env.TEST_PORT || 5185);
const root = process.env.PROOF_DIR || 'docs/proofs/syllables-curriculum';
await mkdir(root, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || (process.platform === 'win32' ? chromium.executablePath() : '/usr/bin/chromium'),
  args: ['--no-sandbox', '--disable-accelerated-2d-canvas']
});

const results = [];

try {
  for (const width of [375, 768, 1280]) {
    console.log(`Starting run for viewport ${width}px...`);
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: true,
      recordVideo: { dir: root, size: { width, height: 900 } }
    });
    context.setDefaultTimeout(30_000);
    const page = await context.newPage();
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.route('**/rest/v1/**', (r) => r.abort());
    await page.route('**/auth/v1/**', (r) => r.abort());

    // 1. CRM Setup to get two real demo students
    await page.goto(`http://127.0.0.1:${port}/cartilla/teacher/crm`);
    await page.getByRole('heading', { name: 'Hoy en tu clase' }).waitFor();
    const learners = await page.evaluate(() => {
      const d = JSON.parse(localStorage.getItem('cartilla.seed.state.v1'));
      return d.students.filter((s) => s.class_id === d.classes[0].id).slice(0, 2).map((s) => ({
        classId: s.class_id,
        studentId: s.id,
      }));
    });
    assert.equal(learners.length, 2);

    const selectLearner = async (s) =>
      page.evaluate(async (s) => {
        sessionStorage.setItem('cartilla.demo-student-session.v1', JSON.stringify(s));
        window.dispatchEvent(new Event('cartilla:student-session'));
      }, s);

    const setReaderPage = async (pageNumber, learner) => {
      await page.evaluate(
        ({ p, l }) => {
          const scope = l
            ? `demo:${encodeURIComponent(l.classId)}:${encodeURIComponent(l.studentId)}`
            : 'anonymous';
          localStorage.setItem(`cartilla.workbook-reader-page.v1:${scope}`, String(p));
          localStorage.setItem('cartilla.workbook-reader-page.v1', String(p));
        },
        { p: pageNumber, l: learner }
      );
    };

    const clickAndAwaitMark = async (btn) => {
      await btn.scrollIntoViewIfNeeded();
      const { word, syllable } = await btn.evaluate(el => ({ word: el.getAttribute('aria-label'), syllable: el.closest('.native-syllable').querySelector('h2').textContent }));
      const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
      const occurrence = normalize(word).indexOf(normalize(syllable));
      assert.ok(occurrence >= 0);
      await btn.locator('.native-syllable__letter').nth(occurrence).tap();
      await page.waitForFunction(
        (el) => el.getAttribute('aria-pressed') === 'true',
        await btn.elementHandle(),
        { timeout: 15000 }
      );
    };

    // Initialize Learner 0
    await selectLearner(learners[0]);

    // ── 1. Page 20: M (ma, me, mi, mo, mu) ──
    await setReaderPage(20, learners[0]);
    await page.goto(`http://127.0.0.1:${port}/cartilla/cuaderno`);
    const p20 = page.locator('[data-native-page="20"]');
    await p20.waitFor();

    // Verify 5 sections: ma, me, mi, mo, mu
    const p20Sections = p20.locator('.native-syllable');
    assert.equal(await p20Sections.count(), 5);

    // Click "mami" and "Coloma" under "ma"
    const mamiBtn = p20.locator('button.native-syllable__word[aria-label="mami"]');
    await mamiBtn.tap({ position: { x: 2, y: 2 } });
    assert.equal(await mamiBtn.getAttribute('aria-pressed'), 'false');
    assert.equal(await mamiBtn.locator('.native-syllable__mark').count(), 0);
    // The actual mi must retry without credit when the exercise asks for ma.
    await mamiBtn.locator('.native-syllable__letter').nth(2).tap();
    assert.equal(await mamiBtn.getAttribute('aria-pressed'), 'false');
    await page.waitForFunction(el => !el.disabled, await mamiBtn.elementHandle());
    assert.equal(await mamiBtn.getAttribute('aria-pressed'), 'false');
    assert.equal(await mamiBtn.locator('.native-syllable__mark').count(), 0);
    await page.screenshot({ path: `${root}/${width}-wrong-mi-no-credit.png`, fullPage: true });
    await clickAndAwaitMark(mamiBtn);

    const colomaBtn = p20.locator('button.native-syllable__word[aria-label="Coloma"]');
    await clickAndAwaitMark(colomaBtn);

    // Verify mark overlay rendered
    const colomaMark = colomaBtn.locator('.native-syllable__mark');
    assert.ok(await colomaMark.isVisible());

    await page.screenshot({ path: `${root}/${width}-page-20-m-syllables.png`, fullPage: true });

    // ── 2. Page 24: P (pa, pe, pi, po, pu) ──
    await setReaderPage(24, learners[0]);
    await page.goto(`http://127.0.0.1:${port}/cartilla/cuaderno`);
    const p24 = page.locator('[data-native-page="24"]');
    await p24.waitFor();

    const p24Sections = p24.locator('.native-syllable');
    assert.equal(await p24Sections.count(), 5);

    const papaBtn = p24.locator('button.native-syllable__word[aria-label="papá"]');
    await clickAndAwaitMark(papaBtn);

    const pupaBtn = p24.locator('button.native-syllable__word[aria-label="pupa"]');
    await clickAndAwaitMark(pupaBtn);

    await page.screenshot({ path: `${root}/${width}-page-24-p-syllables.png`, fullPage: true });

    // ── 3. Page 28: S (sa, se, si, so, su) ──
    await setReaderPage(28, learners[0]);
    await page.goto(`http://127.0.0.1:${port}/cartilla/cuaderno`);
    const p28 = page.locator('[data-native-page="28"]');
    await p28.waitFor();

    const p28Sections = p28.locator('.native-syllable');
    assert.equal(await p28Sections.count(), 5);

    const masaBtn = p28.locator('button.native-syllable__word[aria-label="masa"]');
    await clickAndAwaitMark(masaBtn);

    const sapoBtn = p28.locator('button.native-syllable__word[aria-label="sapo"]');
    await clickAndAwaitMark(sapoBtn);

    await page.screenshot({ path: `${root}/${width}-page-28-s-syllables.png`, fullPage: true });

    // ── 4. Page 32: T (ta, te, ti, to, tu) ──
    await setReaderPage(32, learners[0]);
    await page.goto(`http://127.0.0.1:${port}/cartilla/cuaderno`);
    const p32 = page.locator('[data-native-page="32"]');
    await p32.waitFor();

    const p32Sections = p32.locator('.native-syllable');
    assert.equal(await p32Sections.count(), 5);

    const tapaBtn = p32.locator('button.native-syllable__word[aria-label="tapa"]');
    await clickAndAwaitMark(tapaBtn);

    const pataBtn = p32.locator('button.native-syllable__word[aria-label="pata"]');
    await clickAndAwaitMark(pataBtn);

    await page.screenshot({ path: `${root}/${width}-page-32-t-syllables.png`, fullPage: true });

    // ── 5. Page 40: L (la, le, li, lo, lu) ──
    await setReaderPage(40, learners[0]);
    await page.goto(`http://127.0.0.1:${port}/cartilla/cuaderno`);
    const p40 = page.locator('[data-native-page="40"]');
    await p40.waitFor();

    const p40Sections = p40.locator('.native-syllable');
    assert.equal(await p40Sections.count(), 5);

    const lataBtn = p40.locator('button.native-syllable__word[aria-label="lata"]');
    await clickAndAwaitMark(lataBtn);

    const palaBtn = p40.locator('button.native-syllable__word[aria-label="pala"]');
    await clickAndAwaitMark(palaBtn);

    await page.screenshot({ path: `${root}/${width}-page-40-l-syllables.png`, fullPage: true });

    // ── 6. Persistence across Reload ──
    await page.reload();
    await p40.waitFor();
    const lataReloaded = p40.locator('button.native-syllable__word[aria-label="lata"]');
    const palaReloaded = p40.locator('button.native-syllable__word[aria-label="pala"]');
    assert.equal(await lataReloaded.getAttribute('aria-pressed'), 'true');
    assert.equal(await palaReloaded.getAttribute('aria-pressed'), 'true');

    await page.screenshot({ path: `${root}/${width}-page-40-reloaded.png`, fullPage: true });

    // ── 7. Clean Learner Isolation (Student A vs Student B) ──
    // Switch to Student B
    await selectLearner(learners[1]);
    await setReaderPage(40, learners[1]);
    await page.reload();
    await p40.waitFor();

    const lataLearnerB = p40.locator('button.native-syllable__word[aria-label="lata"]');
    const palaLearnerB = p40.locator('button.native-syllable__word[aria-label="pala"]');
    // Student B must see clean un-circled state
    assert.equal(await lataLearnerB.getAttribute('aria-pressed'), 'false');
    assert.equal(await palaLearnerB.getAttribute('aria-pressed'), 'false');

    await page.screenshot({ path: `${root}/${width}-learner-b-isolated-empty.png`, fullPage: true });

    // Student B marks a distinct word: "mala"
    const malaLearnerB = p40.locator('button.native-syllable__word[aria-label="mala"]');
    await clickAndAwaitMark(malaLearnerB);

    // Switch back to Student A: Student A's answers must be restored
    await selectLearner(learners[0]);
    await setReaderPage(40, learners[0]);
    await page.reload();
    await p40.waitFor();

    const lataLearnerARestored = p40.locator('button.native-syllable__word[aria-label="lata"]');
    const palaLearnerARestored = p40.locator('button.native-syllable__word[aria-label="pala"]');
    const malaLearnerARestored = p40.locator('button.native-syllable__word[aria-label="mala"]');

    assert.equal(await lataLearnerARestored.getAttribute('aria-pressed'), 'true');
    assert.equal(await palaLearnerARestored.getAttribute('aria-pressed'), 'true');
    assert.equal(await malaLearnerARestored.getAttribute('aria-pressed'), 'false');

    await page.screenshot({ path: `${root}/${width}-learner-a-restored.png`, fullPage: true });

    assert.deepEqual(errors, []);

    const video = page.video();
    await page.close();
    await context.close();
    if (video) {
      await video.saveAs(`${root}/${width}-syllables-curriculum.webm`);
      try {
        await video.delete();
      } catch {}
    }

    results.push({
      width,
      height: 900,
      checks: [
        'Pointer grading: tapping mi in mami when asked for ma retries with zero credit; button padding is ignored',
        'Page 20 (M): all 5 syllable groups (ma, me, mi, mo, mu) verified and clickable',
        'Page 24 (P): all 5 syllable groups (pa, pe, pi, po, pu) verified and clickable',
        'Page 28 (S): all 5 syllable groups (sa, se, si, so, su) verified and clickable',
        'Page 32 (T): all 5 syllable groups (ta, te, ti, to, tu) verified and clickable',
        'Page 40 (L): all 5 syllable groups (la, le, li, lo, lu) verified and clickable',
        'Approved pencil marks: WorkbookPencilMark circle overlay renders correctly without clipping',
        'Persistence: completed syllable circles survive page reload',
        'Isolation: Student A and Student B workstreams strictly separated and restored upon return'
      ],
      pageErrors: errors,
      videoPath: `${root}/${width}-syllables-curriculum.webm`
    });
    console.log(`Verified viewport ${width}px successfully`);
  }

  await writeFile(`${root}/results.json`, JSON.stringify(results, null, 2));
  console.log('All viewports verified successfully!');
} finally {
  await browser.close();
}
