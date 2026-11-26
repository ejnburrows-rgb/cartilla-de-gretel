// Complete Payaso Chano rounds at the checked-out commit (5 words, touch/mouse drag, wrong answer,
// Borrar, taking a ball off a slot, finish, restart; normal and reduced motion).
// Run from the repo root with the dev server on 127.0.0.1:5173:
//   node docs/proofs/assets-motion-2026-11-26/scripts/chano-full-rounds.mjs
import { chromium } from "@playwright/test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

// Fixed URL and output paths; no arguments.
const BASE = "http://127.0.0.1:5173";
const OUT = "/tmp/ev/chano-full";
fs.mkdirSync(OUT, { recursive: true });
const HEAD = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const report = [];

const RUNS = [
  { name: "phone", viewport: { width: 390, height: 844 }, touch: true, reduced: false },
  { name: "phone-land", viewport: { width: 844, height: 390 }, touch: true, reduced: false },
  { name: "desktop", viewport: { width: 1366, height: 768 }, touch: false, reduced: false },
  { name: "phone-reduced", viewport: { width: 390, height: 844 }, touch: true, reduced: true },
  { name: "desktop-reduced", viewport: { width: 1366, height: 768 }, touch: false, reduced: true },
];

for (const run of RUNS) {
  const ctx = await b.newContext({
    viewport: run.viewport,
    hasTouch: run.touch,
    isMobile: run.touch && run.viewport.width < 500,
    reducedMotion: run.reduced ? "reduce" : "no-preference",
    recordVideo: { dir: `${OUT}/v-${run.name}`, size: run.viewport },
  });
  const p = await ctx.newPage();
  const cdp = run.touch ? await ctx.newCDPSession(p) : null;
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  const log = [];
  const shot = (n) => p.screenshot({ path: `${OUT}/${run.name}-${n}.png` });
  const ballStates = () =>
    p.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll('[data-testid^="chano-juggle-ball-"]')].map((el) => [el.dataset.testid.slice(-2), el.dataset.state]),
      ),
    );
  const ballCount = () => p.locator('[data-testid^="chano-juggle-ball-"]').count();
  const slotLabels = () => p.locator(".chano-slot").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  const hint = () => p.locator(".chano-board-hint").textContent();
  const centre = async (loc) => {
    const r = await loc.boundingBox();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  };
  const waitOnBoard = (syls) =>
    p.waitForFunction(
      (s) => s.every((x) => document.querySelector(`[data-testid="chano-juggle-ball-${x}"]`)?.dataset.state === "on-board"),
      syls,
      { timeout: 8000 },
    );
  const waitAllJuggling = () =>
    p.waitForFunction(
      () => [...document.querySelectorAll('[data-testid^="chano-juggle-ball-"]')].every((el) => el.dataset.state === "juggling"),
      null,
      { timeout: 8000 },
    );
  const tap = async (name) => {
    const loc = p.getByRole("button", { name, exact: true });
    if (run.touch) await loc.tap();
    else await loc.click();
  };
  // Drag a ball onto a slot with a real touch (CDP touch events → pointerType "touch") or the mouse.
  const drag = async (syl, slotIdx) => {
    const from = await centre(p.getByRole("button", { name: syl, exact: true }));
    const to = await centre(p.locator(".chano-slot").nth(slotIdx));
    const steps = 12;
    if (run.touch) {
      const pt = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }];
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt(from.x, from.y) });
      for (let i = 1; i <= steps; i++) {
        const x = from.x + ((to.x - from.x) * i) / steps;
        const y = from.y + ((to.y - from.y) * i) / steps;
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: pt(x, y) });
        await p.waitForTimeout(16);
        if (i === steps / 2) await shot(`drag-${syl}-midway`);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await p.mouse.move(from.x, from.y);
      await p.mouse.down();
      for (let i = 1; i <= steps; i++) {
        await p.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
        await p.waitForTimeout(16);
        if (i === steps / 2) await shot(`drag-${syl}-midway`);
      }
      await p.mouse.up();
    }
    await p.waitForTimeout(150);
  };
  const check = async (word) => {
    await tap("Comprobar");
    await p.waitForTimeout(400);
    const h = await hint();
    log.push({ word, check: h, balls: await ballCount(), states: await ballStates() });
    return h;
  };

  let ok = true;
  let failure = null;
  try {
    await p.goto(`${BASE}/cartilla/juego/payaso-chano-ss`);
    await p.waitForTimeout(2000);
    await shot("0-start");
    // In normal motion the juggle must be moving; in reduced motion it must not.
    const pos = () => p.locator('[data-testid="chano-juggle-ball-mo"]').evaluate((el) => el.style.transform);
    const t1 = await pos();
    await p.waitForTimeout(300);
    const t2 = await pos();
    log.push({ juggleMoving: t1 !== t2 });

    // Word 1 "mima": drag mi into slot 1, then tap ma.
    await drag("mi", 0);
    log.push({ afterDrag: await slotLabels() });
    await tap("ma");
    await waitOnBoard(["mi", "ma"]);
    await shot("1-mima-placed");
    if ((await check("mima")) !== "¡Muy bien!") throw new Error("mima not accepted");
    await tap("Siguiente");
    await waitAllJuggling();

    // Word 2 "mamá": wrong first (me + mi), it turns red and clears; then ma + ma.
    await tap("me");
    await tap("mi");
    await waitOnBoard(["me", "mi"]);
    const wrong = await check("mamá-wrong");
    await shot("2-mama-wrong");
    if (wrong !== "Intenta otra vez.") throw new Error(`wrong answer not rejected: ${wrong}`);
    await p.waitForTimeout(1300); // the red mark clears after 1.1 s
    await waitAllJuggling();
    log.push({ afterWrongClear: await slotLabels() });
    await tap("ma");
    await tap("ma");
    await waitOnBoard(["ma"]);
    await shot("2-mama-repeat-syllable");
    if ((await check("mamá")) !== "¡Muy bien!") throw new Error("mamá not accepted");
    await tap("Siguiente");
    await waitAllJuggling();

    // Word 3 "Meme": put mu, press Borrar (ball goes back), then me + me.
    await tap("mu");
    await waitOnBoard(["mu"]);
    await tap("Borrar");
    await waitAllJuggling();
    log.push({ afterBorrar: await slotLabels() });
    await shot("3-meme-after-borrar");
    await tap("me");
    await tap("me");
    await waitOnBoard(["me"]);
    if ((await check("Meme")) !== "¡Muy bien!") throw new Error("Meme not accepted");
    await tap("Siguiente");
    await waitAllJuggling();

    // Word 4 "Mumi": drag mi into slot 2 first, then tap mu (fills the empty slot 1).
    await drag("mi", 1);
    await tap("mu");
    await waitOnBoard(["mu", "mi"]);
    log.push({ mumiSlots: await slotLabels() });
    await shot("4-mumi-placed");
    if ((await check("Mumi")) !== "¡Muy bien!") throw new Error("Mumi not accepted");
    await tap("Siguiente");
    await waitAllJuggling();

    // Word 5 "mami": tap a filled slot to take a ball back off, then finish.
    await tap("ma");
    await tap("mu");
    await waitOnBoard(["ma", "mu"]);
    await p.locator(".chano-slot").nth(1).click();
    await p.waitForFunction(() => document.querySelector('[data-testid="chano-juggle-ball-mu"]')?.dataset.state !== "on-board");
    log.push({ afterSlotTapRemove: await slotLabels() });
    await tap("mi");
    await waitOnBoard(["ma", "mi"]);
    if ((await check("mami")) !== "¡Muy bien!") throw new Error("mami not accepted");
    await tap("Siguiente");
    await p.waitForTimeout(500);
    const end = await p.locator(".chano-board-count").textContent();
    const endHint = await hint();
    await shot("5-terminaste");
    log.push({ end, endHint });
    if (end !== "¡Terminaste!") throw new Error(`no end screen: ${end}`);

    // Restart: Siguiente after the end starts a fresh game with every ball back in the juggle.
    await tap("Siguiente");
    await p.waitForTimeout(500);
    await waitAllJuggling();
    const restart = await p.locator(".chano-board-count").textContent();
    log.push({ restart, slots: await slotLabels() });
    await shot("6-restarted");
    if (restart !== "Palabra 1 de 5") throw new Error(`restart failed: ${restart}`);
  } catch (e) {
    ok = false;
    failure = String(e).split("\n")[0];
    await shot("FAIL").catch(() => {});
  }
  await ctx.close();
  const dir = `${OUT}/v-${run.name}`;
  fs.renameSync(`${dir}/${fs.readdirSync(dir)[0]}`, `${OUT}/chano-full-${run.name}.webm`);
  fs.rmSync(dir, { recursive: true });
  const r = { head: HEAD, run: run.name, touch: run.touch, reducedMotion: run.reduced, ok: ok && errors.length === 0, failure, errors, log };
  report.push(r);
  console.log(JSON.stringify({ run: r.run, ok: r.ok, failure, juggleMoving: log[0]?.juggleMoving, steps: log.length }));
}
fs.writeFileSync(`${OUT}/chano-full-rounds.json`, JSON.stringify(report, null, 1));
await b.close();
