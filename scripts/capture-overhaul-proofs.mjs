import { chromium } from "playwright";
import { resolve } from "node:path";
import { copyFileSync, mkdirSync } from "node:fs";

const brainDir = "C:/Users/EJN/.gemini/antigravity/brain/dcbb7348-bfb5-4f98-8105-81e7464bf572";
mkdirSync(brainDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 1. Desktop Review Cockpit
  const pageDesk = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await pageDesk.goto("http://127.0.0.1:5188/art-board/verified-optimized.html", { waitUntil: "networkidle" });
  await pageDesk.waitForTimeout(1000);
  const deskProof = resolve(brainDir, "review-cockpit-physical-proof-desktop-1366.png");
  await pageDesk.screenshot({ path: deskProof, fullPage: false });
  console.log("Captured:", deskProof);

  // 2. Mobile Review Cockpit
  const pageMob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMob.goto("http://127.0.0.1:5188/art-board/verified-optimized.html", { waitUntil: "networkidle" });
  await pageMob.waitForTimeout(1000);
  const mobProof = resolve(brainDir, "review-cockpit-physical-proof-mobile-390.png");
  await pageMob.screenshot({ path: mobProof, fullPage: false });
  console.log("Captured:", mobProof);

  // 3. Workbook Lesson 1 (Grounded, no-wobble motion)
  const pageWb = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await pageWb.goto("http://127.0.0.1:3000/cartilla/leccion/1", { waitUntil: "networkidle" });
  await pageWb.waitForTimeout(1200);
  const wbProof = resolve(brainDir, "workbook-lesson1-grounded-motion-desktop-1366.png");
  await pageWb.screenshot({ path: wbProof, fullPage: false });
  console.log("Captured:", wbProof);

  await browser.close();
}

run().catch(err => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
