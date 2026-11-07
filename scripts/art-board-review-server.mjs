// Existing Gretel artwork gallery: durable, local-only review storage.
// Canonical asset sync, 1254x1254 PNG normalization, and GitHub / NBO Operations Hub integration.
import { createServer } from "node:http";
import { readFile, writeFile, rename, mkdir, copyFile, appendFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const execPromise = promisify(exec);

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_STORAGE = join(homedir(), "Cartilla-Gretel", "art-review");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".ico": "image/x-icon"
};
const json = value => JSON.stringify(value);
const safeId = id => typeof id === "string" && /^[A-Za-z0-9_-]{3,90}$/.test(id);

let sharpModule = null;
async function getSharp() {
  if (!sharpModule) {
    const mod = await import("sharp");
    sharpModule = mod.default || mod;
  }
  return sharpModule;
}

export function parseCsvLine(text) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

export function serializeCsvLine(fields) {
  return fields
    .map(f => {
      if (typeof f !== "string") f = String(f ?? "");
      if (f.includes(",") || f.includes('"') || f.includes("\n") || f.includes("\r")) {
        return '"' + f.replace(/"/g, '""') + '"';
      }
      return f;
    })
    .join(",");
}

const send = (res, status, obj, origin) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin === "null" ? "*" : origin;
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  res.writeHead(status, headers);
  res.end(json(obj));
};

const validDecision = value =>
  value === null ||
  (value &&
    typeof value === "object" &&
    ["accepted", "declined", "skipped", "pending"].includes(value.status) &&
    (!value.selected_candidate_id || (typeof value.selected_candidate_id === "string" && value.selected_candidate_id.length < 160)) &&
    (!value.upload_url || (typeof value.upload_url === "string" && /^\/api\/art-review\/uploads\/[a-zA-Z0-9_.-]+$/.test(value.upload_url))));

async function readBody(req, max = 50_000_000) {
  const chunks = [];
  let count = 0;
  for await (const piece of req) {
    count += piece.length;
    if (count > max) {
      const error = new Error("File exceeds allowed size");
      error.status = 413;
      throw error;
    }
    chunks.push(piece);
  }
  return Buffer.concat(chunks);
}

function within(folder, relative) {
  const abs = resolve(folder, relative);
  return abs === resolve(folder) || abs.startsWith(resolve(folder) + sep) ? abs : null;
}

export async function updateMasterMappingCsv(rootDir, groupId, slotId, canonicalTarget) {
  const mappingCsvPath = join(rootDir, "docs", "artwork-reconciliation", "mapping", "MASTER-MAPPING.csv");
  const raw = await readFile(mappingCsvPath, "utf8");
  const lines = raw.split(/\r?\n/);
  let updatedCount = 0;
  const newLines = lines.map((line, idx) => {
    if (idx === 0 || !line.trim()) return line;
    const cols = parseCsvLine(line);
    const rowSlotId = cols[0];
    const rowGroupId = cols[4];
    const match = (slotId && rowSlotId === slotId) || (groupId && rowGroupId === groupId);
    if (match) {
      cols[6] = "OPTIMIZED"; // group_status
      cols[7] = "OPTIMIZED"; // placement_status
      cols[10] = canonicalTarget; // destination_path
      cols[11] = "EXISTS"; // destination_verified
      cols[12] = "1254x1254 PNG with alpha transparency approved by owner";
      cols[14] = "yes"; // exact_placement_match_verified
      updatedCount++;
      return serializeCsvLine(cols);
    }
    return line;
  });
  await writeFile(mappingCsvPath, newLines.join("\n"), "utf8");
  return updatedCount;
}

export async function updateCatalogJson(rootDir, groupId, canonicalTarget, formattedBuffer, sha256) {
  const boardPath = join(rootDir, "docs", "art-board", "verified-optimized-catalog.json");
  const raw = await readFile(boardPath, "utf8");
  const catalog = JSON.parse(raw);
  const grp = catalog.groups.find(g => g.group_id === groupId);
  if (!grp) return null;
  grp.availability = "OPTIMIZED VERSION EXISTS";
  grp.canonical_target = canonicalTarget;
  const newCandId = "emilio-" + sha256.slice(0, 12);
  const candWebUrl = "/" + canonicalTarget.replace(/^public\//, "");
  const newCand = {
    sha256,
    id: newCandId,
    web_url: candWebUrl,
    offline_url: candWebUrl,
    width: 1254,
    height: 1254,
    format: "PNG",
    has_alpha: true,
    mode: "RGBA",
    bytes: formattedBuffer.length,
    kb: Math.round(formattedBuffer.length / 1024),
    source_tag: "Subida por Emilio",
    original_path: canonicalTarget,
    note: "Imagen oficial aprobada y sincronizada por Emilio",
    priority: 1,
    quality_score: 3000.0,
    is_recommended: true,
    quality_badge: "[🌟 SUBIDA POR EMILIO] (1254×1254 PNG · Fondo transparente)",
    quality_advice: "Imagen oficial aprobada y sincronizada directamente."
  };
  if (Array.isArray(grp.candidates)) {
    grp.candidates.forEach(c => {
      c.is_recommended = false;
    });
    grp.candidates.unshift(newCand);
  } else {
    grp.candidates = [newCand];
  }
  await writeFile(boardPath, JSON.stringify(catalog, null, 2), "utf8");
  return { newCand, catalog };
}

export async function updatePageLayoutsJson(rootDir, groupRawLabel, canonicalTarget) {
  const plPath = join(rootDir, "src", "data", "page-layouts.json");
  try {
    const raw = await readFile(plPath, "utf8");
    const pl = JSON.parse(raw);
    let updated = false;
    const relUrl = "/" + canonicalTarget.replace(/^public\//, "");
    const targetLabel = (groupRawLabel || "").toLowerCase().trim();
    if (pl.pages && targetLabel) {
      for (const p of Object.values(pl.pages)) {
        if (!p || !Array.isArray(p.regions)) continue;
        for (const reg of p.regions) {
          if (!Array.isArray(reg.cells)) continue;
          for (const cell of reg.cells) {
            if (cell.caption && (cell.caption.toLowerCase() === targetLabel || targetLabel.includes(cell.caption.toLowerCase()))) {
              cell.illustrationSrc = relUrl;
              updated = true;
            }
          }
        }
      }
    }
    if (updated) {
      await writeFile(plPath, JSON.stringify(pl, null, 2), "utf8");
    }
    return updated;
  } catch (err) {
    return false;
  }
}

export function createArtReviewServer({ rootDir = DEFAULT_ROOT, storageDir = DEFAULT_STORAGE } = {}) {
  const stateFile = join(storageDir, "decisions.json"),
    historyFile = join(storageDir, "history.ndjson"),
    uploads = join(storageDir, "uploads");
  const boardPath = join(rootDir, "docs", "art-board", "verified-optimized-catalog.json");
  let mutations = Promise.resolve(),
    groupsPromise;

  async function groups() {
    if (!groupsPromise) groupsPromise = readFile(boardPath, "utf8").then(t => new Set(JSON.parse(t).groups.map(g => g.group_id)));
    return groupsPromise;
  }
  async function state() {
    try {
      const v = JSON.parse(await readFile(stateFile, "utf8"));
      if (!v || typeof v.decisions !== "object" || !v.decisions || Array.isArray(v.decisions)) throw Error("Damaged review state");
      return v;
    } catch (e) {
      if (e.code === "ENOENT") return { version: 1, decisions: {}, updated_at: null };
      throw e;
    }
  }
  async function persist(next, action) {
    await mkdir(storageDir, { recursive: true });
    const temp = join(storageDir, "decisions-" + process.pid + "-" + Date.now() + ".tmp");
    await writeFile(temp, json(next), "utf8");
    try {
      await copyFile(stateFile, join(storageDir, "decisions.previous.json"));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    await rename(temp, stateFile);
    await appendFile(historyFile, json({ time: new Date().toISOString(), action }) + "\n", "utf8");
  }
  function change(fn) {
    const job = mutations.then(fn);
    mutations = job.catch(() => {});
    return job;
  }
  async function serveFile(res, root, relative) {
    const file = within(root, relative);
    if (!file) {
      send(res, 403, { error: "Blocked path" });
      return;
    }
    try {
      const data = await readFile(file),
        extension = extname(file).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[extension] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      res.end(data);
    } catch (e) {
      send(res, e.code === "ENOENT" ? 404 : 500, { error: e.code === "ENOENT" ? "File not found" : "Cannot read file" });
    }
  }

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1"),
        path = url.pathname,
        method = req.method;
      const origin = req.headers.origin;

      if (method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": origin === "null" ? "*" : (origin || "*"),
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store"
        });
        res.end();
        return;
      }

      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        if (origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin) && origin !== "null") {
          send(res, 403, { error: "Local access only" }, origin);
          return;
        }
      }

      if (path === "/api/art-review/state" && method === "GET") {
        send(res, 200, await state(), origin);
        return;
      }

      if (path === "/api/art-review/decision" && method === "POST") {
        const payload = JSON.parse((await readBody(req, 100_000)).toString("utf8"));
        if (!safeId(payload.group_id) || !(await groups()).has(payload.group_id) || !validDecision(payload.decision)) {
          send(res, 400, { error: "Invalid review entry" }, origin);
          return;
        }
        const saved = await change(async () => {
          const s = await state();
          if (payload.decision === null) delete s.decisions[payload.group_id];
          else s.decisions[payload.group_id] = payload.decision;
          s.updated_at = new Date().toISOString();
          await persist(s, { kind: "decision", id: payload.group_id, value: payload.decision });
          return s.updated_at;
        });
        send(res, 200, { saved: true, updated_at: saved }, origin);
        return;
      }

      if (path === "/api/art-review/migrate" && method === "POST") {
        const body = JSON.parse((await readBody(req, 1_000_000)).toString("utf8"));
        if (!body || typeof body.decisions !== "object" || Array.isArray(body.decisions)) {
          send(res, 400, { error: "Invalid migration" }, origin);
          return;
        }
        const result = await change(async () => {
          const s = await state(),
            allowed = await groups();
          let imported = 0;
          for (const [id, d] of Object.entries(body.decisions || {})) {
            if (allowed.has(id) && !(id in s.decisions) && validDecision(d) && d !== null) {
              s.decisions[id] = d;
              imported++;
            }
          }
          if (imported) {
            s.updated_at = new Date().toISOString();
            await persist(s, { kind: "legacy-migration", imported });
          }
          return { saved: true, imported, existing: Object.keys(s.decisions).length };
        });
        send(res, 200, result, origin);
        return;
      }

      // --- CANONICAL ARTWORK UPLOAD & RESIZE ENGINE (1254x1254 PNG with alpha) ---
      if ((path === "/api/upload-art" || path === "/api/art-review/upload-art") && method === "POST") {
        const contentType = req.headers["content-type"] || "";
        let groupId = url.searchParams.get("group") || url.searchParams.get("group_id");
        let slotId = url.searchParams.get("slot") || url.searchParams.get("slot_id");
        let fileName = url.searchParams.get("name") || "uploaded-art.png";
        let rawBuffer = null;

        if (contentType.includes("application/json")) {
          const body = JSON.parse((await readBody(req, 50_000_000)).toString("utf8"));
          if (body.group_id) groupId = body.group_id;
          if (body.slot_id) slotId = body.slot_id;
          if (body.file_name) fileName = body.file_name;
          if (body.image_data) {
            const b64 = String(body.image_data).replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, "");
            rawBuffer = Buffer.from(b64, "base64");
          }
        } else {
          rawBuffer = await readBody(req, 50_000_000);
        }

        if (!rawBuffer || rawBuffer.length < 32) {
          send(res, 400, { error: "No image data provided" }, origin);
          return;
        }

        // Resolve groupId from slotId if needed
        const catalogRaw = await readFile(boardPath, "utf8");
        const catalog = JSON.parse(catalogRaw);
        let targetGroup = null;

        if (groupId) {
          targetGroup = catalog.groups.find(g => g.group_id === groupId);
        }
        if (!targetGroup && slotId) {
          targetGroup = catalog.groups.find(g => Array.isArray(g.placements) && g.placements.includes(slotId));
          if (!targetGroup) {
            // Check in MASTER-MAPPING.csv
            const mappingCsvPath = join(rootDir, "docs", "artwork-reconciliation", "mapping", "MASTER-MAPPING.csv");
            const csvText = await readFile(mappingCsvPath, "utf8");
            for (const line of csvText.split(/\r?\n/)) {
              if (line.startsWith(slotId + ",")) {
                const parts = parseCsvLine(line);
                const gId = parts[4];
                targetGroup = catalog.groups.find(g => g.group_id === gId);
                break;
              }
            }
          }
        }

        if (!targetGroup) {
          send(res, 400, { error: `No drawing group found matching group: '${groupId}' or slot: '${slotId}'` }, origin);
          return;
        }

        groupId = targetGroup.group_id;

        // Process with sharp: format strictly to 1254x1254 PNG with alpha transparency
        const sharp = await getSharp();
        const formattedBuffer = await sharp(rawBuffer)
          .ensureAlpha()
          .resize(1254, 1254, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();

        const sha256 = createHash("sha256").update(formattedBuffer).digest("hex");

        // Canonical target destination
        const canonicalTarget =
          targetGroup.canonical_target ||
          `public/cartilla/art/optimized/workbook/leccion-1/${targetGroup.raw_label || targetGroup.label.toLowerCase()}.png`;

        const canonicalAbs = join(rootDir, canonicalTarget);
        await mkdir(dirname(canonicalAbs), { recursive: true });
        await writeFile(canonicalAbs, formattedBuffer);

        // Also write candidate image for offline/online review preview
        const candDir = join(rootDir, "public", "cartilla", "art", "candidates-board");
        await mkdir(candDir, { recursive: true });
        const candFile = sha256.slice(0, 16) + ".png";
        await writeFile(join(candDir, candFile), formattedBuffer);

        // Update MASTER-MAPPING.csv
        const updatedPlacementsCount = await updateMasterMappingCsv(rootDir, groupId, slotId, canonicalTarget);

        // Update verified-optimized-catalog.json
        const catalogUpdate = await updateCatalogJson(rootDir, groupId, canonicalTarget, formattedBuffer, sha256);

        // Update page-layouts.json
        const pageLayoutsUpdated = await updatePageLayoutsJson(rootDir, targetGroup.raw_label || targetGroup.label, canonicalTarget);

        // Persist decision in review storage
        const candId = catalogUpdate ? catalogUpdate.newCand.id : "emilio-" + sha256.slice(0, 12);
        await change(async () => {
          const s = await state();
          s.decisions[groupId] = {
            status: "accepted",
            selected_candidate_id: candId,
            selected_original_path: canonicalTarget,
            canonical_target: canonicalTarget,
            updated_at: new Date().toISOString()
          };
          s.updated_at = new Date().toISOString();
          await persist(s, { kind: "upload-art", id: groupId, candidate: candId, canonical: canonicalTarget });
        });

        send(
          res,
          200,
          {
            success: true,
            group_id: groupId,
            slot_id: slotId || (targetGroup.placements && targetGroup.placements[0]) || null,
            canonical_target: canonicalTarget,
            web_url: "/" + canonicalTarget.replace(/^public\//, ""),
            sha256,
            width: 1254,
            height: 1254,
            format: "PNG",
            has_alpha: true,
            badge: "[🌟 SUBIDA POR EMILIO]",
            updated_placements_count: updatedPlacementsCount,
            page_layouts_updated: pageLayoutsUpdated
          },
          origin
        );
        return;
      }

      // --- GITHUB & NBO OPERATIONS HUB AUTOMATIC REPOSITORY SYNC ---
      if ((path === "/api/sync-to-github" || path === "/api/art-review/sync-to-github") && method === "POST") {
        try {
          const filesToAdd = [
            "public/cartilla/art",
            "docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv",
            "docs/art-board",
            "src/data/page-layouts.json",
            "TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html"
          ];
          const gitEnv = {
            ...process.env,
            GCM_INTERACTIVE: "never",
            GIT_TERMINAL_PROMPT: "0"
          };
          await execPromise(`git add ${filesToAdd.join(" ")}`, { cwd: rootDir, env: gitEnv });
          const diffStaged = (await execPromise("git diff --staged --name-only", { cwd: rootDir, env: gitEnv })).stdout.trim();
          let commitHash = null;
          if (diffStaged) {
            await execPromise('git commit -m "feat(art): sync approved canonical artwork and mapping [skip ci]"', { cwd: rootDir, env: gitEnv });
            const hashRes = await execPromise("git rev-parse --short HEAD", { cwd: rootDir, env: gitEnv });
            commitHash = hashRes.stdout.trim();
          }
          let pushOutput = "";
          let pushSuccess = false;
          try {
            const pushRes = await execPromise("git push origin HEAD", { cwd: rootDir, env: gitEnv, timeout: 30000 });
            pushOutput = (pushRes.stdout || pushRes.stderr || "Push exitoso").trim();
            pushSuccess = true;
          } catch (pErr) {
            pushOutput = (pErr.stderr || pErr.message || "").trim();
          }
          send(
            res,
            200,
            {
              success: true,
              committed: !!commitHash,
              commit: commitHash,
              staged_files: diffStaged ? diffStaged.split("\n") : [],
              pushed: pushSuccess,
              push_output: pushOutput,
              nbo_url: "https://nbo-operations-hub.vercel.app/art-inventory"
            },
            origin
          );
          return;
        } catch (syncErr) {
          send(res, 500, { error: "Sync error: " + (syncErr.stderr || syncErr.message) }, origin);
          return;
        }
      }

      if (path === "/api/art-review/bulk-upload" && method === "POST") {
        const fileName = url.searchParams.get("name") || "bulk-upload.zip";
        const isZip = fileName.toLowerCase().endsWith(".zip") || fileName.toLowerCase().endsWith(".tar");
        const ext = isZip ? ".zip" : ".png";
        const uploadDir = join(rootDir, "public", "cartilla", "art", "owner-intake");
        await mkdir(uploadDir, { recursive: true });
        const tempPath = join(uploadDir, "temp_bulk_upload" + ext);
        const data = await readBody(req, 150_000_000);
        await writeFile(tempPath, data);
        exec(
          `python scripts/bulk-organize-intake.py "${tempPath}" && python scripts/build-side-by-side-decision-board.py`,
          { cwd: rootDir },
          async (err, stdout, stderr) => {
            if (err) {
              console.error("Bulk organize error:", stderr || err.message);
              send(res, 500, { error: "Error organizando imagenes: " + (stderr || err.message) }, origin);
              return;
            }
            const manifestPath = join(uploadDir, "latest-bulk-upload", "bulk-match-manifest.json");
            let items = [];
            try {
              const rawM = await readFile(manifestPath, "utf8");
              items = JSON.parse(rawM);
            } catch (e) {}
            send(res, 200, { success: true, count: items.length, organized: items }, origin);
          }
        );
        return;
      }

      if (path === "/api/art-review/upload" && method === "POST") {
        const id = url.searchParams.get("group"),
          fileName = url.searchParams.get("name") || "replacement";
        if (!safeId(id) || !(await groups()).has(id)) {
          send(res, 400, { error: "Unknown illustration" }, origin);
          return;
        }
        const data = await readBody(req, 20_000_000);
        const png = data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const jpg = data.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
        const webp = data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP";
        if (!(png || jpg || webp) || data.length < 32) {
          send(res, 415, { error: "Upload must be a valid PNG, JPEG or WebP file" }, origin);
          return;
        }
        const ext = png ? ".png" : jpg ? ".jpg" : ".webp",
          sha = createHash("sha256").update(data).digest("hex");
        const name = id + "-" + sha.slice(0, 24) + ext;
        await mkdir(uploads, { recursive: true });
        try {
          await stat(join(uploads, name));
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
          await writeFile(join(uploads, name), data, { flag: "wx" });
        }
        send(res, 200, { saved: true, url: "/api/art-review/uploads/" + name, sha256: sha, original_name: String(fileName).slice(0, 255), bytes: data.length }, origin);
        return;
      }

      if (path.startsWith("/api/art-review/uploads/") && method === "GET") {
        const name = path.split("/").pop();
        if (!/^[A-Za-z0-9_-]+-[a-f0-9]{24}\.(png|jpg|webp)$/.test(name)) {
          send(res, 400, { error: "Invalid attachment" }, origin);
          return;
        }
        await serveFile(res, uploads, name);
        return;
      }

      if (method !== "GET") {
        send(res, 405, { error: "Method not allowed" }, origin);
        return;
      }

      if (path === "/") {
        res.writeHead(302, { Location: "/art-board/verified-optimized.html" });
        res.end();
        return;
      }
      if (path === "/art-board/verified-optimized.html") {
        await serveFile(res, join(rootDir, "docs", "art-board"), "verified-optimized.html");
        return;
      }
      if (path === "/TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html") {
        await serveFile(res, rootDir, "TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html");
        return;
      }
      if (
        path === "/api/art-review/physical-page-proofs-manifest.json" ||
        path === "/art-board/physical-page-proofs-manifest.json" ||
        path === "/docs/art-board/physical-page-proofs-manifest.json"
      ) {
        await serveFile(res, join(rootDir, "docs", "art-board"), "physical-page-proofs-manifest.json");
        return;
      }
      if (path.startsWith("/cartilla/")) {
        await serveFile(res, join(rootDir, "public"), path.slice(1));
        return;
      }
      if (path.startsWith("/art-board/")) {
        await serveFile(res, join(rootDir, "public"), path.slice(1));
        return;
      }
      send(res, 404, { error: "Not found" }, origin);
    } catch (e) {
      send(res, e.status || 500, { error: e.status ? e.message : "Review storage unavailable; decisions were not saved" });
    }
  });
}

const isMain =
  process.argv[1] &&
  (resolve(process.argv[1]).endsWith("art-board-review-server.mjs") ||
    resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase());

if (isMain) {
  const port = Number(process.env.CARTILLA_REVIEW_PORT || 5188);
  const server = createArtReviewServer({
    rootDir: process.env.CARTILLA_REVIEW_ROOT || DEFAULT_ROOT,
    storageDir: process.env.CARTILLA_REVIEW_DATA || DEFAULT_STORAGE
  });
  server.listen(port, "127.0.0.1", () =>
    console.log("Gretel artwork review: http://127.0.0.1:" + port + "/art-board/verified-optimized.html")
  );
}
