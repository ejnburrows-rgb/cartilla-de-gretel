import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const payload = JSON.stringify({ lesson: 3, page: 0 });
  localStorage.setItem("cartilla.learner-resume.v1:3", payload);
  localStorage.setItem("cartilla.learner-resume.v1", payload);
});
await p.goto("http://127.0.0.1:5173/cartilla/leccion/3", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(5000);
console.log(await p.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || b.textContent).trim().startsWith("ojo"));
  if (!btn) return "no ojo button; labels=" + [...document.querySelectorAll("button")].map((b) => b.getAttribute("aria-label")).filter(Boolean).join("|");
  const walk = (el, d = 0) => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    let s = `${" ".repeat(d)}${el.tagName}.${String(el.className?.baseVal ?? el.className).slice(0, 50)} ${Math.round(r.width)}x${Math.round(r.height)} op=${cs.opacity} vis=${cs.visibility} disp=${cs.display}`;
    s += ` tf=${cs.transform.slice(0,40)} clip=${cs.clipPath} filt=${cs.filter} anim=${cs.animationName} mask=${cs.maskImage?.slice(0,30)} objpos=${cs.objectPosition}`;
    if (el.tagName === "IMG") s += ` src=${el.currentSrc} nat=${el.naturalWidth}x${el.naturalHeight} complete=${el.complete}`;
    if (el.tagName === "image") s += ` href=${el.getAttribute("href")}`;
    return [s, ...[...el.children].flatMap((c) => walk(c, d + 1))];
  };
  return walk(btn).join("\n");
}));
await p.locator("button.fp-ix-cell").nth(12).screenshot({ path: "/tmp/w/ojocell.png" });
await b.close();
