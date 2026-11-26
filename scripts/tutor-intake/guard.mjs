import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import {
  REJECTED_PATH_PATTERNS,
  REJECTED_SHA256S,
  REJECTED_TRANSCRIPT_PATTERNS,
  REQUIRED_GITIGNORE_ENTRIES,
  SUPPORTED_MEDIA_EXTENSIONS,
} from "./constants.mjs";
import { resolveFixedSystemBinary } from "./media.mjs";

/**
 * True when a path/filename matches permanently rejected owner-governed sources
 * (the 67-clip ZIP / rec_gretel_* material, nina-sordita.mp3, or TinyWow).
 */
export function isRejectedSourcePath(filePath) {
  if (typeof filePath !== "string") return false;
  return REJECTED_PATH_PATTERNS.some((pattern) => pattern.test(filePath));
}

/** True when a SHA-256 digest belongs to a permanently rejected recording. */
export function isRejectedSourceSha256(sha256) {
  if (typeof sha256 !== "string") return false;
  return REJECTED_SHA256S.has(sha256.trim().toLowerCase());
}

/** True when spoken transcript text contains retired/rejected wording (e.g. "sordita"). */
export function isRejectedTranscript(text) {
  if (typeof text !== "string") return false;
  return REJECTED_TRANSCRIPT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Evaluate all permanent rejection rules against a candidate source.
 * @returns {{ rejected: boolean, reasons: string[] }}
 */
export function checkRejectedSource({ filePath, sha256, transcript } = {}) {
  const reasons = [];
  if (filePath && isRejectedSourcePath(filePath)) {
    reasons.push(
      `Rejected source path "${filePath}" (67-clip ZIP / rec_gretel_* / nina-sordita.mp3 / tinywow are permanently forbidden)`,
    );
  }
  if (sha256 && isRejectedSourceSha256(sha256)) {
    reasons.push(
      `Rejected audio SHA-256 "${sha256}" (matches permanently retired recording such as nina-sordita.mp3)`,
    );
  }
  if (transcript && isRejectedTranscript(transcript)) {
    reasons.push(
      `Rejected transcript wording "${transcript}" (contains retired/rejected term such as "sordita")`,
    );
  }
  if (filePath && extname(filePath).toLowerCase() === ".zip") {
    reasons.push(
      `Rejected archive "${basename(filePath)}": ZIP archives (including Gretel_67_Audio_Lecciones_Listo.zip) are not accepted directly; supply individual/continuous audio or video after quarantine review`,
    );
  }
  return { rejected: reasons.length > 0, reasons };
}

/** Check if a media file extension is supported (MP3, WAV, M4A, or video). */
export function isSupportedMediaFile(filePath) {
  if (typeof filePath !== "string") return false;
  return SUPPORTED_MEDIA_EXTENSIONS.has(extname(filePath).toLowerCase());
}

function safeRealpath(targetPath) {
  const abs = resolve(targetPath);
  if (existsSync(abs)) return realpathSync(abs);
  return abs;
}

/**
 * Ensure the private originals directory lives strictly outside the repository
 * so raw recordings can never be committed.
 */
export function assertPrivateDirOutsideRepo(privateDir, repoRoot) {
  const resolvedPrivate = safeRealpath(privateDir);
  const resolvedRepo = safeRealpath(repoRoot);
  const relFromRepo = relative(resolvedRepo, resolvedPrivate);
  const relToRepo = relative(resolvedPrivate, resolvedRepo);

  const insideRepo =
    relFromRepo === "" || (!relFromRepo.startsWith("..") && !isAbsolute(relFromRepo));
  const enclosesRepo = relToRepo === "" || (!relToRepo.startsWith("..") && !isAbsolute(relToRepo));

  if (insideRepo || enclosesRepo) {
    throw new Error(
      `Private voice directory "${resolvedPrivate}" must be outside repository "${resolvedRepo}" (use ~/GretelVoicePrivate/)`,
    );
  }
  return resolvedPrivate;
}

/**
 * Enforce owner-only permissions (`0o700` on directories, `0o600` on files) inside
 * the private voice vault (e.g. `~/GretelVoicePrivate/`), adopted from PR #1323.
 */
export function enforcePrivatePermissions(privateDir, filePaths = []) {
  if (process.platform === "win32") return { applied: false, dirs: [], files: [] };
  const resolvedPrivate = safeRealpath(privateDir);
  const dirsToTighten = new Set([resolvedPrivate, join(resolvedPrivate, "originals")]);
  const filesToTighten = new Set([join(resolvedPrivate, "index.json")]);

  for (const fp of filePaths) {
    if (!fp) continue;
    const absFile = resolve(fp);
    filesToTighten.add(absFile);
    let cur = dirname(absFile);
    while (cur && cur.startsWith(resolvedPrivate) && cur !== dirname(cur)) {
      dirsToTighten.add(cur);
      if (cur === resolvedPrivate) break;
      cur = dirname(cur);
    }
  }

  const tightenedDirs = [];
  const tightenedFiles = [];
  for (const dir of dirsToTighten) {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
      chmodSync(dir, 0o700);
      tightenedDirs.push(dir);
    }
  }
  for (const file of filesToTighten) {
    if (existsSync(file) && statSync(file).isFile()) {
      chmodSync(file, 0o600);
      tightenedFiles.push(file);
    }
  }
  return { applied: true, dirs: tightenedDirs, files: tightenedFiles };
}

/** Verify `.gitignore` excludes private voice directories. */
export function verifyGitignorePrivateExclusions(repoRoot) {
  const gitignorePath = join(repoRoot, ".gitignore");
  if (!existsSync(gitignorePath)) {
    return {
      ok: false,
      missing: [...REQUIRED_GITIGNORE_ENTRIES],
      errors: [".gitignore does not exist"],
    };
  }
  const lines = readFileSync(gitignorePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const lineSet = new Set(lines);
  const missing = REQUIRED_GITIGNORE_ENTRIES.filter((entry) => !lineSet.has(entry));
  return {
    ok: missing.length === 0,
    missing,
    errors:
      missing.length > 0
        ? [`Missing private voice .gitignore exclusion(s): ${missing.join(", ")}`]
        : [],
  };
}

function listJsonFiles(dirPath) {
  if (!existsSync(dirPath)) return [];
  const results = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const full = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...listJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Repository guard validating:
 * 1. `.gitignore` excludes private voice directories.
 * 2. No private voice directory or raw private originals exist inside the repo.
 * 3. No tutor manifest (v1 or v2) references rejected paths or SHA-256s.
 */
export function validateIntakeRepositoryGuard(repoRoot) {
  const errors = [];
  const warnings = [];

  const gitignoreResult = verifyGitignorePrivateExclusions(repoRoot);
  errors.push(...gitignoreResult.errors);

  const forbiddenRepoDirs = ["GretelVoicePrivate", ".gretel-voice-private", "public/audio/private"];
  for (const rel of forbiddenRepoDirs) {
    if (existsSync(join(repoRoot, rel))) {
      errors.push(`Forbidden private voice directory present inside repo: ${rel}`);
    }
  }

  // Check tracked git files if inside a git repository
  const gitBin = resolveFixedSystemBinary("git", { repoRoot });
  if (!gitBin) {
    warnings.push("git binary not found in fixed system paths; skipped tracked-file check");
  } else {
    try {
      const tracked = execFileSync(gitBin, ["ls-files", "-z"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      })
        .split("\0")
        .filter(Boolean);

      for (const file of tracked) {
        if (/(?:^|\/)(?:GretelVoicePrivate|\.gretel-voice-private)(?:\/|$)/i.test(file)) {
          errors.push(`Tracked private voice file in git: ${file}`);
        }
        if (file.startsWith("public/audio/voz/tutor/")) {
          if (isRejectedSourcePath(file)) {
            errors.push(`Tracked rejected audio source under tutor dir: ${file}`);
          }
          const ext = extname(file).toLowerCase();
          if (ext && ext !== ".mp3" && !file.endsWith(".visemes.json")) {
            errors.push(`Non-runtime media file tracked under public/audio/voz/tutor/: ${file}`);
          }
        }
      }
    } catch {
      warnings.push("git ls-files unavailable; skipped tracked-file check");
    }
  }

  // Validate v1 manifest if present
  const v1ManifestPath = join(repoRoot, "src/content/tutor-lines.json");
  if (existsSync(v1ManifestPath)) {
    try {
      const v1 = JSON.parse(readFileSync(v1ManifestPath, "utf8"));
      for (const entry of v1.approved ?? []) {
        const check = checkRejectedSource({
          filePath: entry?.src,
          sha256: entry?.sha256,
          transcript: entry?.text,
        });
        if (check.rejected) {
          errors.push(`${v1ManifestPath} (${entry?.lineId}): ${check.reasons.join("; ")}`);
        }
        if (entry?.visemes && isRejectedSourcePath(entry.visemes)) {
          errors.push(
            `${v1ManifestPath} (${entry?.lineId}): rejected visemes path ${entry.visemes}`,
          );
        }
      }
      for (const entry of v1.pending ?? []) {
        if (entry?.src) {
          errors.push(
            `${v1ManifestPath} (${entry?.lineId}): pending entry must not carry active src`,
          );
        }
      }
    } catch (err) {
      errors.push(`Cannot parse ${v1ManifestPath}: ${err.message}`);
    }
  }

  // Validate v2 manifests if present
  const v2Dir = join(repoRoot, "src/content/tutor-dialogue");
  for (const file of listJsonFiles(v2Dir)) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8"));
      const entries = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.entries)
          ? parsed.entries
          : Array.isArray(parsed?.lines)
            ? parsed.lines
            : [];
      for (const entry of entries) {
        const src = entry?.audio?.src ?? entry?.src ?? entry?.file;
        const sha = entry?.audio?.sha256 ?? entry?.sha256;
        const visemes = entry?.audio?.visemes ?? entry?.visemes;
        const active = entry?.status === "approved" || entry?.status === "validated";
        if (active && src) {
          const check = checkRejectedSource({
            filePath: src,
            sha256: sha,
            transcript: entry?.text,
          });
          if (check.rejected) {
            errors.push(`${file} (${entry?.id ?? "unknown"}): ${check.reasons.join("; ")}`);
          }
        }
        if (active && visemes && isRejectedSourcePath(visemes)) {
          errors.push(`${file} (${entry?.id ?? "unknown"}): rejected visemes path ${visemes}`);
        }
      }
    } catch (err) {
      errors.push(`Cannot parse ${file}: ${err.message}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    gitignoreOk: gitignoreResult.ok,
  };
}
