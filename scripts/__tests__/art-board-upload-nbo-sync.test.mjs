import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { createArtReviewServer, parseCsvLine } from "../art-board-review-server.mjs";

const root = process.cwd();
const listen = server => new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve("http://127.0.0.1:" + server.address().port)));
const close = server => new Promise(resolve => server.close(resolve));

test("POST /api/upload-art normalizes image to 1254x1254 PNG with alpha and updates MASTER-MAPPING and catalog", async () => {
  const storage = await mkdtemp(join(tmpdir(), "gretel-upload-test-"));
  const server = createArtReviewServer({ rootDir: root, storageDir: storage });
  const base = await listen(server);
  const api = (p, options) => fetch(base + p, options);

  try {
    // 1. Create a 300x300 red image with alpha to test resizing/padding to 1254x1254 PNG
    const sampleInput = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 60, g: 120, b: 240, alpha: 0.8 }
      }
    }).png().toBuffer();

    // 2. Upload via POST /api/upload-art for slot WB-S007-OBJ01-UNIFORME-1
    const res = await api("/api/upload-art", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://127.0.0.1:5188"
      },
      body: JSON.stringify({
        slot_id: "WB-S007-OBJ01-UNIFORME-1",
        image_data: sampleInput.toString("base64"),
        file_name: "abrigo-emilio-test.png"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.group_id, "DRAW-WB-03-1");
    assert.equal(data.canonical_target, "public/cartilla/art/optimized/workbook/leccion-1/abrigo.png");
    assert.equal(data.width, 1254);
    assert.equal(data.height, 1254);
    assert.equal(data.format, "PNG");
    assert.equal(data.has_alpha, true);
    assert.equal(data.badge, "[🌟 SUBIDA POR EMILIO]");

    // 3. Inspect the written file on disk
    const writtenAbs = join(root, "public", "cartilla", "art", "optimized", "workbook", "leccion-1", "abrigo.png");
    const writtenMeta = await sharp(writtenAbs).metadata();
    assert.equal(writtenMeta.width, 1254);
    assert.equal(writtenMeta.height, 1254);
    assert.equal(writtenMeta.format, "png");
    assert.equal(writtenMeta.hasAlpha, true);

    // 4. Verify MASTER-MAPPING.csv update
    const csvContent = await readFile(join(root, "docs", "artwork-reconciliation", "mapping", "MASTER-MAPPING.csv"), "utf8");
    const slotLine = csvContent.split(/\r?\n/).find(l => l.startsWith("WB-S007-OBJ01-UNIFORME-1,"));
    assert.ok(slotLine, "Slot row must exist in MASTER-MAPPING.csv");
    const cols = parseCsvLine(slotLine);
    assert.equal(cols[0], "WB-S007-OBJ01-UNIFORME-1");
    assert.equal(cols[4], "DRAW-WB-03-1");
    assert.equal(cols[6], "OPTIMIZED"); // group_status
    assert.equal(cols[7], "OPTIMIZED"); // placement_status
    assert.equal(cols[10], "public/cartilla/art/optimized/workbook/leccion-1/abrigo.png");
    assert.equal(cols[11], "EXISTS");
    assert.equal(cols[14], "yes");

    // 5. Verify catalog update
    const catalog = JSON.parse(await readFile(join(root, "docs", "art-board", "verified-optimized-catalog.json"), "utf8"));
    const abrigoGroup = catalog.groups.find(g => g.group_id === "DRAW-WB-03-1");
    assert.ok(abrigoGroup);
    assert.equal(abrigoGroup.availability, "OPTIMIZED VERSION EXISTS");
    assert.ok(abrigoGroup.candidates.length > 0);
    const topCand = abrigoGroup.candidates[0];
    assert.equal(topCand.is_recommended, true);
    assert.ok(topCand.quality_badge.includes("[🌟 SUBIDA POR EMILIO]"));
    assert.equal(topCand.width, 1254);
    assert.equal(topCand.height, 1254);
    assert.equal(topCand.has_alpha, true);

    // 6. Verify page-layouts.json update
    const pageLayouts = JSON.parse(await readFile(join(root, "src", "data", "page-layouts.json"), "utf8"));
    const p1 = pageLayouts.pages["1"];
    assert.ok(p1);
    const abrigoCell = p1.regions[1].cells.find(c => c.caption === "abrigo");
    assert.ok(abrigoCell);
    assert.equal(abrigoCell.illustrationSrc, "/cartilla/art/optimized/workbook/leccion-1/abrigo.png");

    // 7. Verify sync-to-github endpoint
    const syncRes = await api("/api/sync-to-github", {
      method: "POST",
      headers: { "Origin": "http://127.0.0.1:5188" }
    });
    assert.equal(syncRes.status, 200);
    const syncData = await syncRes.json();
    assert.equal(syncData.success, true);
    assert.equal(syncData.nbo_url, "https://nbo-operations-hub.vercel.app/art-inventory");
    console.log("Sync response:", syncData);

  } finally {
    await close(server);
    await rm(storage, { recursive: true, force: true }).catch(() => {});
  }
});
