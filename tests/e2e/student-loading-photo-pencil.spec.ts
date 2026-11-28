import { expect, test } from "@playwright/test";

// Recognizer discovery is deliberately simulated. These are browser rendering
// and safety regressions, not real microphone or audible-audio acceptance.
test.use({ video: "on" });
for (const viewport of [
  { width: 390, height: 844 },
  { width: 1366, height: 768 },
]) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });
    test("hung local-speech discovery cannot leave the Workbook blank", async ({ page }, info) => {
      await page.addInitScript(() => {
        class NeverReady {
          static available = () => new Promise<string>(() => {});
          processLocally = true;
          start() {
            throw new Error("microphone must remain off");
          }
          abort() {}
        }
        Object.defineProperty(window, "SpeechRecognition", {
          configurable: true,
          value: NeverReady,
        });
        Object.defineProperty(window, "webkitSpeechRecognition", {
          configurable: true,
          value: NeverReady,
        });
      });
      await page.goto("/cartilla/leccion/2");
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });
      await page.screenshot({ path: info.outputPath("workbook-after-hung-discovery.png") });
      await page.goto("/cartilla/practica?family=1&lesson=9&activity=piano");
      await expect(page.locator(".piano-hablador")).toHaveAttribute(
        "data-recognition-processing",
        "unavailable",
        { timeout: 15000 },
      );
      await expect(page.getByTestId("piano-mic")).toBeDisabled();
      await expect(page.locator(".piano-hablador")).toHaveAttribute("data-done", "false");
      await page.screenshot({ path: info.outputPath("piano-safe-unavailable.png") });
    });
    test("letter tracing uses one full-size shared photo cursor, never a clipped duplicate", async ({
      page,
    }, info) => {
      await page.addInitScript(() => {
        Object.defineProperty(window, "SpeechRecognition", {
          configurable: true,
          value: undefined,
        });
        Object.defineProperty(window, "webkitSpeechRecognition", {
          configurable: true,
          value: undefined,
        });
        const resume = JSON.stringify({ lesson: 2, page: 2 });
        localStorage.setItem("cartilla.learner-resume.v1:2", resume);
        localStorage.setItem("cartilla.learner-resume.v1", resume);
      });
      await page.goto("/cartilla/leccion/2?cursor=contract");
      await expect(page.locator(".native-lesson-viewer")).toHaveAttribute("data-native-page", "6", {
        timeout: 15000,
      });
      const trace = page.locator(".fp-trace").first();
      await expect(trace).toHaveAttribute("data-mode", "tap");
      await expect(trace.getByTestId("contract-pencil-photo-head")).toHaveCount(0);
      const cursor = page.locator(".contract-pencil-cursor");
      await expect(cursor).toHaveCount(1);
      await expect(cursor.getByTestId("contract-pencil-photo-head")).toHaveCount(1);
      await expect(cursor.locator("svg").first()).toHaveAttribute("width", "252");
      await expect(cursor).toHaveCSS("position", "fixed");
      await expect(cursor.locator("svg").first()).toHaveCSS("overflow", "visible");
      await trace.locator(".fp-trace__dot--active").click();
      await expect(trace).toHaveAttribute("data-status", "tracing");
      await expect(cursor).toHaveAttribute("data-visible", "true");
      await page.screenshot({ path: info.outputPath("approved-photo-pencil-tracing.png") });
      await page.goto("/cartilla/leccion/2?cursor=normal");
      await expect(page.locator(".contract-pencil-cursor")).toHaveCount(0);
      await expect(page.locator(".fp-trace [data-testid=contract-pencil-photo-head]")).toHaveCount(
        0,
      );
    });
  });
}
