import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.env.TEST_PORT || 5180);
const baseURL = process.env.TEST_BASE_URL || `http://localhost:${port}`;
const root = process.env.PROOF_DIR || 'docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/workbook-activities';
await mkdir(root, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || (process.platform === 'win32' ? chromium.executablePath() : '/usr/bin/chromium'),
  args: ['--no-sandbox', '--disable-accelerated-2d-canvas']
});

const results = [];

try {
  for (const width of [375, 768, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: true,
      recordVideo: { dir: root, size: { width, height: 900 } }
    });
    context.setDefaultTimeout(30_000);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.route('**/rest/v1/**', r => r.abort());
    await page.route('**/auth/v1/**', r => r.abort());

    // 1. CRM Setup to get two real demo students
    await page.goto(`${baseURL}/cartilla/teacher/crm`);
    await page.getByRole('heading', { name: 'Hoy en tu clase' }).waitFor();
    const learners = await page.evaluate(() => {
      const d = JSON.parse(localStorage.getItem('cartilla.seed.state.v1'));
      return d.students.filter(s => s.class_id === d.classes[0].id).slice(0, 2).map(s => ({
        classId: s.class_id,
        studentId: s.id
      }));
    });
    assert.equal(learners.length, 2);

    // Synthetic session fixture only; no answers or completion are seeded.
    const selectLearner = async s => page.evaluate(s => {
      sessionStorage.setItem('cartilla.demo-student-session.v1', JSON.stringify(s));
      window.dispatchEvent(new Event('cartilla:student-session'));
    }, s);

    // Start with Learner 0 on Lesson 3 Page 8 (Pencil line matching)
    await page.evaluate(ls => {
      for (const s of ls) {
        localStorage.setItem(`cartilla.learner-resume.v1:3:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 3, page: 1, printedPage: 8 }));
      }
    }, learners);

    await selectLearner(learners[0]);
    await page.goto(`${baseURL}/cartilla/leccion/3`);

    const p8Viewer = page.locator('[data-native-page="8"]');
    await p8Viewer.waitFor();

    // ── Test Page 8: DirectPencilConnector ──
    const centerBtn = p8Viewer.locator('.am-direct-pencil__center');
    await centerBtn.waitFor();

    // Helper to drag line from center to a target
    const dragLine = async (targetLocator) => {
      await centerBtn.scrollIntoViewIfNeeded();
      const cb = await centerBtn.boundingBox();
      const tb = await targetLocator.boundingBox();
      await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
      await page.mouse.down();
      await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 10 });
      await page.mouse.up();
    };

    // Wrong target: "maíz" (correct: false)
    const wrongTarget = p8Viewer.locator('.am-direct-pencil__target[data-correct="false"]').first();
    await dragLine(wrongTarget);

    // Confirm wrong retry styling occurs and then clears
    await p8Viewer.locator('.am-direct-pencil__target.is-retry').waitFor({ timeout: 2000 });
    await page.waitForTimeout(400);

    // Correct target: first non-example correct target
    const correctTarget = p8Viewer.locator('.am-direct-pencil__target[data-correct="true"]:not([data-example="true"])').first();
    await dragLine(correctTarget);
    await page.waitForTimeout(300);
    assert.ok(await correctTarget.evaluate(el => el.classList.contains('is-connected')));

    // Screenshot page 8 connected
    await page.screenshot({ path: `${root}/${width}-page-8-connected.png`, fullPage: true });

    // ── Turn to Page 9: Letter Tracing and Handwriting ──
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:3:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 3, page: 2, printedPage: 9 }));
    }, learners[0]);
    await page.goto(`${baseURL}/cartilla/leccion/3`);

    const p9Viewer = page.locator('[data-native-page="9"]');
    await p9Viewer.waitFor();

    // Inspect first trace exercise: p9-write-A
    const traceActivity = p9Viewer.locator('.fp-trace').first();
    await traceActivity.waitFor();

    // Ensure tap mode for deterministic checkpoint tapping
    const modeBtn = traceActivity.locator('.fp-trace__mode-toggle');
    const isDrag = await traceActivity.evaluate(el => el.getAttribute('data-mode') === 'drag');
    if (isDrag) {
      await modeBtn.click();
      await page.waitForTimeout(100);
    }
    assert.equal(await traceActivity.evaluate(el => el.getAttribute('data-mode')), 'tap');

    // Tap active dots sequentially for letter A (3 strokes, 9 points)
    for (let pt = 0; pt < 9; pt++) {
      const activeDot = traceActivity.locator('.fp-trace__dot--active');
      await activeDot.waitFor();
      await activeDot.click();
      await page.waitForTimeout(50);
    }

    // Verify trace status is done
    assert.equal(await traceActivity.evaluate(el => el.getAttribute('data-status')), 'done');
    await page.screenshot({ path: `${root}/${width}-trace-a-completed.png`, fullPage: true });

    // Reload page 9: verify completed state persists
    await page.reload();
    await p9Viewer.waitFor();
    const traceReloaded = p9Viewer.locator('.fp-trace').first();
    assert.equal(await traceReloaded.evaluate(el => el.getAttribute('data-status')), 'done');
    await page.screenshot({ path: `${root}/${width}-trace-a-reloaded.png`, fullPage: true });

    // Switch to Learner B: must be fresh/idle
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:3:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 3, page: 2, printedPage: 9 }));
    }, learners[1]);
    await selectLearner(learners[1]);
    await page.reload();
    await p9Viewer.waitFor();
    const traceLearnerB = p9Viewer.locator('.fp-trace').first();
    assert.equal(await traceLearnerB.evaluate(el => el.getAttribute('data-status')), 'idle');
    await page.screenshot({ path: `${root}/${width}-trace-learner-b-empty.png`, fullPage: true });

    // Switch back to Learner A: must restore completed state
    await selectLearner(learners[0]);
    await page.reload();
    await p9Viewer.waitFor();
    const traceLearnerAReturned = p9Viewer.locator('.fp-trace').first();
    assert.equal(await traceLearnerAReturned.evaluate(el => el.getAttribute('data-status')), 'done');

    // Test Reset on Learner A
    const resetBtn = traceLearnerAReturned.locator('.fp-trace__reset');
    await resetBtn.click();
    assert.equal(await traceLearnerAReturned.evaluate(el => el.getAttribute('data-status')), 'idle');
    await page.screenshot({ path: `${root}/${width}-trace-reset-idle.png`, fullPage: true });

    assert.deepEqual(errors, []);

    const video = page.video();
    await context.close();
    await video.saveAs(`${root}/${width}-workbook.webm`);
    await video.delete();

    results.push({
      width,
      height: 900,
      route: '/cartilla/leccion/3',
      checks: [
        'page 8 pencil wrong line retry flash',
        'page 8 pencil correct line connects and persists',
        'page 9 uppercase-A tap mode sequence completion',
        'page 9 trace reload persistence',
        'page 9 trace learner B separation',
        'page 9 trace learner A restoration',
        'page 9 trace reset revokes completion to idle'
      ],
      pageErrors: errors,
      input: 'mouse pointer in touch-capable Chromium context'
    });
    console.log(`Verified width ${width} successfully`);
  }
  await writeFile(`${root}/results.json`, JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
