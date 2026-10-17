import { expect, test, type Page } from "@playwright/test";

/**
 * Piano Hablador — real app route (/cartilla/practica family piano) with a
 * scripted stand-in for the browser recognizer. The stand-in only replaces the
 * Web Speech recognizer so each scenario (partial, wrong, denied, interrupted,
 * success) is reproducible; it proves the app's behavior for those recognizer
 * outputs, not the accuracy of any real recognizer on child speech, and it is
 * not a real-microphone test. `local` scripts the browser's on-device answer
 * (`SpeechRecognition.available({ processLocally: true })`).
 */
const PIANO_URL = "/cartilla/practica?family=1&lesson=9&activity=piano";

type LocalAnswer = "available" | "downloadable" | "unavailable" | "no-api";

async function installFakeRecognizer(
  page: Page,
  options: { supported?: boolean; local?: LocalAnswer } = {},
) {
  await page.addInitScript(
    ({ supported, local }) => {
      type Handler = ((event?: unknown) => void) | null;
      const log: string[] = [];
      const state = {
        active: null as null | Record<string, Handler | unknown>,
        results: [] as Array<{ t: string; f: boolean }>,
        starts: 0,
        constructed: 0,
        log,
      };
      (window as unknown as { __speech: unknown }).__speech = state;
      if (!supported) return;
      class FakeRecognition {
        static available =
          local === "no-api"
            ? undefined
            : async (options: { langs: string[]; processLocally: boolean }) => {
                log.push(`available:${options.langs.join(",")}:${options.processLocally}`);
                return local;
              };
        constructor() {
          state.constructed += 1;
        }
        processLocally = false;
        lang = "";
        continuous = false;
        interimResults = false;
        onstart: Handler = null;
        onresult: Handler = null;
        onerror: Handler = null;
        onend: Handler = null;
        onspeechstart: Handler = null;
        onspeechend: Handler = null;
        start() {
          state.starts += 1;
          state.results = [];
          state.active = this as unknown as Record<string, Handler>;
          log.push(
            `start:${this.lang}:${this.continuous}:${this.interimResults}:local=${this.processLocally}`,
          );
          setTimeout(() => this.onstart?.(), 20);
        }
        stop() {
          log.push("stop");
          setTimeout(() => this.end(), 20);
        }
        abort() {
          log.push("abort");
          this.end();
        }
        end() {
          if (state.active === (this as unknown)) state.active = null;
          this.onend?.();
        }
      }
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition =
        FakeRecognition;
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeRecognition;
      // Examples must never be heard by the recognizer: record if one is open.
      const realPlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function play() {
        log.push(`example-audio:mic-open=${Boolean(state.active)}`);
        setTimeout(() => this.dispatchEvent(new Event("ended")), 150);
        return realPlay.call(this).catch(() => undefined);
      };
      const synth = window.speechSynthesis;
      if (synth) {
        synth.speak = (utterance: SpeechSynthesisUtterance) => {
          log.push(`example-tts:${utterance.text}:mic-open=${Boolean(state.active)}`);
          setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 120);
        };
      }
    },
    { supported: options.supported ?? true, local: options.local ?? "available" },
  );
}

async function say(page: Page, kind: "speechstart" | "interim" | "final" | "error", text = "") {
  await page.evaluate(
    ({ kind, text }) => {
      const state = (
        window as unknown as {
          __speech: {
            active: Record<string, (e?: unknown) => void> | null;
            results: Array<{ t: string; f: boolean }>;
          };
        }
      ).__speech;
      const rec = state.active;
      if (!rec) throw new Error("recognizer not running");
      if (kind === "speechstart") return rec.onspeechstart?.();
      if (kind === "error") return rec.onerror?.({ error: text });
      const last = state.results[state.results.length - 1];
      if (last && !last.f) state.results.pop();
      state.results.push({ t: text, f: kind === "final" });
      const results = state.results.map((r) =>
        Object.assign([{ transcript: r.t }], { isFinal: r.f }),
      );
      rec.onresult?.({ resultIndex: Math.max(0, results.length - 1), results });
    },
    { kind, text },
  );
}

const key = (page: Page, i: number) => page.getByTestId(`piano-key-${i}`);
const slot = (page: Page, i: number) => page.locator(".piano-hablador__slot").nth(i);

async function openMic(page: Page) {
  await page.getByTestId("piano-mic").click();
  await expect(page.locator(".piano-hablador")).toHaveAttribute("data-mic-status", "listening");
}

test.describe("Piano Hablador", () => {
  test("SAPO: separated syllables turn red keys green one at a time, then one celebration", async ({
    page,
  }) => {
    await installFakeRecognizer(page);
    await page.goto(PIANO_URL);
    const piano = page.locator(".piano-hablador");
    await expect(piano).toHaveAttribute("data-piano-word", "sapo");
    await expect(key(page, 0)).toHaveAttribute("aria-hidden", "true");
    await expect(key(page, 1)).toHaveAttribute("aria-hidden", "true");

    await page.getByTestId("piano-escuchar").click();
    await expect(page.getByTestId("piano-mic")).toBeDisabled();
    await expect(page.getByTestId("piano-mic")).toBeEnabled({ timeout: 7000 });

    await openMic(page);
    await say(page, "speechstart");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "hearing");
    await say(page, "interim", "sa");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "provisional");
    await expect(piano).toHaveAttribute("data-confirmed", "0");
    await say(page, "final", "sa");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "confirmed");
    await expect(key(page, 0)).toHaveAttribute("data-key-state", "confirmed");
    await expect(slot(page, 1)).not.toHaveAttribute("data-key-state", "confirmed");
    await page.screenshot({ path: "test-results/piano-proof/02-sa-green.png" });

    await say(page, "final", "po");
    await expect(piano).toHaveAttribute("data-done", "true");
    await expect(slot(page, 1)).toHaveAttribute("data-key-state", "confirmed");
    await expect(page.getByTestId("piano-sparkle")).toHaveCount(1);
    await expect(page.getByTestId("piano-message")).toContainText("¡Muy bien! Dijiste «sapo».");
    await expect(piano).toHaveAttribute("data-mic-status", "idle");
    await page.waitForTimeout(1700);
    await page.screenshot({ path: "test-results/piano-proof/03-sapo-complete.png" });
    await expect(page.getByTestId("piano-sparkle")).toHaveCount(1);
    // Keys stay green until the next word.
    await page.waitForTimeout(1500);
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "confirmed");
    await expect(slot(page, 1)).toHaveAttribute("data-key-state", "confirmed");

    await page.getByTestId("piano-next").click();
    await expect(piano).toHaveAttribute("data-piano-word", "puso");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "next");
    await expect(page.getByTestId("piano-sparkle")).toHaveCount(0);

    const log = await page.evaluate(
      () => (window as unknown as { __speech: { log: string[] } }).__speech.log,
    );
    expect(
      log
        .filter((entry) => entry.startsWith("example-"))
        .every((entry) => entry.endsWith("mic-open=false")),
    ).toBe(true);
    expect(log.find((entry) => entry.startsWith("start:"))).toBe(
      "start:es-MX:true:true:local=true",
    );
    // Every session it opened was on-device.
    expect(log.filter((e) => e.startsWith("start:") && !e.endsWith("local=true"))).toEqual([]);
  });

  test("whole word spoken naturally completes; wrong and uncertain speech never turn keys green", async ({
    page,
  }) => {
    await installFakeRecognizer(page);
    await page.goto(PIANO_URL);
    const piano = page.locator(".piano-hablador");
    await openMic(page);
    for (const wrong of ["casa", "papo", "sopa", "esa", "pasó"]) {
      await say(page, "final", wrong);
      await expect(piano).toHaveAttribute("data-confirmed", "0");
    }
    await expect(page.getByTestId("piano-message")).toContainText("No estoy segura");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "next");
    await page.screenshot({ path: "test-results/piano-proof/04-uncertain-no-penalty.png" });
    await say(page, "final", "Sapo");
    await expect(piano).toHaveAttribute("data-done", "true");
    await expect(page.getByTestId("piano-sparkle")).toHaveCount(1);
    // A late duplicate result cannot trigger a second celebration.
    await expect(piano).toHaveAttribute("data-mic-status", "idle");
  });

  test("interrupted speech keeps confirmed keys; a retry continues from the next key", async ({
    page,
  }) => {
    await installFakeRecognizer(page);
    await page.goto(PIANO_URL);
    const piano = page.locator(".piano-hablador");
    await openMic(page);
    await say(page, "final", "sa");
    await expect(piano).toHaveAttribute("data-confirmed", "1");
    await say(page, "interim", "po");
    await expect(slot(page, 1)).toHaveAttribute("data-key-state", "provisional");
    // Interruption: the tab is hidden mid-word (call, app switch).
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(piano).toHaveAttribute("data-mic-status", "idle");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "confirmed");
    await expect(slot(page, 1)).toHaveAttribute("data-key-state", "next");
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
    });
    await openMic(page);
    await say(page, "error", "no-speech");
    await expect(page.getByTestId("piano-message")).toContainText("No te oí");
    await expect(slot(page, 0)).toHaveAttribute("data-key-state", "confirmed");
    await openMic(page);
    await say(page, "final", "po");
    await expect(piano).toHaveAttribute("data-done", "true");
  });

  test("microphone permission refused: no fallback and no false progress", async ({ page }) => {
    await installFakeRecognizer(page);
    await page.goto(PIANO_URL);
    const piano = page.locator(".piano-hablador");
    await page.getByTestId("piano-mic").click();
    await say(page, "error", "not-allowed");
    await expect(page.getByTestId("piano-message")).toContainText("El micrófono no tiene permiso");
    await expect(page.getByTestId("piano-touch-mode")).toHaveCount(0);
    await expect(key(page, 0)).toHaveAttribute("aria-hidden", "true");
    await key(page, 0).click({ force: true });
    await page.keyboard.press("a");
    await expect(piano).toHaveAttribute("data-confirmed", "0");
    await expect(piano).toHaveAttribute("data-done", "false");
    await page.screenshot({ path: "test-results/piano-proof/05-mic-denied.png" });
  });

  test("speech recognition unavailable: piano keys remain visual only", async ({ page }) => {
    await installFakeRecognizer(page, { supported: false });
    await page.addInitScript(() => {
      delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
      delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    });
    await page.goto(PIANO_URL);
    const piano = page.locator(".piano-hablador");
    await expect(page.getByTestId("piano-message")).toContainText(
      "Este navegador no permite usar el micrófono",
    );
    await expect(page.getByTestId("piano-mic")).toBeDisabled();
    await expect(page.getByTestId("piano-touch-mode")).toHaveCount(0);
    await key(page, 0).click({ force: true });
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    await expect(piano).toHaveAttribute("data-confirmed", "0");
    await expect(piano).toHaveAttribute("data-done", "false");
  });

  for (const local of ["downloadable", "unavailable", "no-api"] as const) {
    test(`on-device recognition ${local}: microphone unavailable and no false key confirmation`, async ({
      page,
    }) => {
      await installFakeRecognizer(page, { local });
      await page.goto(PIANO_URL);
      const piano = page.locator(".piano-hablador");
      await expect(piano).toHaveAttribute("data-recognition-processing", "unavailable");
      await expect(page.getByTestId("piano-message")).toContainText(
        "Este navegador no tiene reconocimiento local compatible",
      );
      await expect(page.getByTestId("piano-privacy")).toContainText(
        "no se usa ningún servicio de voz por internet",
      );
      await expect(page.getByTestId("piano-mic")).toBeDisabled();
      await expect(page.getByTestId("piano-touch-mode")).toHaveCount(0);
      await key(page, 0).click({ force: true });
      await page.keyboard.press("Enter");
      await expect(piano).toHaveAttribute("data-confirmed", "0");
      await expect(piano).toHaveAttribute("data-done", "false");
      const speech = await page.evaluate(
        () => (window as unknown as { __speech: { constructed: number; starts: number } }).__speech,
      );
      expect(speech.constructed).toBe(0);
      expect(speech.starts).toBe(0);
      if (local === "unavailable") {
        await page.screenshot({ path: "test-results/piano-proof/07-local-unavailable.png" });
      }
    });
  }

  test("phone and laptop layouts, reduced motion", async ({ browser }) => {
    for (const [name, viewport, reducedMotion] of [
      ["phone-390", { width: 390, height: 844 }, "no-preference"],
      ["laptop-1366", { width: 1366, height: 768 }, "no-preference"],
      ["phone-reduced-motion", { width: 390, height: 844 }, "reduce"],
    ] as const) {
      const context = await browser.newContext({
        viewport,
        reducedMotion,
        hasTouch: name.startsWith("phone"),
      });
      const page = await context.newPage();
      await installFakeRecognizer(page);
      await page.goto(PIANO_URL);
      const bed = page.locator(".piano-hablador__bed");
      const box = await bed.boundingBox();
      expect(box && box.width <= viewport.width).toBe(true);
      for (const i of [0, 1]) {
        const keyBox = await key(page, i).boundingBox();
        expect(keyBox && keyBox.width >= 44 && keyBox.height >= 44).toBe(true);
      }
      await openMic(page);
      await say(page, "final", "sa");
      await page.locator(".piano-hablador").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/piano-proof/06-${name}.png`, fullPage: false });
      await say(page, "final", "po");
      await expect(page.getByTestId("piano-sparkle")).toHaveCount(1);
      if (reducedMotion === "reduce") {
        const animation = await page
          .getByTestId("piano-sparkle")
          .evaluate((el) => getComputedStyle(el).animationName);
        expect(animation).toBe("none");
      }
      await context.close();
    }
  });
});
