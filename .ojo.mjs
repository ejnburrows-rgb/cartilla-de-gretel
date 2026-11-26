import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
p.on("console", (m) => m.text().startsWith("ANC") && console.log(m.text()));
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
    const pa = getComputedStyle(el, "::after"), pb = getComputedStyle(el, "::before");
    let s = `${" ".repeat(d)}[after:${pa.content} bg=${pa.backgroundColor} ${pa.backgroundImage.slice(0,40)}] [before:${pb.content} bg=${pb.backgroundColor}] blend=${cs.mixBlendMode} `;
    s += `${el.tagName}.${String(el.className?.baseVal ?? el.className).slice(0, 50)} ${Math.round(r.width)}x${Math.round(r.height)} op=${cs.opacity} vis=${cs.visibility} disp=${cs.display}`;
    s += ` tf=${cs.transform.slice(0,40)} clip=${cs.clipPath} filt=${cs.filter} anim=${cs.animationName} mask=${cs.maskImage?.slice(0,30)} objpos=${cs.objectPosition}`;
    if (el.tagName === "IMG") s += ` src=${el.currentSrc} nat=${el.naturalWidth}x${el.naturalHeight} complete=${el.complete}`;
    if (el.tagName === "image") s += ` href=${el.getAttribute("href")}`;
    return [s, ...[...el.children].flatMap((c) => walk(c, d + 1))];
  };
  const im = btn.querySelector("img"); const rr = im.getBoundingClientRect(); const top = document.elementFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2); const stack = [...document.querySelectorAll("body *")].filter((e) => { const q = e.getBoundingClientRect(); const c = getComputedStyle(e); return q.left <= rr.left + 80 && q.right >= rr.left + 80 && q.top <= rr.top + 60 && q.bottom >= rr.top + 60 && c.pointerEvents === "none" && !btn.contains(e); }).map((e) => `${e.tagName}.${String(e.className?.baseVal ?? e.className).slice(0, 40)} svg=${e.ownerSVGElement?.getAttribute("data-testid") || e.ownerSVGElement?.getAttribute("class") || e.closest("[data-testid]")?.dataset.testid} fill=${e.getAttribute?.("fill")} op=${getComputedStyle(e).opacity} z=${getComputedStyle(e).zIndex} bg=${getComputedStyle(e).backgroundColor}`);
  const cv = document.createElement("canvas"); cv.width = 64; cv.height = 31; const cx = cv.getContext("2d"); cx.drawImage(im, 0, 0, 64, 31); const d = cx.getImageData(0, 0, 64, 31).data; let op = 0, dark = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 20) op++; if (d[i + 3] > 20 && d[i] < 200) dark++; }
  return walk(btn).join("\n") + `\nPE-NONE OVER: ${stack.join(" ; ")}\nTOP=${top.tagName}.${top.className} opaque=${op} dark=${dark} of ${64 * 31}`;
}));
await p.evaluate(async () => { const im = [...document.images].find((i) => i.src.includes("ojo.png")); try { await im.decode(); return "decoded"; } catch (e) { return "decode failed " + e.message; } }).then(console.log);
await p.waitForTimeout(4000);
await p.locator("button.fp-ix-cell").nth(12).screenshot({ path: "/tmp/w/ojocell.png" });
await p.evaluate(() => { const im = [...document.images].find((i) => i.src.includes("ojo.png")); const c = im.cloneNode(); c.style.cssText = "position:fixed;left:0;top:0;width:300px;height:150px;z-index:99999;background:#fff"; document.body.appendChild(c); const anc = []; for (let a = im.parentElement; a; a = a.parentElement) { const s = getComputedStyle(a); if (s.contentVisibility !== "visible" || s.contain !== "none" || s.willChange !== "auto" || s.isolation !== "auto") anc.push(a.tagName + "." + String(a.className).slice(0, 40) + " cv=" + s.contentVisibility + " contain=" + s.contain + " wc=" + s.willChange); } console.log("ANC", anc.join(" | ")); });
await p.screenshot({ path: "/tmp/w/ojoclone.png", clip: { x: 0, y: 0, width: 320, height: 160 } });
await p.waitForTimeout(500);
await p.locator("button.fp-ix-cell").nth(12).screenshot({ path: "/tmp/w/ojocell2.png" });
await b.close();
