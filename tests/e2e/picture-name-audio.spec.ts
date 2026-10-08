import { test, expect } from '@playwright/test';
import layouts from '../../src/data/page-layouts.json' with { type: "json" };

async function collectPlayback(page: any) {
  await page.addInitScript(() => {
    const log = (window as any).pictureProof = { audio: [] as any[], speech: [] as string[], learning: [] as any[], progress: [] as any[] };
    class TestAudio {
      src: string; volume = 1; paused = true; onended: any = null; onerror: any = null;
      constructor(src: string) { this.src = src; log.audio.push({ action: 'create', src }); }
      play() { this.paused = false; log.audio.push({ action: 'play', src: this.src }); return Promise.resolve(); }
      pause() { this.paused = true; log.audio.push({ action: 'pause', src: this.src }); }
      removeAttribute() { this.src = ''; } load() {}
      addEventListener() {} removeEventListener() {}
    }
    (window as any).Audio = TestAudio;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      cancel: () => log.audio.push({ action: 'cancel-speech' }), getVoices: () => [], addEventListener() {}, removeEventListener() {},
      speak: (utterance: any) => { log.speech.push(utterance.text); utterance.onend?.(); },
    } });
    window.addEventListener('gretel:bus', (event: any) => {
      if (['answer:correct', 'answer:wrong', 'hint:show', 'support:delivered', 'activity:complete'].includes(event.detail.type)) log.learning.push(event.detail);
    });
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (/cartilla\.(progress-events-queue|student-events|exercise-stats|page-completion)/.test(key)) log.progress.push({ key, value });
      return write.call(this, key, value);
    };
  });
}

test('shipped picture audio plays approved recordings, stays silent for unrecorded names, and does not change reading progress', async ({ page }) => {
  await collectPlayback(page);
  await page.goto('/cartilla/presentar/13');
  const nido = page.locator('[data-picture-name="nido"]').first();
  const ternero = page.locator('[data-picture-name="ternero n"]').first();
  await expect(nido).toBeVisible();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  await nido.click();
  await expect(nido).toHaveAttribute('data-picture-audio-status', 'recorded');
  await ternero.click();
  await expect(ternero).toHaveAttribute('data-picture-audio-status', 'missing-recording');
  await expect(page.locator('.picture-audio-status')).toContainText('aún no está disponible');
  const proof = await page.evaluate(() => (window as any).pictureProof);
  expect(proof.audio.filter((event: any) => event.action === 'play').map((event: any) => decodeURIComponent(event.src))).toEqual(['/audio/voz/vocabulario/nido.mp3']);
  expect(proof.speech).toHaveLength(0); expect(proof.learning).toHaveLength(0); expect(proof.progress).toHaveLength(0);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  await page.screenshot({ path: 'docs/proofs/batch-3/recording-pending-reading-ungated.png', fullPage: true });
});

test('approved-recording fixture proves rapid tap cancellation, Gretel coordination, mute and navigation cleanup', async ({ page }) => {
  // Only the browser test has approved fixture metadata. No audio file or approval is added to the product.
  await page.route('**/src/content/picture-name-recordings.json*', (route: any) => route.fulfill({ contentType: 'application/javascript', body: 'export const approved = [{key:"oso",src:"/test-approved/oso.mp3",approval:"browser-test-fixture"},{key:"olla",src:"/test-approved/olla.mp3",approval:"browser-test-fixture"}]; export default {approved};' }));
  await collectPlayback(page);
  await page.goto('/cartilla/presentar/2');
  const oso = page.locator('[data-picture-name="oso"]').first();
  const olla = page.locator('[data-picture-name="olla"]').first();
  await oso.click(); await expect(oso).toHaveAttribute('data-picture-audio-status', 'recorded');
  await olla.click(); await expect(olla).toHaveAttribute('data-picture-audio-status', 'recorded');
  let proof = await page.evaluate(() => (window as any).pictureProof);
  expect(proof.audio).toContainEqual({ action: 'pause', src: '/test-approved/oso.mp3' });
  expect(proof.audio).toContainEqual({ action: 'play', src: '/test-approved/olla.mp3' });
  await page.evaluate(async () => { const voice = await import('/src/lib/gretel-voice.ts'); void voice.speakAsGretel('Prueba de coordinación'); });
  await expect.poll(async () => (await page.evaluate(() => (window as any).pictureProof.audio)).filter((e: any) => e.action === 'pause' && e.src === '/test-approved/olla.mp3').length).toBeGreaterThan(0);
  await oso.click();
  await page.evaluate(async () => { const voice = await import('/src/lib/gretel-voice.ts'); voice.setGretelVoiceMuted(true); });
  await olla.click(); await expect(olla).toHaveAttribute('data-picture-audio-status', 'muted');
  await page.evaluate(async () => { const voice = await import('/src/lib/gretel-voice.ts'); voice.setGretelVoiceMuted(false); });
  await oso.click();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/cartilla\/teacher/);
  proof = await page.evaluate(() => (window as any).pictureProof);
  expect(proof.audio.filter((e: any) => e.action === 'pause' && e.src === '/test-approved/oso.mp3').length).toBeGreaterThanOrEqual(3);
  expect(proof.learning).toHaveLength(0); expect(proof.progress).toHaveLength(0);
});

test('the same direct answer tap hears the name path and still grades, even while muted', async ({ page }) => {
  await collectPlayback(page);
  const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), data['1']!.regions.map(r => `page-1-${r.id}`));
  await page.goto('/cartilla/leccion/1');
  const viewer = page.locator('.native-lesson-viewer');
  await viewer.getByRole('button', { name: 'Siguiente' }).click();
  await viewer.getByRole('button', { name: 'anillo', exact: true }).click();
  await expect(viewer.locator('[data-picture-name="anillo"]')).toHaveAttribute('data-picture-audio-status', 'recorded');
  await expect(viewer.locator('.graded-correct')).toHaveCount(1);
  await page.evaluate(async () => { const voice = await import('/src/lib/gretel-voice.ts'); voice.setGretelVoiceMuted(true); });
  for (const name of ['estrella', 'indio', 'oso', 'uniforme']) await viewer.getByRole('button', { name, exact: true }).click();
  await expect(viewer.getByRole('button', { name: 'Siguiente' })).not.toHaveAttribute('aria-disabled', 'true');
  const proof = await page.evaluate(() => (window as any).pictureProof);
  expect(proof.audio.filter((e: any) => e.action === 'play').map((e: any) => decodeURIComponent(e.src))).toEqual(['/audio/voz/vocabulario/anillo.mp3']);
  expect(proof.learning.filter((e: any) => e.type === 'answer:correct')).toHaveLength(4);
  expect(proof.learning.filter((e: any) => e.type === 'answer:wrong' || e.type === 'support:delivered' || e.type === 'hint:show')).toHaveLength(0);
  await page.screenshot({ path: 'docs/proofs/batch-3/direct-tap-still-grades.png', fullPage: true });
});
