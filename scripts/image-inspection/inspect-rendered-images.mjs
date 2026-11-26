#!/usr/bin/env node
// Rendered-image inspection for the Images workstream (#877).
// Opens every Workbook page, Flip Chart sheet and game route at phone, desktop
// and projector sizes and records, for every visible picture: load failure,
// distortion (aspect change), clipping by an ancestor, and upscaling beyond
// the file's pixel size. Read-only: it never edits app state beyond seeding the
// learner resume pointer used by the existing e2e suites.
//
// Usage: node scripts/image-inspection/inspect-rendered-images.mjs \
//   [--base http://127.0.0.1:5173] [--out docs/proofs/image-inspection] \
//   [--only workbook,flipchart,games] [--viewports phone,desktop,projector] [--shots]
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const BASE = arg("base", "http://127.0.0.1:5173");
const OUT = path.resolve(arg("out", "docs/proofs/image-inspection"));
const ONLY = new Set(arg("only", "workbook,flipchart,games").split(","));
const SHOTS = args.includes("--shots");
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, dpr: 2 },
  { name: "desktop", width: 1366, height: 768, dpr: 1 },
  { name: "projector", width: 1920, height: 1080, dpr: 1 },
].filter((v) => arg("viewports", "phone,desktop,projector").split(",").includes(v.name));

export const THRESHOLDS = { distortion: 0.02, clip: 0.015, upscale: 1.25 };

// Runs in the page. Returns one record per visible raster/vector picture.
async function measure({ dpr, thresholds }) {
  const loadSize = (url) =>
    new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve([im.naturalWidth, im.naturalHeight]);
      im.onerror = () => resolve([0, 0]);
      im.src = url;
    });
  const isSvg = (src) => /\.svg(\?|#|$)/i.test(src) || src.startsWith("data:image/svg");
  const clipRectFor = (el) => {
    let rect = { l: -Infinity, t: -Infinity, r: Infinity, b: Infinity };
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const ox = cs.overflowX !== "visible", oy = cs.overflowY !== "visible";
      const clipPath = cs.clipPath && cs.clipPath !== "none";
      if (!ox && !oy && !clipPath) continue;
      const r = a.getBoundingClientRect();
      // Scroll containers are not clipping defects when the content can be scrolled into view.
      const scrollX = ["auto", "scroll"].includes(cs.overflowX) && a.scrollWidth > a.clientWidth;
      const scrollY = ["auto", "scroll"].includes(cs.overflowY) && a.scrollHeight > a.clientHeight;
      if ((ox || clipPath) && !scrollX) { rect.l = Math.max(rect.l, r.left); rect.r = Math.min(rect.r, r.right); }
      if ((oy || clipPath) && !scrollY) { rect.t = Math.max(rect.t, r.top); rect.b = Math.min(rect.b, r.bottom); }
    }
    return rect;
  };
  const visibleEl = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    for (let a = el; a; a = a.parentElement) if (Number(getComputedStyle(a).opacity) === 0) return false;
    return true;
  };
  // Content box of a replaced element after object-fit / background-size.
  const contentBox = (r, nw, nh, fit) => {
    const ar = nw / nh;
    let w = r.width, h = r.height;
    if (fit === "contain" || fit === "scale-down") {
      let s = Math.min(r.width / nw, r.height / nh);
      if (fit === "scale-down") s = Math.min(s, 1);
      w = nw * s; h = nh * s;
    } else if (fit === "cover") {
      const s = Math.max(r.width / nw, r.height / nh);
      w = nw * s; h = nh * s;
    } else if (fit === "none") {
      w = nw; h = nh;
    }
    const left = r.left + (r.width - w) / 2, top = r.top + (r.height - h) / 2;
    return { left, top, right: left + w, bottom: top + h, w, h, ar };
  };

  const records = [];
  const push = async (el, kind, src, nw, nh, fit) => {
    const r = el.getBoundingClientRect();
    const rec = {
      kind, src: src.replace(location.origin, ""), natural: `${nw}x${nh}`,
      box: `${Math.round(r.width)}x${Math.round(r.height)}`, fit, issues: [],
    };
    if (!nw || !nh) { rec.issues.push("BROKEN"); records.push(rec); return; }
    const cb = contentBox(r, nw, nh, fit);
    if (fit === "fill") {
      const d = Math.abs(r.width / r.height / (nw / nh) - 1);
      rec.distortion = +d.toFixed(3);
      if (d > thresholds.distortion) rec.issues.push("DISTORTED");
    }
    if (fit === "cover" || fit === "none") {
      const shown = (Math.min(cb.w, r.width) * Math.min(cb.h, r.height)) / (cb.w * cb.h);
      rec.fitCrop = +(1 - shown).toFixed(3);
      if (1 - shown > thresholds.clip) rec.issues.push("FIT_CROPPED");
    }
    const c = clipRectFor(el);
    const visW = Math.max(0, Math.min(cb.right, c.r) - Math.max(cb.left, c.l));
    const visH = Math.max(0, Math.min(cb.bottom, c.b) - Math.max(cb.top, c.t));
    const clipped = 1 - (visW * visH) / Math.max(1, Math.min(cb.w, r.width) * Math.min(cb.h, r.height));
    rec.clipped = +Math.max(0, clipped).toFixed(3);
    if (clipped > thresholds.clip && clipped < 0.999) rec.issues.push("CLIPPED");
    if (cb.left + 1 < 0 || cb.right - 1 > innerWidth) rec.issues.push("OFFSCREEN_X");
    if (!isSvg(src)) {
      const up = (Math.min(cb.w, r.width) * dpr) / nw;
      rec.upscale = +up.toFixed(2);
      if (up > thresholds.upscale) rec.issues.push("LOW_RES");
    }
    records.push(rec);
  };

  for (const img of document.querySelectorAll("img")) {
    if (!visibleEl(img)) continue;
    const src = img.currentSrc || img.src;
    if (!img.complete) await new Promise((res) => { img.onload = img.onerror = res; setTimeout(res, 4000); });
    await push(img, "img", src, img.naturalWidth, img.naturalHeight, getComputedStyle(img).objectFit);
  }
  for (const im of document.querySelectorAll("svg image")) {
    if (!visibleEl(im)) continue;
    const href = im.getAttribute("href") || im.getAttribute("xlink:href");
    if (!href) continue;
    const url = new URL(href, location.href).href;
    const [nw, nh] = await loadSize(url);
    const par = im.getAttribute("preserveAspectRatio") || "xMidYMid meet";
    await push(im, "svg-image", url, nw, nh, par === "none" ? "fill" : par.includes("slice") ? "cover" : "contain");
  }
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    const m = cs.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m || !visibleEl(el) || m[1].startsWith("data:image/svg")) continue;
    const [nw, nh] = await loadSize(m[1]);
    const size = cs.backgroundSize;
    const fit = size === "contain" ? "contain" : size === "cover" ? "cover" : /100% 100%/.test(size) ? "fill" : "none";
    if (fit === "none") continue; // tiled/patterned textures are not pictures
    await push(el, "background", new URL(m[1], location.href).href, nw, nh, fit);
  }
  return records;
}

async function settle(page) {
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15_000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(900);
}

async function dismissIntro(page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) await start.click().catch(() => {});
}

async function inspect(page, vp, surface, id, results, shotDir) {
  const records = await page.evaluate(measure, { dpr: vp.dpr, thresholds: THRESHOLDS });
  const flagged = records.filter((r) => r.issues.length);
  results.push({ surface, id, viewport: vp.name, images: records.length, flagged: flagged.length, records });
  console.log(`${vp.name} ${surface} ${id} images=${records.length} flagged=${flagged.length}`);
  if (SHOTS || flagged.length) {
    await fs.mkdir(shotDir, { recursive: true });
    await page.screenshot({ path: path.join(shotDir, `${surface}-${id}-${vp.name}.jpg`), type: "jpeg", quality: 70 });
  }
  return records.length;
}

async function workbook(page, vp, results, shotDir) {
  for (let lesson = 1; lesson <= 40; lesson += 1) {
    let total = 1;
    for (let idx = 0; idx < total; idx += 1) {
      await page.addInitScript(({ l, p }) => {
        const payload = JSON.stringify({ lesson: l, page: p });
        localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
        localStorage.setItem("cartilla.learner-resume.v1", payload);
      }, { l: lesson, p: idx });
      await page.goto(`${BASE}/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
      await settle(page);
      await dismissIntro(page);
      await settle(page);
      const label = await page.evaluate(() => document.body.innerText.match(/P[áa]gina (\d+) · (\d+) de (\d+)/)?.slice(1).map(Number) ?? null);
      if (!label) {
        if (idx === 0) {
          const any = await page.locator(".native-lesson-viewer").count();
          if (!any) { results.push({ surface: "workbook", id: `L${lesson}`, viewport: vp.name, note: "no native viewer" }); }
          else await inspect(page, vp, "workbook", `L${lesson}`, results, shotDir);
        }
        break;
      }
      const [bookPage, at, of] = label;
      total = of;
      if (at !== idx + 1) {
        results.push({ surface: "workbook", id: `L${lesson}-i${idx + 1}`, viewport: vp.name, note: `resume landed on ${at}/${of}` });
        continue;
      }
      await inspect(page, vp, "workbook", `p${String(bookPage).padStart(3, "0")}`, results, shotDir);
    }
  }
}

async function flipchart(page, vp, results, shotDir) {
  for (let lesson = 1; lesson <= 24; lesson += 1) {
    await page.goto(`${BASE}/cartilla/presentar/${lesson}`, { waitUntil: "domcontentloaded" });
    const counter = page.getByTestId("flipchart-counter");
    if (!(await counter.isVisible({ timeout: 20_000 }).catch(() => false))) {
      results.push({ surface: "flipchart", id: `L${lesson}`, viewport: vp.name, note: "no counter" });
      continue;
    }
    await settle(page);
    const count = Number((await counter.textContent())?.match(/de (\d+)/)?.[1] ?? 0);
    for (let s = 0; s < count; s += 1) {
      if (s > 0) {
        await page.getByRole("button", { name: "Lámina siguiente", exact: true }).click();
        await page.waitForFunction((n) => document.querySelector('[data-testid="flipchart-counter"]')?.textContent?.includes(`Hoja ${n} de`), s + 1, { timeout: 10_000 }).catch(() => {});
        await page.waitForTimeout(2600); // Candidate A turn is 2000 ms
        await settle(page);
      }
      const sheet = await page.evaluate(() => document.querySelector('[data-testid="flipchart-stage"] [data-sheet-page], [data-sheet-page]')?.getAttribute("data-sheet-page"));
      await inspect(page, vp, "flipchart", `L${String(lesson).padStart(2, "0")}-h${s + 1}${sheet ? `-p${sheet}` : ""}`, results, shotDir);
    }
  }
}

async function games(page, vp, results, shotDir) {
  // LIVE_GAMES ids in src/routes/cartilla/juego.$gameId.tsx; unknown ids are skipped.
  const ids = ["payaso-chano-ss", "silabas-m", "silabas-o", "silabas-p", "vocal-a", "fonetica-p", "rima-p",
    "palabras-minuto-p", "dibujos-o", "mariposas-p", "completar-palabras", "cow-game-m"];
  for (const id of ids) {
    await page.goto(`${BASE}/cartilla/juego/${id}`, { waitUntil: "domcontentloaded" });
    await settle(page);
    if (await page.getByText("Juego no encontrado").isVisible().catch(() => false)) {
      results.push({ surface: "game", id, viewport: vp.name, note: "not a live game id" });
      continue;
    }
    await page.waitForTimeout(800);
    await inspect(page, vp, "game", id, results, shotDir);
  }
  return ids;
}

const browser = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const results = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const shotDir = path.join(OUT, "screens");
  if (ONLY.has("workbook")) await workbook(page, vp, results, shotDir);
  if (ONLY.has("flipchart")) await flipchart(page, vp, results, shotDir);
  if (ONLY.has("games")) await games(page, vp, results, shotDir);
  await ctx.close();
  console.log(`done ${vp.name}: ${results.filter((r) => r.viewport === vp.name).length} views`);
}
await browser.close();
await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, thresholds: THRESHOLDS, generatedAt: new Date().toISOString(), results }, null, 1));
const views = results.filter((r) => r.records);
console.log(`views=${views.length} images=${views.reduce((n, r) => n + r.images, 0)} flaggedViews=${views.filter((r) => r.flagged).length} notes=${results.filter((r) => r.note).length}`);
