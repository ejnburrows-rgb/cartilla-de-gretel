#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256File } from "./tutor-intake/checksum.mjs";
import { resolveMediaTools } from "./tutor-intake/media.mjs";
import { syncVisemesForAudio } from "./tutor-intake/visemes.mjs";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
const output = join(repoRoot, "src/content/tutor-picture-models.json");
const previous = existsSync(output) ? JSON.parse(readFileSync(output, "utf8")) : {};
const known = new Set(read("src/content/tutor-lines.json").approved.map((entry) => entry.src));
const approved = new Map(read("src/content/picture-name-recordings.json").approved.map((entry) => [
  entry.src,
  entry.key,
]));
const vocabulary = new Map();
for (let lesson = 1; lesson <= 24; lesson += 1) {
  const graph = read(`src/content/tutor-graph/lesson-${String(lesson).padStart(2, "0")}.json`);
  for (const item of graph.items) {
    const src = item.approvedAudioSrc;
    if (!src || known.has(src) || vocabulary.has(src)) continue;
    const key = approved.get(src);
    if (key !== item.text.normalize("NFC").toLocaleLowerCase("es")) continue;
    vocabulary.set(src, item.text);
  }
}

const tools = resolveMediaTools({ repoRoot });
const temporary = mkdtempSync(join(tmpdir(), "gretel-picture-models-"));
try {
  const models = {};
  for (const [src, text] of vocabulary) {
    const audioPath = join(repoRoot, "public", src);
    const sourceSha256 = sha256File(audioPath);
    let cues = previous[src]?.sourceSha256 === sourceSha256 ? previous[src].cues : null;
    if (!cues?.length) {
      const visemesDiskPath = join(temporary, "clip.json");
      await syncVisemesForAudio({ audioPath, publicAudioSrc: src, visemesDiskPath, tools, repoRoot });
      cues = JSON.parse(readFileSync(visemesDiskPath, "utf8")).mouthCues.map((cue) => ({
        start: cue.start,
        end: cue.end,
        shape: cue.value,
      }));
    }
    models[src] = { text, sourceSha256, cues };
  }
  const rows = Object.entries(models).map(([src, model]) => `  ${JSON.stringify(src)}: ${JSON.stringify(model)}`);
  writeFileSync(output, ["{", rows.join(",\n"), "}", ""].join("\n"));
  console.log(`${Object.keys(models).length} distinct approved picture models with Rhubarb cues`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
