import { chromium } from "playwright";
const [, , url, needle, w = "390", h = "844"] = process.argv;
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(6000);
console.log(await p.evaluate((needle) => {
  const img = [...document.images].find((i) => i.src.includes(needle));
  if (!img) return "not found";
  const out = [];
  const r = img.getBoundingClientRect();
  out.push(`img ${img.className} rect ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} nat ${img.naturalWidth}x${img.naturalHeight}`);
  for (let a = img.parentElement; a && a !== document.body; a = a.parentElement) {
    const cs = getComputedStyle(a); const ar = a.getBoundingClientRect();
    out.push(`${a.tagName}.${String(a.className).slice(0, 60)} ov=${cs.overflowX}/${cs.overflowY} clip=${cs.clipPath} rect ${Math.round(ar.left)},${Math.round(ar.top)} ${Math.round(ar.width)}x${Math.round(ar.height)} tf=${cs.transform.slice(0, 30)}`);
  }
  return out.join("\n");
}, needle));
await b.close();
