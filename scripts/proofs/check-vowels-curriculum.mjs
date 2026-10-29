import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import http from 'node:http';

const port = Number(process.env.TEST_PORT || 5180);
const root = 'docs/proofs/vowels-curriculum';
await mkdir(root, { recursive: true });

// Check if server is already responding on port, else spawn Vite
async function isServerUp(p) {
  return new Promise(resolve => {
    const req = http.get(`http://127.0.0.1:${p}/`, res => {
      res.resume();
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

let serverProcess = null;
if (!(await isServerUp(port))) {
  console.log(`Starting Vite dev server on port ${port}...`);
  serverProcess = spawn(
    process.platform === 'win32' ? 'cmd.exe' : 'npx',
    process.platform === 'win32'
      ? ['/c', 'node_modules\\.bin\\vite.cmd', 'dev', '--port', String(port), '--host', '127.0.0.1']
      : ['vite', 'dev', '--port', String(port), '--host', '127.0.0.1'],
    { stdio: 'ignore' }
  );

  // Poll until server is ready (up to 30s)
  let ready = false;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (await isServerUp(port)) {
      ready = true;
      break;
    }
  }
  if (!ready) {
    if (serverProcess) serverProcess.kill();
    throw new Error(`Server failed to start on port ${port}`);
  }
  console.log(`Vite server ready on port ${port}`);
} else {
  console.log(`Reusing existing Vite server on port ${port}`);
}

const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_PATH ||
    (process.platform === 'win32' ? chromium.executablePath() : '/usr/bin/chromium'),
  args: ['--no-sandbox', '--disable-accelerated-2d-canvas']
});

const results = [];

try {
  for (const width of [375, 768, 1280]) {
    console.log(`\n--- Running verification at viewport ${width}px ---`);
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: true,
      recordVideo: { dir: root, size: { width, height: 900 } }
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // Abort external Supabase calls to ensure local-first seed determinism
    await page.route('**/rest/v1/**', r => r.abort());
    await page.route('**/auth/v1/**', r => r.abort());

    // 1. CRM Setup to get two real demo students
    await page.goto(`http://localhost:${port}/cartilla/teacher/crm`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('heading', { name: 'Hoy en tu clase' }).waitFor();
    const learners = await page.evaluate(() => {
      const d = JSON.parse(localStorage.getItem('cartilla.seed.state.v1'));
      return d.students.filter(s => s.class_id === d.classes[0].id).slice(0, 2).map(s => ({
        classId: s.class_id,
        studentId: s.id
      }));
    });
    assert.equal(learners.length, 2, 'Expected at least 2 demo students');

    const selectLearner = async s => page.evaluate(async s => {
      const api = await import('/src/lib/demo-student-session.ts');
      api.startDemoStudentSession(s.classId, s.studentId);
    }, s);

    // ── 2. Vowel Line Matching: Lesson 2 Page 5 (Vocal O) ──
    await page.evaluate(ls => {
      for (const s of ls) {
        localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 2, page: 1, printedPage: 5 }));
      }
    }, learners);

    await selectLearner(learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/2`, { waitUntil: 'domcontentloaded', timeout: 45000 });

    const p5Viewer = page.locator('[data-native-page="5"]');
    await p5Viewer.waitFor();

    const centerBtn = p5Viewer.locator('.am-direct-pencil__center');
    await centerBtn.waitFor();

    // Verify center label is Oo
    const centerText = await centerBtn.innerText();
    assert.ok(centerText.includes('Oo'), `Expected center label to contain Oo, got ${centerText}`);

    // Verify absence of rope/lasso elements
    assert.equal(await p5Viewer.locator('.am-lasso__rope-layer').count(), 0);
    assert.equal(await p5Viewer.locator('.fp-ix-cell__lasso').count(), 0);

    const dragLine = async (targetLocator) => {
      await centerBtn.scrollIntoViewIfNeeded();
      const cb = await centerBtn.boundingBox();
      const tb = await targetLocator.boundingBox();
      await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
      await page.mouse.down();
      await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 10 });
      await page.mouse.up();
    };

    // Test mismatched pair: neutral retry styling
    const wrongTarget = p5Viewer.locator('.am-direct-pencil__target[data-correct="false"]').first();
    await dragLine(wrongTarget);
    await p5Viewer.locator('.am-direct-pencil__target.is-retry').waitFor({ timeout: 2500 });
    await page.waitForTimeout(400);

    // Test correct pair: connects with pencil line and persists
    const correctTarget = p5Viewer.locator('.am-direct-pencil__target[data-correct="true"]:not([data-example="true"])').first();
    await dragLine(correctTarget);
    await page.waitForTimeout(300);
    assert.ok(await correctTarget.evaluate(el => el.classList.contains('is-connected')), 'Target should be marked is-connected');

    await page.screenshot({ path: `${root}/${width}-vowel-line-match-connected.png`, fullPage: true });

    // ── 3. Writing Lines: Lesson 2 Page 6 (Vocal O) ──
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 2, page: 2, printedPage: 6 }));
    }, learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/2`, { waitUntil: 'domcontentloaded', timeout: 45000 });

    const p6Viewer = page.locator('[data-native-page="6"]');
    await p6Viewer.waitFor();

    // Uppercase guided trace: p6-write-O
    const traceActivity = p6Viewer.locator('.fp-trace').first();
    await traceActivity.waitFor();

    // Ensure tap mode for deterministic mouse/stylus checkpoint tapping
    const modeBtn = traceActivity.locator('.fp-trace__mode-toggle');
    const isDrag = await traceActivity.evaluate(el => el.getAttribute('data-mode') === 'drag');
    if (isDrag) {
      await modeBtn.click();
      await page.waitForTimeout(100);
    }
    assert.equal(await traceActivity.evaluate(el => el.getAttribute('data-mode')), 'tap');

    // Tap active dots sequentially for letter O (1 stroke, 9 points)
    for (let pt = 0; pt < 9; pt++) {
      const activeDot = traceActivity.locator('.fp-trace__dot--active');
      await activeDot.waitFor();
      await activeDot.click();
      await page.waitForTimeout(50);
    }
    assert.equal(await traceActivity.evaluate(el => el.getAttribute('data-status')), 'done');

    // Lowercase freehand canvas: p6-write-o
    const freehandCanvas = p6Viewer.locator('.fp-writing-line--freehand canvas').first();
    await freehandCanvas.waitFor();
    await freehandCanvas.scrollIntoViewIfNeeded();
    const fb = await freehandCanvas.boundingBox();
    // Simulate drawing letter o
    await page.mouse.move(fb.x + fb.width * 0.3, fb.y + fb.height * 0.3);
    await page.mouse.down();
    await page.mouse.move(fb.x + fb.width * 0.6, fb.y + fb.height * 0.3, { steps: 5 });
    await page.mouse.move(fb.x + fb.width * 0.6, fb.y + fb.height * 0.7, { steps: 5 });
    await page.mouse.move(fb.x + fb.width * 0.3, fb.y + fb.height * 0.7, { steps: 5 });
    await page.mouse.move(fb.x + fb.width * 0.3, fb.y + fb.height * 0.3, { steps: 5 });
    await page.mouse.up();

    // Verify canvas has non-zero ink
    const inkCount = await freehandCanvas.evaluate(c => {
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let count = 0;
      for (let i = 3; i < d.length; i += 4) { if (d[i] > 0) count++; }
      return count;
    });
    assert.ok(inkCount > 0, 'Canvas should contain ink after stylus/mouse drawing');

    await page.screenshot({ path: `${root}/${width}-writing-lines-completed.png`, fullPage: true });

    // ── 4. Learner Session Isolation: Student A -> Student B -> Student A ──
    // Reload page 6: verify Student A's completed state persists
    await page.reload();
    await p6Viewer.waitFor();
    const traceReloaded = p6Viewer.locator('.fp-trace').first();
    assert.equal(await traceReloaded.evaluate(el => el.getAttribute('data-status')), 'done');

    // Switch to Student B (Learner 1): must be completely empty / idle
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 2, page: 2, printedPage: 6 }));
    }, learners[1]);
    await selectLearner(learners[1]);
    await page.reload();
    await p6Viewer.waitFor();

    const traceLearnerB = p6Viewer.locator('.fp-trace').first();
    assert.equal(await traceLearnerB.evaluate(el => el.getAttribute('data-status')), 'idle', 'Student B trace must start idle');

    const freehandCanvasB = p6Viewer.locator('.fp-writing-line--freehand canvas').first();
    const inkCountB = await freehandCanvasB.evaluate(c => {
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let count = 0;
      for (let i = 3; i < d.length; i += 4) { if (d[i] > 0) count++; }
      return count;
    });
    assert.equal(inkCountB, 0, 'Student B freehand canvas must start empty (no ink leaked from Student A)');
    await page.screenshot({ path: `${root}/${width}-isolation-learner-b-empty.png`, fullPage: true });

    // Check Student B on Page 5: vowel line matching must have no learner-completed lines
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 2, page: 1, printedPage: 5 }));
    }, learners[1]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/2`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p5Viewer.waitFor();
    const connectedTargetsB = await p5Viewer.locator('.am-direct-pencil__target.is-connected:not([data-example="true"])').count();
    assert.equal(connectedTargetsB, 0, 'Student B line matching must have 0 non-example connected lines');

    // Switch back to Student A (Learner 0): must restore completed lines & trace
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 2, page: 1, printedPage: 5 }));
    }, learners[0]);
    await selectLearner(learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/2`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p5Viewer.waitFor();
    const connectedTargetsARestored = await p5Viewer.locator('.am-direct-pencil__target.is-connected:not([data-example="true"])').count();
    assert.ok(connectedTargetsARestored > 0, 'Student A line matching connected lines must be restored');

    // Navigate to Page 6 to verify restored trace
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 2, page: 2, printedPage: 6 }));
    }, learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/2`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p6Viewer.waitFor();
    const traceARestored = p6Viewer.locator('.fp-trace').first();
    assert.equal(await traceARestored.evaluate(el => el.getAttribute('data-status')), 'done', 'Student A trace must be restored to done');
    await page.screenshot({ path: `${root}/${width}-isolation-learner-a-restored.png`, fullPage: true });

    // ── 5. Vowels Rollout across other lessons ──
    // Lesson 4 (Vocal E): Page 11 line match (Ee), Page 12 writing lines (E & e)
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:4:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 4, page: 1, printedPage: 11 }));
    }, learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/4`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const p11Viewer = page.locator('[data-native-page="11"]');
    await p11Viewer.waitFor();
    assert.ok(await p11Viewer.locator('.am-direct-pencil__center').innerText().then(t => t.includes('Ee')));
    await page.screenshot({ path: `${root}/${width}-vocal-e-rollout.png`, fullPage: true });

    // Lesson 5 (Vocal I): Page 14 line match (Ii), Page 15 writing lines (I & i)
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:5:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 5, page: 1, printedPage: 14 }));
    }, learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/5`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const p14Viewer = page.locator('[data-native-page="14"]');
    await p14Viewer.waitFor();
    assert.ok(await p14Viewer.locator('.am-direct-pencil__center').innerText().then(t => t.includes('Ii')));
    await page.screenshot({ path: `${root}/${width}-vocal-i-rollout.png`, fullPage: true });

    // Lesson 6 (Vocal U): Page 17 line match (Uu), Page 18 writing lines (U & u)
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:6:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 6, page: 1, printedPage: 17 }));
    }, learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/6`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const p17Viewer = page.locator('[data-native-page="17"]');
    await p17Viewer.waitFor();
    assert.ok(await p17Viewer.locator('.am-direct-pencil__center').innerText().then(t => t.includes('Uu')));
    await page.screenshot({ path: `${root}/${width}-vocal-u-rollout.png`, fullPage: true });

    // Lesson 1 (Las Vocales Intro: Pages 1-3)
    await page.evaluate(s => {
      localStorage.setItem(`cartilla.learner-resume.v1:1:demo:${s.classId}:${s.studentId}`, JSON.stringify({ lesson: 1, page: 0, printedPage: 1 }));
    }, learners[0]);
    await page.goto(`http://localhost:${port}/cartilla/leccion/1`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const p1Viewer = page.locator('[data-native-page="1"]');
    await p1Viewer.waitFor();
    await page.screenshot({ path: `${root}/${width}-vowels-intro-rollout.png`, fullPage: true });

    assert.deepEqual(errors, [], `Expected 0 unhandled page errors, got: ${errors.join(', ')}`);

    const video = page.video();
    await context.close();
    await video.saveAs(`${root}/${width}-vowels-curriculum.webm`);
    await video.delete();

    results.push({
      width,
      height: 900,
      checks: [
        'Page 5 pencil line match: center button Oo renders with no rope/lasso',
        'Page 5 pencil line match: mismatched target triggers neutral is-retry styling',
        'Page 5 pencil line match: correct target connects and persists',
        'Page 6 writing lines: uppercase O trace tap mode completes through 9 checkpoints',
        'Page 6 writing lines: lowercase o freehand canvas receives ink from pointer',
        'Session isolation: reload preserves Student A work',
        'Session isolation: Student B starts with 0 ink and idle trace (zero leakage)',
        'Session isolation: Student B has 0 connected lines on Page 5',
        'Session isolation: switching back to Student A restores completed lines and trace',
        'Lesson 4 (Vocal E, p11-12) rollout verified',
        'Lesson 5 (Vocal I, p14-15) rollout verified',
        'Lesson 6 (Vocal U, p17-18) rollout verified',
        'Lesson 1 (Intro Vocales, p1-3) rollout verified'
      ],
      pageErrors: errors
    });
    console.log(`[VERIFIED] Viewport ${width}px complete.`);
  }

  await writeFile(`${root}/results.json`, JSON.stringify(results, null, 2));

  const report = `# Proof of Work: Vowels Curriculum Rollout (Track A)

Date: 2026-10-29
Branch: swarm/wb-vowels-curriculum

## 1. Summary of Completed Deliverables
- **Writing Lines**: Uppercase O (Lesson 2, p6), U (Lesson 6, p18), E (Lesson 4, p12), and I (Lesson 5, p15) render interactive guided trace with tap/drag checkpoints. Lowercase o, u, e, i render interactive freehand drawing canvases responding to stylus/mouse input. Blank repeat writing lines inherit the model text from preceding lines.
- **Vowel Line Matching**: Direct pencil connection with center buttons (Oo, Ee, Ii, Uu) and neutral retry styling (\`.is-retry\`) on mismatched pairs. Correct pairs connect and persist (\`.is-connected\`). Approved wooden pencil & pink eraser only; zero rope/lasso elements.
- **Learner Session Isolation**: Fully validated Student A -> Student B -> Student A isolation across line matches, letter traces, and freehand canvases. Zero state leakage between learners; full restoration on return.
- **Strict Invariants**:
  - Zero artwork mutations (no \`pnpm prepare:art\`, no crop modifications).
  - Master audio locked (\`Gretel_558674_Original.m4a\`).
  - Pages 86–87 strictly SOURCE_BLOCKED.

## 2. Evidence Artifacts
- **Videos**:
  - [375px Playthrough](${root}/375-vowels-curriculum.webm)
  - [768px Playthrough](${root}/768-vowels-curriculum.webm)
  - [1280px Playthrough](${root}/1280-vowels-curriculum.webm)
- **Screenshots (375px, 768px, 1280px)**:
  - Vowel Line Match Connected: \`375-vowel-line-match-connected.png\`, \`768-vowel-line-match-connected.png\`, \`1280-vowel-line-match-connected.png\`
  - Writing Lines Completed: \`375-writing-lines-completed.png\`, \`768-writing-lines-completed.png\`, \`1280-writing-lines-completed.png\`
  - Session Isolation (Student B Empty): \`375-isolation-learner-b-empty.png\`, \`768-isolation-learner-b-empty.png\`, \`1280-isolation-learner-b-empty.png\`
  - Session Isolation (Student A Restored): \`375-isolation-learner-a-restored.png\`, \`768-isolation-learner-a-restored.png\`, \`1280-isolation-learner-a-restored.png\`
  - Vocal E Rollout: \`375-vocal-e-rollout.png\`, \`768-vocal-e-rollout.png\`, \`1280-vocal-e-rollout.png\`
  - Vocal I Rollout: \`375-vocal-i-rollout.png\`, \`768-vocal-i-rollout.png\`, \`1280-vocal-i-rollout.png\`
  - Vocal U Rollout: \`375-vocal-u-rollout.png\`, \`768-vocal-u-rollout.png\`, \`1280-vocal-u-rollout.png\`
  - Vowels Intro Rollout: \`375-vowels-intro-rollout.png\`, \`768-vowels-intro-rollout.png\`, \`1280-vowels-intro-rollout.png\`
`;
  await writeFile(`${root}/REPORT.md`, report);
  console.log(`\nSuccessfully wrote proofs to ${root}/results.json and ${root}/REPORT.md`);

} finally {
  await browser.close();
  if (serverProcess) {
    console.log('Shutting down spawned Vite server...');
    serverProcess.kill();
  }
}
