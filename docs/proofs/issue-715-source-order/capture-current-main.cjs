const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/local/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  let errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const results = [];
  try {
    for (const [sheet, lesson] of [
      [10, 7],
      [16, 9],
      [19, 10],
    ]) {
      await page.goto(`http://127.0.0.1:5173/cartilla/presentar/${lesson}`, {
        waitUntil: "networkidle",
        timeout: 90000,
      });
      await page.getByTestId("flipchart-hd-panel").waitFor({ timeout: 60000 });
      await page.keyboard.press("ArrowRight");
      const board = page.locator(
        `[data-testid="flipchart-stage"] [data-testid="flipchart-native-board"][data-flipchart-page="${sheet}"]`,
      );
      await page.waitForFunction(
        (n) =>
          document
            .querySelector('[data-testid="flipchart-stage"] [data-testid="flipchart-native-board"]')
            ?.getAttribute("data-flipchart-page") === String(n),
        sheet,
      );
      await page.getByTestId("vertical-flip-layer").waitFor({ state: "detached", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      await page.screenshot({
        path: `/data/715-evidence/current-main-sheet-${sheet}-1920x1080.png`,
      });
      results.push(
        await board.evaluate((el) => {
          let rect = (e) => {
            let r = e.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          };
          return {
            page: el.getAttribute("data-flipchart-page"),
            board: rect(el),
            replica: !!el.querySelector("[data-replica-page]"),
            tokens: [...el.querySelectorAll("[data-token-kind]")].map((e) => ({
              text: e.innerText,
              kind: e.getAttribute("data-token-kind"),
              fitGroup: e.getAttribute("data-fit-group"),
              box: rect(e),
            })),
            rows: [...el.querySelectorAll(".fc-syllable-row")].map((e) => ({
              text: e.innerText,
              box: rect(e),
              items: [...e.querySelectorAll(".fc-syllable-row__item")].map((i) => ({
                text: i.innerText,
                box: rect(i),
              })),
            })),
            words: [...el.querySelectorAll('[data-testid="flipchart-words"] li')].map((e) => ({
              text: e.innerText,
              box: rect(e),
            })),
            prose: [...el.querySelectorAll(".fc-reading-bar__line")].map((e) => ({
              text: e.innerText,
              box: rect(e),
            })),
            fullText: el.innerText,
          };
        }),
      );
    }
    fs.writeFileSync(
      "/data/715-evidence/browser-dom.json",
      JSON.stringify(
        {
          sha: "64666e84aa5e3e080de1fde6c1366f1f30b8aa50",
          viewport: { width: 1920, height: 1080 },
          runtime:
            "real /cartilla/presentar route on isolated Vite worker with dead-local Supabase and no product modifications",
          results,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        captured: results.map((x) => ({
          page: x.page,
          rows: x.rows.map((r) => r.text),
          words: x.words.map((w) => w.text),
          prose: x.prose.map((p) => p.text),
          replica: x.replica,
          tokens: x.tokens.map((t) => t.text),
        })),
        errors,
      }),
    );
  } finally {
    await page.close();
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
