/**
 * Tutor e2e suite — StubEars scripted sessions against the real dev server
 * (this lane's server runs with VITE_TUTOR_EARS=stub, see playwright.config.ts).
 *
 * Coverage required by the swarm brief:
 *  1. Full Lección 1 run via scripted transcripts → ENDED/celebrate screen.
 *  2. Wrong-then-right: counted retry, mic back, then advance.
 *  3. Three misses on one item → logged once as missed, runtime continues.
 *  4. probe "denied" → TutorUnavailable, no crash, zero getUserMedia calls.
 *  5. probe "no-local" → unavailable/no-on-device panel.
 *  6. Silence window (no-speech under the 6 s listen window) → nudge visual.
 *  7. Route leave mid-session → no open mic, progress + memory flushed, no
 *     console errors.
 *  9. Privacy (zero non-same-origin requests) + Gretel master regression.
 * 10. Screenshots of /tutor and /tutor/1 at 1280×800 and 390×844.
 * Item 8 (offline pack) lives in tutor-offline-pack.spec.ts.
 */
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  driveSessionToCompletion,
  expectSameOriginOnly,
  expectSessionEnded,
  gumCallCount,
  initScriptEars,
  micReadyToListen,
  micState,
  readProgressEvents,
  readTutorMemory,
  scriptLessonQueue,
  stubGetUserMedia,
  tapMicWhenReady,
  trackConsoleErrors,
  trackRequests,
  tutorSessionUrl,
} from "./support/tutor-helpers";

const ORIGIN = "http://127.0.0.1:5175";
const SCREENSHOT_DIR = path.join(process.cwd(), "tests/e2e/__screenshots__");

test.describe("tutor scripted sessions (StubEars)", () => {
  test.beforeEach(async ({ page }) => {
    stubGetUserMedia(page);
  });

  // 1. Full Lección 1 run (24 items) with real transcripts, no brain hacking.
  test("full Lección 1 run reaches the ENDED screen", async ({ page }) => {
    test.setTimeout(420_000);
    await page.goto(tutorSessionUrl(1));

    const started = Date.now();
    const items = await scriptLessonQueue(page, 1);
    expect(items.ids).toHaveLength(24);

    const taps = await driveSessionToCompletion(page, items.ids.length * 3);
    await expectSessionEnded(page);
    // The landed ENDED screen: the approved praise string and the way back.
    await expect(page.locator('[data-tutor-ended]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "¡Muy bien!" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Volver a las lecciones/ })).toBeVisible();

    // Every item finished with exactly one logged progress event.
    const events = await readProgressEvents(page);
    const ids = events.map((event) => event.item_id);
    expect(ids).toEqual(items.ids);
    expect(events.every((event) => event.result === "correct" && event.attempts === 1)).toBe(true);
    // Test data, reported to the swarm as the real runtime cost.
    const seconds = (Date.now() - started) / 1000;
    console.info(
      `[tutor e2e] Lección 1 full run: 24 items, ${taps} mic taps, ${seconds.toFixed(1)} s`,
    );
  });

  // 2. Wrong-then-right.
  test("wrong transcript keeps LISTENING and counts the attempt; correct advances", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto(tutorSessionUrl(1));
    // First lesson item is the vowel "a": "e" is a counted OTHER_VOWEL miss.
    await scriptLessonQueue(page, 1, {
      0: [
        { ok: true, transcript: "e", alternatives: [] },
        { ok: true, transcript: "a", alternatives: [] },
      ],
    });

    // Wrong answer: still the same item, mic comes back, nothing logged yet.
    await tapMicWhenReady(page);
    await expect
      .poll(async () => micState(page), { timeout: 60_000 })
      .toEqual({ present: true, disabled: false, capturing: false });
    expect(await page.locator('[data-tutor-listening-indicator]').count()).toBe(0);
    expect(
      (await readProgressEvents(page)).filter((event) => event.item_id === "l1-vowel-a"),
    ).toEqual([]);

    // Right answer: the item advances and the attempt count is carried into
    // the logged event (attempts 2, correct_after_retry).
    await tapMicWhenReady(page);
    await expect
      .poll(
        async () =>
          (await readProgressEvents(page)).find((event) => event.item_id === "l1-vowel-a"),
        { timeout: 60_000 },
      )
      .toMatchObject({ result: "correct_after_retry", attempts: 2 });
  });

  // 3. Three misses on one item.
  test("three misses log the item exactly once and the runtime continues", async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto(tutorSessionUrl(1));
    await scriptLessonQueue(page, 1, {
      0: [
        { ok: true, transcript: "e", alternatives: [] },
        { ok: true, transcript: "i", alternatives: [] },
        { ok: true, transcript: "o", alternatives: [] },
      ],
    });

    // Three counted OTHER_VOWEL misses on the vowel "a".
    await tapMicWhenReady(page);
    await tapMicWhenReady(page);
    await tapMicWhenReady(page);

    // Logged exactly once, as missed with attempts 3 —
    let missed: Array<Record<string, unknown>> = [];
    await expect
      .poll(
        async () => {
          missed = (await readProgressEvents(page)).filter(
            (event) => event.item_id === "l1-vowel-a" && event.result === "missed",
          );
          return missed.length;
        },
        { timeout: 120_000 },
      )
      .toBe(1);
    expect(missed[0]).toMatchObject({ attempts: 3 });

    // — and the session continues to the next item (vowel "e"), which still
    // completes normally from the queue's remaining correct answers.
    await tapMicWhenReady(page);
    await expect
      .poll(
        async () =>
          (await readProgressEvents(page)).find((event) => event.item_id === "l1-vowel-e"),
        { timeout: 120_000 },
      )
      .toMatchObject({ result: "correct" });
  });

  // 4. probe "denied".
  test("probe denied shows the TutorUnavailable panel and never opens the mic", async ({ page }) => {
    test.setTimeout(120_000);
    const consoleErrors = trackConsoleErrors(page);
    initScriptEars(page, { probe: "denied" });
    await page.goto(tutorSessionUrl(1));

    await expect(page.locator('[data-tutor-unavailable][data-problem="denied"]')).toBeVisible();
    await expect(
      page.getByText("El micrófono necesita permiso para escuchar."),
    ).toBeVisible();
    // No crash, and the mic was never opened by any real engine.
    expect(await gumCallCount(page)).toBe(0);
    const state = await micState(page);
    if (state.present) expect(state.capturing).toBe(false);
    expect(consoleErrors.errors()).toEqual([]);
  });

  // 5. probe "no-local".
  test("probe no-local shows the unavailable/no-on-device panel", async ({ page }) => {
    test.setTimeout(120_000);
    const consoleErrors = trackConsoleErrors(page);
    initScriptEars(page, { probe: "no-local" });
    await page.goto(tutorSessionUrl(1));

    await expect(page.locator('[data-tutor-unavailable][data-problem="no-local"]')).toBeVisible();
    await expect(page.getByText("Este aparato no puede escuchar por ahora.")).toBeVisible();
    expect(await gumCallCount(page)).toBe(0);
    expect(consoleErrors.errors()).toEqual([]);
  });

  // 6. Silence window: no-speech under the 6 s listen window. The landed
  // runtime routes listen() no-speech to the brain's §18.3 SILENCE path
  // (a gentle nudge, not an unavailable state): the first nudge keeps
  // listening, the second auto-releases the mic.
  test("a silent listen attempt shows the silence nudge and auto-releases the mic", async ({ page }) => {
    test.setTimeout(120_000);
    const consoleErrors = trackConsoleErrors(page);
    await page.goto(tutorSessionUrl(1));
    // Two 4 s silent windows inside the runtime's 6 s limit: nudge 1 keeps
    // listening, nudge 2 auto-releases the mic.
    await scriptLessonQueue(page, 1, {
      0: [
        { ok: false, problem: "no-speech", holdMs: 4000 },
        { ok: false, problem: "no-speech", holdMs: 4000 },
      ],
    });

    await tapMicWhenReady(page);
    const tapAt = Date.now();
    // The mic is open for the scripted silent attempt…
    await expect.poll(async () => (await micState(page)).capturing).toBe(true);
    // …the silence nudge's visual — the pending nudge line plays as the
    // runtime's gentle silent-line indicator…
    await expect(page.locator('[data-tutor-silent-line]')).toBeVisible({ timeout: 15_000 });
    // …and the mic auto-releases without any further tap, after the full
    // scripted windows (an instant bail-out would land far sooner).
    await expect.poll(async () => micReadyToListen(page), { timeout: 40_000 }).toBe(true);
    expect(Date.now() - tapAt).toBeGreaterThanOrEqual(5000);
    expect(await page.locator('[data-tutor-listening-indicator]').count()).toBe(0);
    // The nudge visual is not an unavailable state and nothing crashed.
    expect(await page.locator('[data-tutor-unavailable]').count()).toBe(0);
    await expect
      .poll(async () => micState(page), { timeout: 20_000 })
      .toEqual({ present: true, disabled: false, capturing: false });
    expect(await gumCallCount(page)).toBe(0);
    expect(consoleErrors.errors()).toEqual([]);
  });

  // 7. Route leave mid-session.
  test("leaving the route mid-session closes the mic and flushes progress + memory", async ({ page }) => {
    test.setTimeout(180_000);
    const consoleErrors = trackConsoleErrors(page);
    await page.goto(tutorSessionUrl(1));
    // Items 1–2 correct; item 3 opens a 3 s listen window we leave inside.
    await scriptLessonQueue(page, 1, {
      2: [{ ok: true, transcript: "o", alternatives: [], holdMs: 3000 }],
    });

    await tapMicWhenReady(page);
    await tapMicWhenReady(page);
    await expect
      .poll(async () => (await readProgressEvents(page)).length, { timeout: 120_000 })
      .toBeGreaterThanOrEqual(2);

    // Leave mid-run while the third listen window is still open.
    await tapMicWhenReady(page);
    await expect.poll(async () => (await micState(page)).capturing).toBe(true);
    await page.goto("/");

    // No mic left open, no tutor button on the new page.
    expect(await page.locator("[data-tutor-mic]").count()).toBe(0);
    expect(await gumCallCount(page)).toBe(0);
    // Progress for the finished items is flushed on the device.
    const events = await readProgressEvents(page);
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.map((event) => event.item_id)).toContain("l1-vowel-a");
    // Memory for the session (anonymous per-slot record) was written.
    const memory = await readTutorMemory(page);
    expect(Object.keys(memory).length).toBeGreaterThan(0);
    expect(consoleErrors.errors()).toEqual([]);
  });

  // 7b. Replay button works for vowels & words, and LISTEN responses keep mic disabled while Gretel speaks.
  test("replay button plays the model line for vowel and word items and LISTEN-phase responses disable the mic while playing", async ({ page }) => {
    test.setTimeout(180_000);
    const consoleErrors = trackConsoleErrors(page);
    await page.goto(tutorSessionUrl(1));
    await scriptLessonQueue(page, 1, {
      0: [
        { ok: true, transcript: "repite", alternatives: [] },
        { ok: true, transcript: "ayuda", alternatives: [] },
        { ok: true, transcript: "no sé", alternatives: [] },
        { ok: true, transcript: "[unk]", alternatives: [] },
        { ok: true, transcript: "platano", alternatives: [] },
        { ok: true, transcript: "a", alternatives: [] },
      ],
    });

    // Wait for LISTEN on vowel "a"
    await expect.poll(async () => micReadyToListen(page), { timeout: 60_000 }).toBe(true);

    // Click "Escuchar otra vez" on vowel "a" — should disable mic while replaying and update spoken caption to "a"
    const replayBtn = page.getByRole("button", { name: /Escuchar otra vez/i });
    await expect(replayBtn).toBeEnabled();
    await replayBtn.click();
    await expect.poll(async () => page.locator(".tutor-caption").textContent(), { timeout: 15_000 }).toBe("a");
    await expect.poll(async () => micReadyToListen(page), { timeout: 15_000 }).toBe(true);

    // Exercise REPEAT, HELP, DONT_KNOW, NOISE, OFF_SCRIPT intents before passing "a"
    for (let i = 0; i < 5; i++) {
      await tapMicWhenReady(page);
      // While the response line is playing (or holding), mic must be disabled
      await expect.poll(async () => (await micState(page)).disabled, { timeout: 10_000 }).toBe(true);
      await expect.poll(async () => micReadyToListen(page), { timeout: 20_000 }).toBe(true);
    }

    // Finally pass vowel "a"
    await tapMicWhenReady(page);
    await expect
      .poll(
        async () =>
          (await readProgressEvents(page)).find((event) => event.item_id === "l1-vowel-a"),
        { timeout: 60_000 },
      )
      .toMatchObject({ result: "correct", attempts: 1 });
    expect(consoleErrors.errors()).toEqual([]);
  });

  // 7c. Mute / unmute stops active speech and silent-line hold immediately.
  test("mute button toggles voice mute and cancels active mic capture cleanly", async ({ page }) => {
    test.setTimeout(120_000);
    const consoleErrors = trackConsoleErrors(page);
    await page.goto(tutorSessionUrl(1));
    await scriptLessonQueue(page, 1, {
      0: [{ ok: true, transcript: "a", alternatives: [], holdMs: 4000 }],
    });

    await tapMicWhenReady(page);
    await expect.poll(async () => (await micState(page)).capturing).toBe(true);

    const muteBtn = page.getByRole("button", { name: "Silenciar" });
    await muteBtn.click();
    await expect(page.getByRole("button", { name: "Activar sonido" })).toBeVisible();
    // Mic capture was cancelled immediately on mute toggle
    await expect.poll(async () => (await micState(page)).capturing).toBe(false);

    // Unmute
    await page.getByRole("button", { name: "Activar sonido" }).click();
    await expect(page.getByRole("button", { name: "Silenciar" })).toBeVisible();
    expect(consoleErrors.errors()).toEqual([]);
  });

  // 9a. Privacy: zero non-same-origin requests across a full session.
  test("a full scripted session makes zero non-same-origin requests", async ({ page }) => {
    test.setTimeout(420_000);
    const requests = trackRequests(page);
    await page.goto(tutorSessionUrl(1));
    const items = await scriptLessonQueue(page, 1);
    await driveSessionToCompletion(page, items.ids.length * 3);
    await expectSessionEnded(page);

    const urls = requests.urls();
    expect(urls.length).toBeGreaterThan(0);
    expectSameOriginOnly(urls, ORIGIN);
    // No speech/STT/cloud endpoints of any kind — inspected over the
    // non-same-origin requests only, so dev-server module filenames that
    // merely contain the word "speech" don't trip the guard.
    const originHost = new URL(ORIGIN).host;
    const foreign = urls.filter((url) => {
      try {
        return new URL(url).host !== originHost;
      } catch {
        return true;
      }
    });
    expect(foreign, "zero non-same-origin requests").toEqual([]);
    expect(
      foreign.filter((url) => /wss?:|google|gemini|speech|stt/i.test(url)),
      "no cloud STT endpoints may be contacted",
    ).toEqual([]);
  });

  // 9b. Gretel master baseline on the main entry routes. The swarm brief
  // asked for "absent everywhere except /tutor", but the shipped app already
  // renders gretel-approved-master.png as its mascot on these routes
  // (WelcomeSplash hero, lesson catalog header) — pre-existing owner-approved
  // branding committed long before the tutor lane. The repo is the source of
  // truth, so this test locks that baseline: the one known mascot image, and
  // nothing more. Contract deviation flagged in the worker report.
  const MAIN_ROUTES = ["/", "/cartilla/", "/entrar", "/cartilla/lecciones"];
  for (const route of MAIN_ROUTES) {
    test(`gretel-approved-master.png on ${route} stays at the pre-tutor mascot baseline`, async ({ page }) => {
      test.setTimeout(60_000);
      const requests = trackRequests(page);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      const masterUrls = new Set(
        [
          ...requests.urls(),
          ...(await page.evaluate(() =>
            Array.from(document.images).map((image) => image.currentSrc || image.src),
          )),
        ].filter((url) => url.includes("gretel-approved-master.png")),
      );
      // Baseline: exactly the one approved mascot image, loaded once, from
      // the app's own origin — no tutor-puppet duplicates or extra copies.
      expect(masterUrls.size).toBe(1);
      expect([...masterUrls][0]).toMatch(
        /^http:\/\/127\.0\.0\.1:5175\/cartilla\/images\/gretel\/gretel-approved-master\.png$/,
      );
    });
  }

  // 9c. The master IS the tutor puppet's image on the session screen.
  test("gretel-approved-master.png is used under /tutor/1", async ({ page }) => {
    test.setTimeout(60_000);
    const requests = trackRequests(page);
    await page.goto(tutorSessionUrl(1));
    await expect(page.locator('[data-tutor-stage]')).toBeVisible({ timeout: 60_000 });
    await expect
      .poll(async () => requests.urls().some((url) => url.includes("gretel-approved-master.png")), {
        timeout: 30_000,
      })
      .toBe(true);
  });

  // 10. Screenshots of the real dev-server build.
  for (const route of ["/tutor", tutorSessionUrl(1)]) {
    for (const viewport of [
      { width: 1280, height: 800, name: "1280x800" },
      { width: 390, height: 844, name: "390x844" },
    ]) {
      test(`screenshot ${route} at ${viewport.name}`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        if (route.includes("/tutor/1")) {
          await page.goto(route);
          await expect(page.locator('[data-tutor-stage]')).toBeVisible({ timeout: 60_000 });
        } else {
          await page.goto(route);
          await expect(page.getByRole("heading", { name: "Tutor de Gretel" })).toBeVisible();
        }
        const label = route.includes("/tutor/1") ? "tutor-session" : "tutor-picker";
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `tutor-${label}-${viewport.name}.png`),
        });
      });
    }
  }
});