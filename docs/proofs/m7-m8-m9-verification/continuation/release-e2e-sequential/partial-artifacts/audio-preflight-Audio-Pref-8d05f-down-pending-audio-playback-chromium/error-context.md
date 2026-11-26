# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audio-preflight.spec.ts >> Audio Preflight Verification >> page turn / navigation tears down pending audio playback
- Location: tests\e2e\audio-preflight.spec.ts:128:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-picture-name="oso"]').first()
    - locator resolved to <span tabindex="0" role="button" data-blink-mode="none" data-picture-name="oso" data-part-based="false" data-interactive="false" data-ambient-motion="none" data-natural-motion="true" aria-label="Escuchar el nombre del dibujo" class="living-illustration fc-replica__living" data-picture-src="/cartilla/art/optimized/flipchart-native/p004-oso.png">…</span>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div tabindex="0" role="button" class="fc-corner fc-corner--left" data-testid="flipchart-corner-left" aria-label="Lámina siguiente (2 de 1)">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div tabindex="0" role="button" class="fc-corner fc-corner--left" data-testid="flipchart-corner-left" aria-label="Lámina siguiente (2 de 1)">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div tabindex="0" role="button" class="fc-corner fc-corner--left" data-testid="flipchart-corner-left" aria-label="Lámina siguiente (2 de 1)">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Saltar al contenido principal" [ref=e2] [cursor=pointer]:
      - /url: "#main-content"
    - generic [ref=e3]:
      - banner [ref=e4]:
        - generic [ref=e5]:
          - button "Volver al panel del docente" [ref=e6] [cursor=pointer]
          - generic [ref=e10]:
            - generic [ref=e11]: Lección 2 · Flipchart
            - heading "La vocal O" [level=1] [ref=e12]
            - paragraph [ref=e13]: 1 láminas digitales · Proyector del maestro
        - generic [ref=e14]:
          - button "Alternar puntero láser" [ref=e15] [cursor=pointer]:
            - generic [ref=e22]: Puntero
          - 'button "Modo docente: Mano izquierda" [ref=e23] [cursor=pointer]':
            - generic [ref=e29]: Mano Izq
          - button "Modo proyección sin cromo" [ref=e30] [cursor=pointer]:
            - generic [ref=e37]: Enfoque
          - button "Alternar pantalla completa" [ref=e38] [cursor=pointer]:
            - generic [ref=e44]: Pantalla completa
      - button "Abrir Panel de Control de Demostración" [ref=e46]: Demo · L2
      - main [ref=e50]:
        - generic [ref=e52]:
          - region "Superficie del rotafolio" [ref=e53]:
            - generic [ref=e55]:
              - article [ref=e58]:
                - generic [ref=e60]:
                  - generic [ref=e61]:
                    - figure [ref=e63]:
                      - img "Ilustración de la página 4" [ref=e65] [cursor=pointer]
                    - paragraph [ref=e66]:
                      - generic [ref=e67]: Arre caballito
                    - paragraph [ref=e68]:
                      - generic [ref=e69]: Arre caballito
                    - paragraph [ref=e70]:
                      - generic [ref=e71]: llévame a pasear
                    - paragraph [ref=e72]:
                      - generic [ref=e73]: yo soy redondita
                    - paragraph [ref=e74]:
                      - generic [ref=e75]: y puedo rodar.
                    - paragraph [ref=e76]:
                      - generic [ref=e77]: ¡Oh, oh caballito
                    - paragraph [ref=e78]:
                      - generic [ref=e79]: yo quiero parar!
                    - paragraph [ref=e80]:
                      - generic [ref=e81]: ¡Oh, oh caballito
                    - paragraph [ref=e82]:
                      - generic [ref=e83]: ya no ruedes más!
                    - figure [ref=e84]:
                      - img "olla" [ref=e86]
                    - figure [ref=e87]:
                      - img "Oto" [ref=e89] [cursor=pointer]
                    - figure [ref=e90]:
                      - img "oveja" [ref=e92]
                    - paragraph [ref=e93]:
                      - generic [ref=e94]: olla
                    - paragraph [ref=e95]:
                      - generic [ref=e96]: Oto
                    - paragraph [ref=e97]:
                      - generic [ref=e98]: oveja
                    - figure [ref=e99]:
                      - button "Escuchar el nombre del dibujo" [ref=e100]:
                        - img "oso" [ref=e101]
                    - figure [ref=e102]:
                      - img "oreja" [ref=e104] [cursor=pointer]
                    - figure [ref=e105]:
                      - img "ocho" [ref=e107] [cursor=pointer]
                    - paragraph [ref=e108]:
                      - generic [ref=e109]: oso
                    - paragraph [ref=e110]:
                      - generic [ref=e111]: oreja
                    - paragraph [ref=e112]:
                      - generic [ref=e113]: ocho
                  - generic [aria-hidden]: "4"
              - button "Lámina siguiente (2 de 1)" [ref=e114] [cursor=pointer]
              - button "Lámina anterior (0 de 1)" [ref=e115] [cursor=pointer]
          - generic [ref=e116]:
            - button "Lámina anterior" [disabled] [ref=e117]:
              - generic [ref=e120]: Anterior
            - generic [ref=e121]:
              - generic [ref=e122]: Hoja 1 de 1
              - generic [ref=e123]: Lámina 4 · Lección 2
            - button "Lámina siguiente" [disabled] [ref=e124]:
              - generic [ref=e125]: Siguiente
```

# Test source

```ts
  37  |   });
  38  | }
  39  | 
  40  | test.describe('Audio Preflight Verification', () => {
  41  |   test('mute controls consistently silence picture and Gretel playback', async ({ page }) => {
  42  |     await collectPlayback(page);
  43  |     await page.goto('/cartilla/presentar/2');
  44  | 
  45  |     // Mute via Gretel voice muted setting
  46  |     await page.evaluate(async () => {
  47  |       const voice = await import('/src/lib/gretel-voice.ts');
  48  |       voice.setGretelVoiceMuted(true);
  49  |     });
  50  | 
  51  |     const oso = page.locator('[data-picture-name="oso"]').first();
  52  |     await oso.click();
  53  |     await expect(oso).toHaveAttribute('data-picture-audio-status', 'muted');
  54  | 
  55  |     // Unmute Gretel voice, test mute via audioEngine
  56  |     await page.evaluate(async () => {
  57  |       const voice = await import('/src/lib/gretel-voice.ts');
  58  |       voice.setGretelVoiceMuted(false);
  59  |       const audio = await import('/src/lib/audio-engine.ts');
  60  |       audio.audioEngine.setMuted(true);
  61  |     });
  62  | 
  63  |     await oso.click();
  64  |     await expect(oso).toHaveAttribute('data-picture-audio-status', 'muted');
  65  | 
  66  |     // Clean up mute setting
  67  |     await page.evaluate(async () => {
  68  |       const audio = await import('/src/lib/audio-engine.ts');
  69  |       audio.audioEngine.setMuted(false);
  70  |     });
  71  | 
  72  |     await page.screenshot({ path: 'docs/proofs/audio-preflight/mute-controls-consistent.png', fullPage: true });
  73  |   });
  74  | 
  75  |   test('speech ownership prevents overlapping speech between Gretel and picture audio', async ({ page }) => {
  76  |     await page.route('**/src/content/picture-name-recordings.json*', (route: any) => route.fulfill({
  77  |       contentType: 'application/javascript',
  78  |       body: 'export const approved = [{key:"oso",src:"/test-approved/oso.mp3",approval:"browser-test-fixture"}]; export default {approved};'
  79  |     }));
  80  |     await collectPlayback(page);
  81  |     await page.goto('/cartilla/presentar/2');
  82  | 
  83  |     const oso = page.locator('[data-picture-name="oso"]').first();
  84  |     await oso.click();
  85  |     await expect(oso).toHaveAttribute('data-picture-audio-status', 'recorded');
  86  | 
  87  |     // Gretel speaks while picture recording is playing -> should pause picture recording
  88  |     await page.evaluate(async () => {
  89  |       const voice = await import('/src/lib/gretel-voice.ts');
  90  |       void voice.speakAsGretel('Gretel interrumpe audio de imagen');
  91  |     });
  92  | 
  93  |     await expect.poll(async () => {
  94  |       const log = await page.evaluate(() => (window as any).audioPreflightLog.audio);
  95  |       return log.some((item: any) => item.action === 'pause' && item.src === '/test-approved/oso.mp3');
  96  |     }).toBe(true);
  97  | 
  98  |     await page.screenshot({ path: 'docs/proofs/audio-preflight/single-speech-owner.png', fullPage: true });
  99  |   });
  100 | 
  101 |   test('picture-name buttons fail safely on missing recordings without false completion or broken playback', async ({ page }) => {
  102 |     // Every picture on the printed-sheet replica has a shipped recording, so the
  103 |     // test (only) approves "nido" alone and taps "nudo", which stays unrecorded.
  104 |     await page.route('**/src/content/picture-name-recordings.json*', (route: any) => route.fulfill({
  105 |       contentType: 'application/javascript',
  106 |       body: 'export const approved = [{key:"nido",src:"/audio/voz/vocabulario/nido.mp3",approval:"browser-test-fixture"}]; export default {approved};'
  107 |     }));
  108 |     await collectPlayback(page);
  109 |     await page.goto('/cartilla/presentar/13');
  110 | 
  111 |     const ternero = page.getByTestId('flipchart-stage').locator('[data-picture-name="nudo"]').first();
  112 |     await expect(ternero).toBeVisible();
  113 | 
  114 |     const before = await page.evaluate(() => JSON.stringify(localStorage));
  115 |     await ternero.click();
  116 | 
  117 |     await expect(ternero).toHaveAttribute('data-picture-audio-status', 'missing-recording');
  118 |     const log = await page.evaluate(() => (window as any).audioPreflightLog);
  119 | 
  120 |     expect(log.speech).toHaveLength(0);
  121 |     expect(log.learning).toHaveLength(0);
  122 |     expect(log.progress).toHaveLength(0);
  123 |     expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  124 | 
  125 |     await page.screenshot({ path: 'docs/proofs/audio-preflight/missing-recording-safe-fallback.png', fullPage: true });
  126 |   });
  127 | 
  128 |   test('page turn / navigation tears down pending audio playback', async ({ page }) => {
  129 |     await page.route('**/src/content/picture-name-recordings.json*', (route: any) => route.fulfill({
  130 |       contentType: 'application/javascript',
  131 |       body: 'export const approved = [{key:"oso",src:"/test-approved/oso.mp3",approval:"browser-test-fixture"}]; export default {approved};'
  132 |     }));
  133 |     await collectPlayback(page);
  134 |     await page.goto('/cartilla/presentar/2');
  135 | 
  136 |     const oso = page.locator('[data-picture-name="oso"]').first();
> 137 |     await oso.click();
      |               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  138 |     await expect(oso).toHaveAttribute('data-picture-audio-status', 'recorded');
  139 | 
  140 |     // Trigger navigation / back key
  141 |     await page.keyboard.press('Escape');
  142 |     await expect(page).toHaveURL(/\/cartilla\/teacher/);
  143 | 
  144 |     const log = await page.evaluate(() => (window as any).audioPreflightLog.audio);
  145 |     expect(log.some((e: any) => e.action === 'pause' && e.src === '/test-approved/oso.mp3')).toBe(true);
  146 | 
  147 |     await page.screenshot({ path: 'docs/proofs/audio-preflight/navigation-teardown.png', fullPage: true });
  148 |   });
  149 | 
  150 |   test('direct answer tap hears the name path and still grades correctly even when muted', async ({ page }) => {
  151 |     await collectPlayback(page);
  152 |     const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  153 |     await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), data['1']!.regions.map(r => `page-1-${r.id}`));
  154 |     await page.goto('/cartilla/leccion/1');
  155 |     const viewer = page.locator('.native-lesson-viewer');
  156 |     await viewer.getByRole('button', { name: 'Siguiente' }).first().click();
  157 |     await viewer.getByRole('button', { name: 'anillo', exact: true }).click();
  158 |     await expect(viewer.locator('[data-picture-name="anillo"]')).toHaveAttribute('data-picture-audio-status', 'recorded');
  159 |     await expect(viewer.locator('.graded-correct')).toHaveCount(1);
  160 |     await page.evaluate(async () => { const voice = await import('/src/lib/gretel-voice.ts'); voice.setGretelVoiceMuted(true); });
  161 |     for (const name of ['estrella', 'indio', 'oso']) await viewer.getByRole('button', { name, exact: true }).first().click();
  162 |     const uniforme = viewer.locator('[data-picture-name="uniforme"]').first();
  163 |     await uniforme.click();
  164 |     await expect(viewer.getByRole('button', { name: 'Siguiente' }).first()).not.toHaveAttribute('aria-disabled', 'true');
  165 |     const proof = await page.evaluate(() => (window as any).audioPreflightLog);
  166 |     const voiceAudio = proof.audio.filter((e: any) => e.action === 'play' && e.src.includes('/audio/voz/vocabulario/')).map((e: any) => decodeURIComponent(e.src));
  167 |     expect(voiceAudio).toEqual(['/audio/voz/vocabulario/anillo.mp3']);
  168 |     expect(proof.learning.filter((e: any) => e.type === 'answer:correct')).toHaveLength(4);
  169 | 
  170 |     await page.screenshot({ path: 'docs/proofs/audio-preflight/direct-tap-grades.png', fullPage: true });
  171 |   });
  172 | });
  173 | 
```