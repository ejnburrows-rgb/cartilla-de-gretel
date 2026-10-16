import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Lesson 3 speaks ONLY with the owner's own original recordings.
 *
 * audio/OWNER-RECORDINGS.md is the authoritative manifest: every Lesson 3
 * audio file on disk AND every /audio/ path wired into
 * src/components/cartilla/Lesson3Audio.tsx must appear in its file-path
 * column. Any unlisted file fails the build.
 *
 * This test also fails the build if the generated "lesson-3-tts" voice
 * string reappears anywhere under src/ or public/.
 */

/** Walk up from this test file until we find the repo root (the directory holding package.json). */
function findRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error("Could not locate the repo root from the test file");
    dir = parent;
  }
}

const ROOT = findRepoRoot();
const MANIFEST = join(ROOT, "audio", "OWNER-RECORDINGS.md");
const OWNER_AUDIO_DIR = join(ROOT, "public", "audio", "owner-lesson-3");
const LESSON3_AUDIO_TSX = join(ROOT, "src", "components", "cartilla", "Lesson3Audio.tsx");

/** Repo-relative path with forward slashes, e.g. "public/audio/owner-lesson-3/p7-instr.mp3". */
function repoRelative(abs: string): string {
  return relative(ROOT, abs).split(sep).join("/");
}

/** Parse the manifest's markdown table and return the file-path column values (trimmed). */
function parseManifestFilePaths(): Set<string> {
  expect(existsSync(MANIFEST), `Owner audio manifest is missing: ${repoRelative(MANIFEST)}`).toBe(true);
  const paths = new Set<string>();
  for (const line of readFileSync(MANIFEST, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed.split("|").map((cell) => cell.trim());
    // cells[0] is the empty string before the first pipe; cells[1] is the file-path column.
    if (cells.length < 3) continue;
    const filePath = cells[1];
    if (!filePath) continue;
    if (/^file\s*path$/i.test(filePath)) continue; // header row
    if (/^[:\-\s]+$/.test(filePath)) continue; // separator row
    paths.add(filePath);
  }
  return paths;
}

/** Collect every *.mp3 under a directory (recursive), as repo-relative paths. */
function collectMp3s(dir: string): string[] {
  const found: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".mp3")) {
        found.push(repoRelative(abs));
      }
    }
  };
  walk(dir);
  return found.sort();
}

/** Extract every string literal starting with /audio/ from source text. */
function extractAudioLiterals(source: string): string[] {
  const literals = new Set<string>();
  const re = /["'`](\/audio\/[^"'`\s]+)["'`]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    literals.add(match[1]);
  }
  return [...literals].sort();
}

/** A /audio/... URL maps to the public/ dir: "/audio/x.mp3" -> "public/audio/x.mp3". */
function publicPathForAudioLiteral(literal: string): string {
  return repoRelative(join(ROOT, "public", literal.replace(/^\/+/, "")));
}

const BINARY_EXTENSIONS = new Set([
  ".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac",
  ".mp4", ".webm", ".mov", ".avi",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp", ".tif", ".tiff",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".pdf", ".zip", ".gz", ".br", ".tar",
  ".bin", ".dat", ".wasm", ".pyc", ".sqlite", ".db",
]);

/** Recursively find files containing `needle`, skipping binary content. Returns repo-relative hits. */
function findTextOccurrences(roots: string[], needle: string): string[] {
  // This test file itself legitimately names the banned string in its assertions.
  const self = fileURLToPath(import.meta.url);
  const hits: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
        walk(abs);
      } else if (entry.isFile()) {
        if (abs === self) continue; // never flag this test file itself
        const lower = entry.name.toLowerCase();
        const dot = lower.lastIndexOf(".");
        if (dot >= 0 && BINARY_EXTENSIONS.has(lower.slice(dot))) continue;
        let buffer: Buffer;
        try {
          buffer = readFileSync(abs);
        } catch {
          continue;
        }
        if (buffer.includes(0)) continue; // binary despite extension
        if (buffer.toString("utf8").includes(needle)) hits.push(repoRelative(abs));
      }
    }
  };
  for (const root of roots) {
    if (existsSync(root)) walk(root);
  }
  return hits.sort();
}

describe("Lesson 3 owner voice authenticity", () => {
  it("lists every owner-lesson-3 mp3 on disk in the owner recordings manifest", () => {
    // An absent or empty owner-audio directory is allowed: it means Lesson 3 is
    // silent (owner recordings pending per audio/OWNER-RECORDINGS.md). Any file
    // that IS present must be manifest-listed.
    if (!existsSync(OWNER_AUDIO_DIR)) return;
    const onDisk = collectMp3s(OWNER_AUDIO_DIR);
    const manifest = parseManifestFilePaths();
    const unlisted = onDisk.filter((file) => !manifest.has(file));
    expect(
      unlisted,
      `These Lesson 3 audio files are NOT listed in audio/OWNER-RECORDINGS.md and must not ship: ${unlisted.join(", ")}`,
    ).toEqual([]);
  });

  it("wires only manifest-listed owner audio in Lesson3Audio.tsx", () => {
    expect(
      existsSync(LESSON3_AUDIO_TSX),
      `Wiring component is missing: ${repoRelative(LESSON3_AUDIO_TSX)}`,
    ).toBe(true);
    const source = readFileSync(LESSON3_AUDIO_TSX, "utf8");
    const literals = extractAudioLiterals(source);
    // Zero /audio/ literals is allowed: it means the wiring is silent (owner
    // recordings pending). Any literal that IS present must be manifest-listed.
    const manifest = parseManifestFilePaths();
    const unlisted = literals
      .map((literal) => ({ literal, repoPath: publicPathForAudioLiteral(literal) }))
      .filter(({ repoPath }) => !manifest.has(repoPath));
    expect(
      unlisted.map(({ literal }) => literal),
      `These audio paths in Lesson3Audio.tsx are NOT listed in audio/OWNER-RECORDINGS.md: ${unlisted
        .map(({ literal }) => literal)
        .join(", ")}`,
    ).toEqual([]);
  });

  it("never ships the generated lesson-3-tts voice", () => {
    const hits = findTextOccurrences([join(ROOT, "src"), join(ROOT, "public")], "lesson-3-tts");
    expect(
      hits,
      `The generated "lesson-3-tts" voice must never return. Found in: ${hits.join(", ")}`,
    ).toEqual([]);
  });
});
