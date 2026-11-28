import { createHash, randomBytes } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { APPROVED_ORIGINAL_MASTER_SHA256 } from "./constants.mjs";
import {
  assertPrivateDirOutsideRepo,
  checkRejectedSource,
  isSupportedMediaFile,
} from "./guard.mjs";

export function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function sha256File(filePath) {
  return sha256Buffer(readFileSync(filePath));
}

function indexFilePath(privateDir) {
  return join(privateDir, "index.json");
}

export function loadPrivateIndex(privateDir) {
  const idxPath = indexFilePath(privateDir);
  if (!existsSync(idxPath)) {
    return { version: 1, bySha256: {} };
  }
  const parsed = JSON.parse(readFileSync(idxPath, "utf8"));
  return {
    version: parsed?.version ?? 1,
    bySha256: parsed?.bySha256 && typeof parsed.bySha256 === "object" ? parsed.bySha256 : {},
  };
}

export function savePrivateIndex(privateDir, index) {
  mkdirSync(privateDir, { recursive: true });
  writeFileSync(indexFilePath(privateDir), JSON.stringify(index, null, 2) + "\n");
}

function sanitizeFilename(name) {
  return name.replace(/[^A-Za-z0-9._-]+/g, "_");
}

/**
 * Compute SHA-256, enforce permanent rejection & format rules, deduplicate,
 * and store a private copy outside the repo in `privateDir` (~/GretelVoicePrivate/).
 */
export function ingestPrivateOriginal({
  sourcePath,
  privateDir,
  repoRoot,
  batchId = "default",
  dryRun = false,
  transcriptHint,
}) {
  const absSource = resolve(sourcePath);
  if (!existsSync(absSource)) {
    throw new Error(`Input media file does not exist: ${absSource}`);
  }
  const safePrivateDir = assertPrivateDirOutsideRepo(privateDir, repoRoot);

  // Check path/archive rejection first before hashing large disallowed zips
  const preCheck = checkRejectedSource({ filePath: absSource, transcript: transcriptHint });
  if (preCheck.rejected) {
    return {
      accepted: false,
      status: "rejected",
      reasons: preCheck.reasons,
      sourcePath: absSource,
      sha256: null,
      approvedOriginalMaster: false,
      bytes: statSync(absSource).size,
      privateOriginalPath: null,
      dedupStatus: "rejected",
    };
  }

  if (!isSupportedMediaFile(absSource)) {
    const ext = extname(absSource).toLowerCase() || "(none)";
    return {
      accepted: false,
      status: "unsupported-format",
      reasons: [
        `Unsupported media extension "${ext}" for "${basename(absSource)}"; supported: MP3, WAV, M4A, and video (.mp4, .mov, .mkv, .webm, .avi, .m4v)`,
      ],
      sourcePath: absSource,
      sha256: null,
      approvedOriginalMaster: false,
      bytes: statSync(absSource).size,
      privateOriginalPath: null,
      dedupStatus: "rejected",
    };
  }

  const sha256 = sha256File(absSource);
  const approvedOriginalMaster = sha256 === APPROVED_ORIGINAL_MASTER_SHA256;
  const bytes = statSync(absSource).size;

  const hashCheck = checkRejectedSource({
    filePath: absSource,
    sha256,
    transcript: transcriptHint,
  });
  if (hashCheck.rejected) {
    return {
      accepted: false,
      status: "rejected",
      reasons: hashCheck.reasons,
      sourcePath: absSource,
      sha256,
      approvedOriginalMaster,
      bytes,
      privateOriginalPath: null,
      dedupStatus: "rejected",
    };
  }

  const index = loadPrivateIndex(safePrivateDir);
  const existing = index.bySha256[sha256];
  if (existing && existing.privateOriginalPath && existsSync(existing.privateOriginalPath)) {
    return {
      accepted: true,
      status: "deduplicated",
      reasons: [],
      sourcePath: absSource,
      sha256,
      approvedOriginalMaster,
      bytes,
      privateOriginalPath: existing.privateOriginalPath,
      dedupStatus: "duplicate",
      firstSeenBatchId: existing.batchId,
    };
  }

  const targetDir = join(safePrivateDir, "originals", sanitizeFilename(batchId));
  const targetPath = join(
    targetDir,
    `${sha256.slice(0, 12)}-${sanitizeFilename(basename(absSource))}`,
  );

  if (!dryRun) {
    mkdirSync(targetDir, { recursive: true, mode: 0o700 });
    copyFileSync(absSource, targetPath);
    index.bySha256[sha256] = {
      sha256,
      approvedOriginalMaster,
      bytes,
      batchId,
      originalFilename: basename(absSource),
      privateOriginalPath: targetPath,
      ingestedAt: new Date().toISOString(),
    };
    savePrivateIndex(safePrivateDir, index);
  }

  return {
    accepted: true,
    status: dryRun ? "dry-run-new" : "stored",
    reasons: [],
    sourcePath: absSource,
    sha256,
    approvedOriginalMaster,
    bytes,
    privateOriginalPath: targetPath,
    dedupStatus: "new",
  };
}

/**
 * Create a unique per-pass review directory inside the private vault
 * (`<sha12>-<timestamp>-<rand>`) so repeated intake runs preserve prior
 * listening-review evidence without overwriting (adopted from PR #1323).
 */
export function createPrivateReviewPassDir({
  privateDir,
  repoRoot,
  sha256 = null,
  dryRun = false,
} = {}) {
  const safePrivateDir = assertPrivateDirOutsideRepo(privateDir, repoRoot);
  const sha12 =
    typeof sha256 === "string" && sha256.length >= 12
      ? sha256.slice(0, 12).toLowerCase()
      : "000000000000";
  const iso = new Date().toISOString();
  const timestamp = `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}${iso.slice(17, 19)}`;
  const rand = randomBytes(4).toString("hex");
  const passName = `${sha12}-${timestamp}-${rand}`;
  const reviewDir = join(safePrivateDir, "reviews", passName);

  if (!dryRun) {
    mkdirSync(reviewDir, { recursive: true, mode: 0o700 });
  }
  return {
    reviewDir,
    passName,
    created: !dryRun,
  };
}
