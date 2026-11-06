import { test } from "vitest";
import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createArtReviewServer } from "../art-board-review-server.mjs";

const root = process.cwd();
const group = "DRAW-WB-01-1";
const listen = server => new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve("http://127.0.0.1:" + server.address().port)));
const close = server => new Promise(resolve => server.close(resolve));

test("decisions survive closed/reopened review sessions and uploads remain readable", async () => {
  const storage = await mkdtemp(join(tmpdir(), "gretel-review-test-"));
  const server = createArtReviewServer({ rootDir: root, storageDir: storage });
  let base = await listen(server);
  const api = (p, options) => fetch(base + p, options);
  let state = await (await api("/api/art-review/state")).json();
  assert.deepEqual(state.decisions, {});
  const decision = { status: "accepted", selected_candidate_id: "6d3b36069522", updated_at: "2026-11-05T00:00:00Z" };
  let answer = await api("/api/art-review/decision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group_id: group, decision }) });
  assert.equal(answer.status, 200);
  await close(server);
  const reopened = createArtReviewServer({ rootDir: root, storageDir: storage });
  base = await listen(reopened);
  state = await (await api("/api/art-review/state")).json();
  assert.deepEqual(state.decisions[group], decision);
  const image = await readFile(join(root, "docs", "proofs", "artwork-coverage-2026-10-14", "crops", "FC-003-02.png")).catch(() => Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl+PwAAAABJRU5ErkJggg==", "base64"));
  const png = image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? image : Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl+PwAAAABJRU5ErkJggg==", "base64");
  const upload = await api("/api/art-review/upload?group=" + group + "&name=approved.png", { method: "POST", headers: { "Content-Type": "image/png" }, body: png });
  assert.equal(upload.status, 200, await upload.text().catch(() => ""));
  await close(reopened);
  const last = createArtReviewServer({ rootDir: root, storageDir: storage });
  base = await listen(last);
  state = await (await api("/api/art-review/state")).json();
  assert.ok(state.decisions[group]);
  const undo = await api("/api/art-review/decision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group_id: group, decision: null }) });
  assert.equal(undo.status, 200);
  state = await (await api("/api/art-review/state")).json();
  assert.equal(state.decisions[group], undefined);
  await stat(join(storage, "decisions.previous.json"));
  await stat(join(storage, "history.ndjson"));
  await close(last);
});

test("unknown artwork and invalid uploads are rejected without creating decisions", async () => {
  const storage = await mkdtemp(join(tmpdir(), "gretel-review-invalid-"));
  const server = createArtReviewServer({ rootDir: root, storageDir: storage }), base = await listen(server);
  const response = await fetch(base + "/api/art-review/decision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group_id: "NOT-GRETEL", decision: { status: "accepted" } }) });
  assert.equal(response.status, 400);
  const invalid = await fetch(base + "/api/art-review/upload?group=" + group, { method: "POST", body: Buffer.from("not an image but some fake bytes content") });
  assert.equal(invalid.status, 415);
  await close(server);
});

test("physical page proof images and manifest are served with correct MIME types and skipped decisions persist", async () => {
  const storage = await mkdtemp(join(tmpdir(), "gretel-review-proofs-"));
  const server = createArtReviewServer({ rootDir: root, storageDir: storage }), base = await listen(server);
  const api = (p, options) => fetch(base + p, options);

  // Verify physical proofs manifest
  const manifestRes = await api("/art-board/physical-page-proofs-manifest.json");
  assert.equal(manifestRes.status, 200);
  assert.ok(manifestRes.headers.get("content-type")?.includes("application/json"));
  const manifest = await manifestRes.json();
  assert.ok(manifest["DRAW-WB-01-1"]);
  assert.ok(manifest["DRAW-WB-01-1"].wb_page_proof);
  assert.ok(manifest["DRAW-WB-01-1"].fc_page_proof);
  assert.ok(manifest["DRAW-WB-01-1"].book_zoom);

  // Verify API route for manifest
  const apiManifestRes = await api("/api/art-review/physical-page-proofs-manifest.json");
  assert.equal(apiManifestRes.status, 200);

  // Verify physical proof images return HTTP 200 with image/jpeg
  const wbRes = await api(manifest["DRAW-WB-01-1"].wb_page_proof);
  assert.equal(wbRes.status, 200);
  assert.ok(wbRes.headers.get("content-type")?.includes("image/jpeg"));
  const wbBytes = await wbRes.arrayBuffer();
  assert.ok(wbBytes.byteLength > 1000);

  const fcRes = await api(manifest["DRAW-WB-01-1"].fc_page_proof);
  assert.equal(fcRes.status, 200);
  assert.ok(fcRes.headers.get("content-type")?.includes("image/jpeg"));

  const zoomRes = await api(manifest["DRAW-WB-01-1"].book_zoom);
  assert.equal(zoomRes.status, 200);
  assert.ok(zoomRes.headers.get("content-type")?.includes("image/jpeg"));

  // Verify skipped decision persistence
  const skippedDecision = { status: "skipped", updated_at: "2026-11-06T12:00:00Z" };
  const setSkipped = await api("/api/art-review/decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group_id: group, decision: skippedDecision })
  });
  assert.equal(setSkipped.status, 200);
  await close(server);

  // Reopen server and verify persistence
  const reopened = createArtReviewServer({ rootDir: root, storageDir: storage }), base2 = await listen(reopened);
  const state = await (await fetch(base2 + "/api/art-review/state")).json();
  assert.deepEqual(state.decisions[group], skippedDecision);
  await close(reopened);
});
