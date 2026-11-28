#!/usr/bin/env node
import { chromium, expect } from "@playwright/test";

const [base] = process.argv.slice(2);
if (!base) throw new Error("Usage: node scripts/verify-tutor-vowels.mjs <preview-url>");

const lessons = [
  { lesson: 2, vowel: "o", mouth: "E" },
  { lesson: 3, vowel: "a", mouth: "D" },
  { lesson: 4, vowel: "e", mouth: "C" },
  { lesson: 5, vowel: "i", mouth: "B" },
  { lesson: 6, vowel: "u", mouth: "F" },
];
const browser = await chromium.launch({
  executablePath: process.env.TUTOR_CHROME_PATH || undefined,
  proxy: process.env.TUTOR_PROXY_SERVER ? { server: process.env.TUTOR_PROXY_SERVER } : undefined,
});

try {
  for (const { lesson, vowel, mouth } of lessons) {
    const page = await browser.newPage({
      viewport: lesson % 2 ? { width: 1366, height: 768 } : { width: 390, height: 844 },
      ignoreHTTPSErrors: process.env.TUTOR_TEST_IGNORE_CERT_ERRORS === "1",
    });
    try {
      await page.addInitScript(() => {
        window.vowelProof = { playing: [], ended: [], mouths: [] };
        const recordMouth = () => {
          const avatar = document.querySelector("[data-puppet-mode='painted-classroom']");
          if (avatar) window.vowelProof.mouths.push(avatar.dataset.puppetViseme);
        };
        new MutationObserver(recordMouth).observe(document, {
          subtree: true, attributes: true, attributeFilter: ["data-puppet-viseme"],
        });
        const AudioElement = window.Audio;
        window.Audio = new Proxy(AudioElement, {
          construct(target, args) {
            const audio = new target(...args);
            for (const event of ["playing", "ended"]) {
              audio.addEventListener(event, () => {
                window.vowelProof[event].push(new URL(audio.currentSrc).pathname);
              });
            }
            return audio;
          },
        });
      });

      await page.goto(new URL("/cartilla/lecciones", base).href);
      await page.getByRole("link", { name: "Aprender con Gretel", exact: true }).click();
      await page.getByRole("link", { name: new RegExp(`^Lección ${lesson}\\s`) }).click();
      const model = `/audio/voz/tutor/leccion-0/l0-vowel-model-${vowel}.mp3`;
      await expect(page.locator("[data-tutor-question-prompt]")).toContainText(`«${vowel}»`, { timeout: 22000 });
      await expect.poll(() => page.evaluate(() => window.vowelProof.ended)).toContain(model);
      const history = await page.evaluate(() => window.vowelProof);
      expect(history.playing).toContain(model);
      expect(history.mouths).toContain(mouth);
      await expect(page.locator("[data-puppet-mode='painted-classroom']")).toHaveAttribute("data-puppet-viseme", "X");

      await page.getByRole("button", { name: "Escuchar otra vez", exact: true }).first().click();
      await expect.poll(async () => {
        const ended = await page.evaluate(() => window.vowelProof.ended);
        return ended.filter((path) => path === model).length;
      }).toBe(2);
      console.log(JSON.stringify({ lesson, vowel, playback: "model and replay", mouth }));
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
