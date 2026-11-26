import { chromium } from "playwright";
const [, , url, out, w = "1366", h = "768"] = process.argv;
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(6000);
console.log(await p.evaluate(() => JSON.stringify({ tids: [...new Set([...document.querySelectorAll("[data-testid]")].map((e) => e.dataset.testid))].slice(0, 50), text: document.body.innerText.slice(0, 400), imgs: document.images.length })));
await p.screenshot({ path: out });
await b.close();
