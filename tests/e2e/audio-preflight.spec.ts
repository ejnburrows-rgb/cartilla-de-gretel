import { test, expect } from '@playwright/test';
import layouts from '../../src/data/page-layouts.json' with { type: "json" };

async function collectPlayback(page: any) {
  await page.addInitScript(() => {
    const log = (window as any).audioPreflightLog = {
      audio: [] as any[],
      speech: [] as string[],
      learning: [] as any[],
      progress: [] as any[],
    };
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
      if (['answer:correct', 'answer:wrong', 'hint:show', 'support:delivered', 'activity:complete'].includes(event.detail.type)) {
        log.learning.push(event.detail);
      }
    });
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (/cartilla\.(progress-events-queue|student-events|exercise-stats|page-completion)/.test(key)) {
        log.progress.push({ key, value });
      }
      return write.call(this, key, value);
    };
  });
}

test.describe('Audio Preflight Verification', () => {
  test('mute controls consistently silence picture and Gretel playback', async ({ page }) => {
    await collectPlayback(page);
    await page.goto('/cartilla/presentar/2');

    // Mute via Gretel voice muted setting
    await page.evaluate(async () => {
      const voice = await import('/src/lib/gretel-voice.ts');
      voice.setGretelVoiceMuted(true);
    });

    const oso = page.locator('[data-picture-name="oso"]').first();
    await oso.click();
    await expect(oso).toHaveAttribute('data-picture-audio-status', 'muted');

    // Unmute Gretel voice, test mute via audioEngine
    await page.evaluate(async () => {
      const voice = await import('/src/lib/gretel-voice.ts');
      voice.setGretelVoiceMuted(false);
      const audio = await import('/src/lib/audio-engine.ts');
      audio.audioEngine.setMuted(true);
    });

    await oso.click();
    await expect(oso).toHaveAttribute('data-picture-audio-status', 'muted');

    // Clean up mute setting
    await page.evaluate(async () => {
      const audio = await import('/src/lib/audio-engine.ts');
      audio.audioEngine.setMuted(false);
    });

    await page.screenshot({ path: 'docs/proofs/audio-preflight/mute-controls-consistent.png', fullPage: true });
  });

  test('speech ownership prevents overlapping speech between Gretel and picture audio', async ({ page }) => {
    await page.route('**/src/content/picture-name-recordings.json*', (route: any) => route.fulfill({
      contentType: 'application/javascript',
      body: 'export const approved = [{key:"oso",src:"/test-approved/oso.mp3",approval:"browser-test-fixture"}]; export default {approved};'
    }));
    await collectPlayback(page);
    await page.goto('/cartilla/presentar/2');

    const oso = page.locator('[data-picture-name="oso"]').first();
    await oso.click();
    await expect(oso).toHaveAttribute('data-picture-audio-status', 'recorded');

    // Gretel speaks while picture recording is playing -> should pause picture recording
    await page.evaluate(async () => {
      const voice = await import('/src/lib/gretel-voice.ts');
      void voice.speakAsGretel('Gretel interrumpe audio de imagen');
    });

    await expect.poll(async () => {
      const log = await page.evaluate(() => (window as any).audioPreflightLog.audio);
      return log.some((item: any) => item.action === 'pause' && item.src === '/test-approved/oso.mp3');
    }).toBe(true);

    await page.screenshot({ path: 'docs/proofs/audio-preflight/single-speech-owner.png', fullPage: true });
  });

  test('picture-name buttons fail safely on missing recordings without false completion or broken playback', async ({ page }) => {
    await collectPlayback(page);
    await page.goto('/cartilla/presentar/13');

    const ternero = page.locator('[data-picture-name="ternero n"]').first();
    await expect(ternero).toBeVisible();

    const before = await page.evaluate(() => JSON.stringify(localStorage));
    await ternero.click();

    await expect(ternero).toHaveAttribute('data-picture-audio-status', 'missing-recording');
    const log = await page.evaluate(() => (window as any).audioPreflightLog);

    expect(log.speech).toHaveLength(0);
    expect(log.learning).toHaveLength(0);
    expect(log.progress).toHaveLength(0);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);

    await page.screenshot({ path: 'docs/proofs/audio-preflight/missing-recording-safe-fallback.png', fullPage: true });
  });

  test('page turn / navigation tears down pending audio playback', async ({ page }) => {
    await page.route('**/src/content/picture-name-recordings.json*', (route: any) => route.fulfill({
      contentType: 'application/javascript',
      body: 'export const approved = [{key:"oso",src:"/test-approved/oso.mp3",approval:"browser-test-fixture"}]; export default {approved};'
    }));
    await collectPlayback(page);
    await page.goto('/cartilla/presentar/2');

    const oso = page.locator('[data-picture-name="oso"]').first();
    await oso.click();
    await expect(oso).toHaveAttribute('data-picture-audio-status', 'recorded');

    // Trigger navigation / back key
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/cartilla\/teacher/);

    const log = await page.evaluate(() => (window as any).audioPreflightLog.audio);
    expect(log.some((e: any) => e.action === 'pause' && e.src === '/test-approved/oso.mp3')).toBe(true);

    await page.screenshot({ path: 'docs/proofs/audio-preflight/navigation-teardown.png', fullPage: true });
  });

  test('direct answer tap hears the name path and still grades correctly even when muted', async ({ page }) => {
    await collectPlayback(page);
    const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
    await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), data['1']!.regions.map(r => `page-1-${r.id}`));
    await page.goto('/cartilla/leccion/1');
    const viewer = page.locator('.native-lesson-viewer');
    await viewer.getByRole('button', { name: 'Siguiente' }).first().click();
    await viewer.getByRole('button', { name: 'anillo', exact: true }).click();
    await expect(viewer.locator('[data-picture-name="anillo"]')).toHaveAttribute('data-picture-audio-status', 'recorded');
    await expect(viewer.locator('.graded-correct')).toHaveCount(1);
    await page.evaluate(async () => { const voice = await import('/src/lib/gretel-voice.ts'); voice.setGretelVoiceMuted(true); });
    for (const name of ['estrella', 'indio', 'oso']) await viewer.getByRole('button', { name, exact: true }).first().click();
    const uniforme = viewer.locator('[data-picture-name="uniforme"]').first();
    await uniforme.click();
    await expect(viewer.getByRole('button', { name: 'Siguiente' }).first()).not.toHaveAttribute('aria-disabled', 'true');
    const proof = await page.evaluate(() => (window as any).audioPreflightLog);
    const voiceAudio = proof.audio.filter((e: any) => e.action === 'play' && e.src.includes('/audio/voz/vocabulario/')).map((e: any) => decodeURIComponent(e.src));
    expect(voiceAudio).toEqual(['/audio/voz/vocabulario/anillo.mp3']);
    expect(proof.learning.filter((e: any) => e.type === 'answer:correct')).toHaveLength(4);

    await page.screenshot({ path: 'docs/proofs/audio-preflight/direct-tap-grades.png', fullPage: true });
  });
});
