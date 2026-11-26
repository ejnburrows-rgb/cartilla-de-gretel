import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkRejectedSource } from "./guard.mjs";

function listJsonFiles(dirPath) {
  if (!existsSync(dirPath)) return [];
  return readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => join(dirPath, e.name))
    .sort();
}

/**
 * Load candidate dialogue lines across both v1 (`src/content/tutor-lines.json`)
 * and v2 (`src/content/tutor-dialogue/*.json`) manifests.
 */
export function loadManifestCatalog(repoRoot) {
  const lines = [];
  const batches = new Map();

  const v1Path = join(repoRoot, "src/content/tutor-lines.json");
  if (existsSync(v1Path)) {
    const v1 = JSON.parse(readFileSync(v1Path, "utf8"));
    let seq = 1;
    for (const [section, list] of [
      ["approved", v1.approved ?? []],
      ["pending", v1.pending ?? []],
    ]) {
      for (const entry of list) {
        const batchId = `v1-lesson-${entry.lesson ?? 0}`;
        const item = {
          format: "v1",
          manifestPath: v1Path,
          section,
          id: entry.lineId,
          batch: batchId,
          seq: seq++,
          lesson: entry.lesson ?? 0,
          role: entry.role,
          text: entry.text ?? entry.intendedText ?? "",
          src: entry.src ?? null,
          visemes: entry.visemes ?? null,
          approval: entry.approval ?? null,
          status: section === "approved" ? "approved" : "scripted",
        };
        lines.push(item);
        if (!batches.has(batchId)) batches.set(batchId, []);
        batches.get(batchId).push(item);
      }
    }
  }

  const v2Dir = join(repoRoot, "src/content/tutor-dialogue");
  for (const filePath of listJsonFiles(v2Dir)) {
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    const entries = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.entries)
        ? parsed.entries
        : [];
    for (const entry of entries) {
      const batchId = entry.batch ?? "v2-default";
      const item = {
        format: "v2",
        manifestPath: filePath,
        id: entry.id,
        batch: batchId,
        seq: entry.seq ?? 0,
        lesson: entry.curriculumRefs?.lesson ?? parsed?.lesson ?? 0,
        role: entry.role,
        text: entry.text ?? "",
        file: entry.file ?? null,
        src: entry.audio?.src ?? null,
        visemes: entry.audio?.visemes ?? null,
        sha256: entry.audio?.sha256 ?? null,
        durationMs: entry.audio?.durationMs ?? null,
        approval: entry.approval ?? null,
        status: entry.status ?? "scripted",
      };
      lines.push(item);
      if (!batches.has(batchId)) batches.set(batchId, []);
      batches.get(batchId).push(item);
    }
  }

  return {
    lines,
    batches: Array.from(batches.entries()).map(([batchId, batchLines]) => ({
      batchId,
      lines: [...batchLines].sort((a, b) => a.seq - b.seq),
    })),
  };
}

function entryWithVisemesV1(entry, visemesPath) {
  const rebuilt = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key === "visemes") continue;
    if (key === "src") {
      rebuilt.src = value;
      rebuilt.visemes = visemesPath;
    } else {
      rebuilt[key] = value;
    }
  }
  if (!("visemes" in rebuilt)) rebuilt.visemes = visemesPath;
  return rebuilt;
}

/**
 * Update manifests ONLY for clips that satisfy ALL three requirements:
 *   1. mapped === true
 *   2. qcPassed === true
 *   3. authorized === true (with explicit non-empty approval reference)
 * Plus permanent rejection guard (never 67-clip ZIP / rec_gretel_* / nina-sordita.mp3).
 */
export function applyAuthorizedManifestUpdates({ repoRoot, updates, dryRun = false }) {
  const applied = [];
  const skipped = [];
  const fileEdits = new Map();

  const eligible = [];
  for (const u of updates) {
    const reasons = [];
    if (u.mapped !== true) reasons.push("not-mapped");
    if (u.qcPassed !== true) reasons.push("qc-failed");
    if (u.authorized !== true || typeof u.approval !== "string" || !u.approval.trim()) {
      reasons.push("not-authorized");
    }
    const rej = checkRejectedSource({
      filePath: u.publicSrc,
      sha256: u.sha256,
      transcript: u.transcript,
    });
    if (rej.rejected) reasons.push(...rej.reasons);
    if (u.publicVisemes && checkRejectedSource({ filePath: u.publicVisemes }).rejected) {
      reasons.push(`Rejected visemes path: ${u.publicVisemes}`);
    }

    if (reasons.length > 0) {
      skipped.push({ lineId: u.lineId ?? "(unmapped)", reasons });
    } else {
      eligible.push(u);
    }
  }

  if (eligible.length === 0) {
    return { applied, skipped, filesModified: [] };
  }

  const catalog = loadManifestCatalog(repoRoot);
  const byId = new Map(catalog.lines.map((l) => [l.id, l]));

  // Group eligible updates by manifest file path
  const updatesByFile = new Map();
  for (const u of eligible) {
    const target = byId.get(u.lineId);
    if (!target) {
      skipped.push({ lineId: u.lineId, reasons: ["lineId-not-found-in-manifest"] });
      continue;
    }
    const list = updatesByFile.get(target.manifestPath) ?? [];
    list.push({ update: u, target });
    updatesByFile.set(target.manifestPath, list);
  }

  for (const [manifestPath, items] of updatesByFile.entries()) {
    const rawText = readFileSync(manifestPath, "utf8");
    const parsed = JSON.parse(rawText);

    if (manifestPath.endsWith("tutor-lines.json")) {
      const approvedList = [...(parsed.approved ?? [])];
      const pendingList = [...(parsed.pending ?? [])];

      for (const { update } of items) {
        const appIdx = approvedList.findIndex((e) => e.lineId === update.lineId);
        if (appIdx !== -1) {
          let updated = {
            ...approvedList[appIdx],
            ...(update.publicSrc ? { src: update.publicSrc } : {}),
            ...(update.approval ? { approval: update.approval } : {}),
          };
          if (update.publicVisemes) {
            updated = entryWithVisemesV1(updated, update.publicVisemes);
          }
          approvedList[appIdx] = updated;
          applied.push({ lineId: update.lineId, manifestPath, action: "updated-approved" });
          continue;
        }

        const pendIdx = pendingList.findIndex((e) => e.lineId === update.lineId);
        if (pendIdx !== -1) {
          const pend = pendingList.splice(pendIdx, 1)[0];
          const cleanText = String(pend.text ?? "")
            .replace(/^\[DRAFT\s+—\s+owner to approve\]\s*/i, "")
            .replace(/\s*\(reuse:\s*[A-Za-zÀ-ÿ0-9_ -]+\)$/i, "")
            .trim();
          approvedList.push({
            lineId: pend.lineId,
            lesson: pend.lesson,
            role: pend.role,
            text: update.authorizedText ?? cleanText,
            src: update.publicSrc,
            ...(update.publicVisemes ? { visemes: update.publicVisemes } : {}),
            emotion: pend.emotion,
            approval: update.approval,
          });
          applied.push({ lineId: update.lineId, manifestPath, action: "promoted-pending" });
        }
      }

      const nextObj = { ...parsed, approved: approvedList, pending: pendingList };
      fileEdits.set(manifestPath, JSON.stringify(nextObj, null, 2) + "\n");
    } else if (Array.isArray(parsed?.entries)) {
      const entries = [...parsed.entries];
      for (const { update } of items) {
        const idx = entries.findIndex((e) => e.id === update.lineId);
        if (idx === -1) continue;
        const prev = entries[idx];
        entries[idx] = {
          ...prev,
          audio: {
            ...(prev.audio ?? {}),
            ...(update.publicSrc ? { src: update.publicSrc } : {}),
            ...(update.sha256 ? { sha256: update.sha256 } : {}),
            ...(typeof update.durationMs === "number" ? { durationMs: update.durationMs } : {}),
            ...(update.publicVisemes ? { visemes: update.publicVisemes } : {}),
          },
          status: "approved",
          approval: update.approval,
        };
        applied.push({ lineId: update.lineId, manifestPath, action: "updated-v2-approved" });
      }
      const nextObj = { ...parsed, entries };
      fileEdits.set(manifestPath, JSON.stringify(nextObj, null, 2) + "\n");
    }
  }

  const filesModified = [];
  if (!dryRun) {
    for (const [manifestPath, content] of fileEdits.entries()) {
      writeFileSync(manifestPath, content);
      filesModified.push(manifestPath);
    }
  }

  return { applied, skipped, filesModified };
}
