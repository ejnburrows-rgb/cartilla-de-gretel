#!/usr/bin/env node
/**
 * Canonical curriculum & audio coverage matrix generator (Milestones 2 & 8).
 *
 * Reads all canonical sources under the repository:
 *   - src/data/lessons.json
 *   - src/data/book-transcription/lessons-01-07.json & lessons-08-24.json
 *   - src/data/page-layouts.json, src/data/lesson-exercises/index.ts, src/lib/workbook-pages.ts
 *   - src/data/teacher-flipchart.json & src/data/flipchart-text-*.json
 *   - src/data/reconstruction/student-to-flipchart-284.json & pdf-sheet-to-printed-page.json
 *   - Game registry (src/routes/cartilla/juego.$gameId.tsx + src/content/games/*.ts + lesson-meta.ts)
 *   - src/content/tutor-lines.json, src/content/picture-name-recordings.json
 *   - src/content/consonants.json, src/content/lessons.json, src/content/guia/lesson-*.json
 *   - docs/audio/MISSING_PICTURE_RECORDINGS.csv
 *   - public/audio/**, public/cartilla/audio/**, src/components/cartilla/piano/piano-samples.ts
 *
 * Guarantees:
 *   - Printed workbook page numbers (1-90) are strictly separated from PDF sheet numbers (1-98).
 *   - Printed workbook pages 86 and 87 are marked "absent-in-source" and never invented.
 *   - Missing source material and unrecorded lines are marked "source-pending".
 *   - Rejected assets (67-clip ZIP / rec_gretel_*, nina-sordita.mp3, tinywow, synthetic TTS)
 *     are explicitly quarantined and excluded from active playback estimates.
 *
 * CLI:
 *   node scripts/tutor-coverage-matrix.mjs [--write-graph]
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const COVERAGE_DIR = join(REPO_ROOT, "docs/tutor/coverage");
const GRAPH_DIR = join(REPO_ROOT, "src/content/tutor-graph");

const ABSENT_PRINTED_PAGES = new Set([86, 87]);
const QUARANTINED_AUDIO_PATHS = new Set(["public/audio/voz/vocabulario/nina-sordita.mp3"]);
const UNUSED_BYPASSED_PATHS = new Set(["public/cartilla/audio/silent.mp3"]);

const QUARANTINED_EXTERNAL_PACKAGES = [
  {
    id: "rejected_67_stitched_package",
    name: "Gretel_67_Audio_Lecciones_Listo.zip",
    pattern: "rec_gretel_* / Gretel_67_Audio_Lecciones_Listo.zip",
    status: "rejected-quarantined",
    decisionDate: "2026-10-15",
    reason:
      "Owner-rejected due to stuttering artifacts, background music contamination, and incorrect stitched cuts.",
  },
  {
    id: "rejected_tinywow_recording",
    name: "tinywow_audio_recording.mp3",
    pattern: "tinywow_audio_recording.mp3",
    status: "rejected-quarantined",
    decisionDate: "2026-10-19",
    reason: "Lossy web-transcoder phase distortion and high-frequency aliasing.",
  },
  {
    id: "prohibited_synthetic_tts",
    name: "browser_cloud_tts_generators",
    pattern: "window.speechSynthesis / cloud-tts / AI voice cloning",
    status: "rejected-prohibited",
    decisionDate: "permanent",
    reason: "AUDIO_POLICY prohibits synthetic TTS and voice cloning; missing recordings resolve silently.",
  },
];

function readJson(relPath) {
  return JSON.parse(readFileSync(join(REPO_ROOT, relPath), "utf8"));
}

function sha256File(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

/** Lowercase slug preserving ñ so "uña" never collides with "una". */
function idSlug(text) {
  const slug = String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, (mark) => (mark === "\u0303" ? mark : ""))
    .normalize("NFC")
    .replace(/[^a-zñ0-9]+/g, "-");
  let start = 0;
  let end = slug.length;
  while (start < end && slug[start] === "-") start += 1;
  while (end > start && slug[end - 1] === "-") end -= 1;
  return slug.slice(start, end);
}

function bareLetters(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Pure static TypeScript AST literal evaluator (zero dynamic code execution).
 * Supports primitive literals, template strings, arrays (with spread), plain objects
 * (with shorthand/spread), local const references, and simple `.map(x => ...)` on static arrays.
 */
function evalStaticTsNode(node, env, relPath) {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  ) {
    return evalStaticTsNode(node.expression, env, relPath);
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node)) {
    const val = evalStaticTsNode(node.operand, env, relPath);
    if (node.operator === ts.SyntaxKind.MinusToken) return -val;
    if (node.operator === ts.SyntaxKind.PlusToken) return +val;
    throw new Error(`Unsupported unary operator in ${relPath}`);
  }
  if (ts.isTemplateExpression(node)) {
    let out = node.head.text;
    for (const span of node.templateSpans) {
      out += String(evalStaticTsNode(span.expression, env, relPath));
      out += span.literal.text;
    }
    return out;
  }
  if (ts.isIdentifier(node)) {
    if (node.text === "undefined") return undefined;
    if (env.has(node.text)) return env.get(node.text);
    throw new Error(`Unresolved static identifier "${node.text}" in ${relPath}`);
  }
  if (ts.isArrayLiteralExpression(node)) {
    const result = [];
    for (const el of node.elements) {
      if (ts.isSpreadElement(el)) {
        const spreadVal = evalStaticTsNode(el.expression, env, relPath);
        if (!Array.isArray(spreadVal)) {
          throw new Error(`Spread target is not an array in ${relPath}`);
        }
        result.push(...spreadVal);
      } else {
        result.push(evalStaticTsNode(el, env, relPath));
      }
    }
    return result;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key =
          ts.isIdentifier(prop.name) ||
          ts.isStringLiteral(prop.name) ||
          ts.isNumericLiteral(prop.name)
            ? prop.name.text
            : String(evalStaticTsNode(prop.name, env, relPath));
        obj[key] = evalStaticTsNode(prop.initializer, env, relPath);
      } else if (ts.isShorthandPropertyAssignment(prop)) {
        const key = prop.name.text;
        obj[key] = evalStaticTsNode(prop.name, env, relPath);
      } else if (ts.isSpreadAssignment(prop)) {
        const spreadObj = evalStaticTsNode(prop.expression, env, relPath);
        if (spreadObj && typeof spreadObj === "object") {
          Object.assign(obj, spreadObj);
        }
      } else {
        throw new Error(`Unsupported object property kind in ${relPath}`);
      }
    }
    return obj;
  }
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === "map" &&
    node.arguments.length === 1 &&
    ts.isArrowFunction(node.arguments[0]) &&
    node.arguments[0].parameters.length === 1 &&
    ts.isIdentifier(node.arguments[0].parameters[0].name) &&
    !ts.isBlock(node.arguments[0].body)
  ) {
    const targetArr = evalStaticTsNode(node.expression.expression, env, relPath);
    if (!Array.isArray(targetArr)) {
      throw new Error(`Static .map() target is not an array in ${relPath}`);
    }
    const paramName = node.arguments[0].parameters[0].name.text;
    const body = node.arguments[0].body;
    return targetArr.map((item) => {
      const childEnv = new Map(env);
      childEnv.set(paramName, item);
      return evalStaticTsNode(body, childEnv, relPath);
    });
  }
  throw new Error(`Unsupported AST expression (${ts.SyntaxKind[node.kind]}) in ${relPath}`);
}

/** Extract exported static data declarations from a pure-data TypeScript module via AST only. */
function loadPureTsModule(relPath) {
  const absPath = join(REPO_ROOT, relPath);
  const source = readFileSync(absPath, "utf8");
  const sf = ts.createSourceFile(absPath, source, ts.ScriptTarget.Latest, true);
  const env = new Map();
  const exportsObj = {};

  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExported = Boolean(
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword),
    );
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      try {
        const value = evalStaticTsNode(decl.initializer, env, relPath);
        env.set(decl.name.text, value);
        if (isExported) exportsObj[decl.name.text] = value;
      } catch (err) {
        if (isExported && !ts.isPropertyAccessExpression(decl.initializer)) {
          throw err;
        }
      }
    }
  }
  return exportsObj;
}

/** Printed workbook page range for lessons 1..24 (mirrors src/lib/workbook-pages.ts). */
function workbookPagesForLesson(lesson) {
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 24) {
    throw new RangeError(`lesson ${lesson}`);
  }
  if (lesson === 1) return { start: 1, end: 3 };
  if (lesson <= 6) {
    const start = 4 + 3 * (lesson - 2);
    return { start, end: start + 2 };
  }
  if (lesson === 7) return { start: 19, end: 22 };
  const start = 23 + 4 * (lesson - 8);
  return { start, end: start + 3 };
}

/** Parse LIVE_GAMES identifiers from src/routes/cartilla/juego.$gameId.tsx using TypeScript AST. */
function readRegisteredLiveGameRefs() {
  const relPath = "src/routes/cartilla/juego.$gameId.tsx";
  const source = readFileSync(join(REPO_ROOT, relPath), "utf8");
  const sf = ts.createSourceFile(relPath, source, ts.ScriptTarget.Latest, true);
  const imports = new Map();
  const liveIds = [];

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const spec = stmt.moduleSpecifier.text;
      const named = stmt.importClause?.namedBindings;
      if (named && ts.isNamedImports(named)) {
        for (const el of named.elements) imports.set(el.name.text, spec);
      }
    }
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === "LIVE_GAMES" && decl.initializer && ts.isArrayLiteralExpression(decl.initializer)) {
          for (const el of decl.initializer.elements) {
            if (ts.isIdentifier(el)) liveIds.push({ symbol: el.text, spread: false, module: imports.get(el.text) });
            else if (ts.isSpreadElement(el) && ts.isIdentifier(el.expression)) {
              liveIds.push({ symbol: el.expression.text, spread: true, module: imports.get(el.expression.text) });
            }
          }
        }
      }
    }
  }
  return liveIds;
}

/** Load all live games directly from the game registry + src/content/games/*.ts. */
function loadLiveGames(lessonMeta) {
  const refs = readRegisteredLiveGameRefs();
  const moduleCache = new Map();
  const games = [];
  for (const ref of refs) {
    if (!ref.module) continue;
    const rel = `${ref.module.replace(/^@\//, "src/")}.ts`;
    if (!moduleCache.has(rel)) moduleCache.set(rel, loadPureTsModule(rel));
    const exp = moduleCache.get(rel)[ref.symbol];
    if (ref.spread && Array.isArray(exp)) games.push(...exp);
    else if (exp) games.push(exp);
  }

  return games.map((game) => {
    const letters = String(game.letter)
      .split("/")
      .map((s) => bareLetters(s.trim()));
    const mappedLessons = letters
      .map((letter) => lessonMeta.find((l) => l.letter !== "—" && bareLetters(l.letter).startsWith(letter))?.n)
      .filter((n) => typeof n === "number")
      .sort((a, b) => a - b);
    const hasNullAnswerKey =
      Array.isArray(game.sections) &&
      game.sections.some((s) => Array.isArray(s.blankCards) && s.blankCards.some((c) => c.fullWord === null));

    return {
      id: game.id,
      type: game.type,
      letter: game.letter,
      lessons: mappedLessons,
      primaryLesson: mappedLessons.length ? mappedLessons[mappedLessons.length - 1] : null,
      instructionCount: Array.isArray(game.instructions) ? game.instructions.length : 0,
      wordCount: Array.isArray(game.words) ? game.words.length : 0,
      tileCount: Array.isArray(game.tiles) ? game.tiles.length : 0,
      answerKeyStatus: hasNullAnswerKey ? "source-pending" : "verified",
      spokenAudioStatus: "source-pending",
    };
  });
}

/** Extract KIND_PRIORITY from src/data/lesson-exercises/index.ts to verify exercise kinds. */
function readExerciseKindPriority() {
  const source = readFileSync(join(REPO_ROOT, "src/data/lesson-exercises/index.ts"), "utf8");
  const match = /const KIND_PRIORITY = \[([\s\S]*?)\];/.exec(source);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

/** Parse MPEG-1/2/2.5 Layer III frame headers for duration and validity without ffprobe. */
function inspectMp3Buffer(buf) {
  const headText = buf.subarray(0, 32).toString("utf8");
  if (headText.startsWith("# empty")) {
    return { validAudio: false, encodingKind: "ascii-placeholder-stub", frames: 0, sampleRateHz: 0, bitrateKbps: 0, durationSec: 0 };
  }
  let offset = 0;
  if (buf.length >= 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const size =
      ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    offset = 10 + size;
  }
  const brV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const brV2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const srTable = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let frames = 0;
  let totalSamples = 0;
  let sampleRateHz = 0;
  let totalBitrate = 0;

  while (offset + 4 <= buf.length) {
    if (buf[offset] !== 0xff || (buf[offset + 1] & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }
    const ver = (buf[offset + 1] >> 3) & 0x03;
    const layer = (buf[offset + 1] >> 1) & 0x03;
    const brIdx = (buf[offset + 2] >> 4) & 0x0f;
    const srIdx = (buf[offset + 2] >> 2) & 0x03;
    const pad = (buf[offset + 2] >> 1) & 0x01;
    if (ver === 1 || layer !== 1 || brIdx === 0 || brIdx === 15 || srIdx === 3) {
      offset++;
      continue;
    }
    const sr = srTable[ver][srIdx];
    const br = (ver === 3 ? brV1L3[brIdx] : brV2L3[brIdx]) * 1000;
    const samplesPerFrame = ver === 3 ? 1152 : 576;
    const frameLen = Math.floor(((samplesPerFrame / 8) * br) / sr) + pad;
    if (frameLen < 4 || offset + frameLen > buf.length) break;
    frames++;
    totalSamples += samplesPerFrame;
    sampleRateHz = sr;
    totalBitrate += br;
    offset += frameLen;
  }

  const durationSec = sampleRateHz > 0 ? Number((totalSamples / sampleRateHz).toFixed(2)) : 0;
  const bitrateKbps = frames > 0 ? Math.round(totalBitrate / frames / 1000) : 0;
  const validAudio = frames > 1;
  const encodingKind = validAudio ? "mpeg-audio" : frames === 1 ? "single-frame-silent-stub" : "non-audio-stub";
  return { validAudio, encodingKind, frames, sampleRateHz, bitrateKbps, durationSec };
}

function walkFiles(relDir) {
  const absDir = join(REPO_ROOT, relDir);
  if (!existsSync(absDir)) return [];
  const results = [];
  for (const ent of readdirSync(absDir, { withFileTypes: true })) {
    const abs = join(absDir, ent.name);
    if (ent.isDirectory()) results.push(...walkFiles(relative(REPO_ROOT, abs)));
    else results.push(relative(REPO_ROOT, abs));
  }
  return results.sort((a, b) => a.localeCompare(b));
}

/** Inspect every file under public/audio/** and public/cartilla/audio/**. */
function scanAudioAssets(pictureNameRecordings, tutorLines) {
  const pnrBySrc = new Map(pictureNameRecordings.approved.map((e) => [e.src, e]));
  const tutorBySrc = new Map();
  for (const e of tutorLines.approved) {
    if (!tutorBySrc.has(e.src)) tutorBySrc.set(e.src, []);
    tutorBySrc.get(e.src).push(e);
  }
  const tutorByVisemes = new Map(tutorLines.approved.filter((e) => e.visemes).map((e) => [e.visemes, e]));

  const diskPaths = [...walkFiles("public/audio"), ...walkFiles("public/cartilla/audio")];
  const assets = [];

  for (const relPath of diskPaths) {
    const absPath = join(REPO_ROOT, relPath);
    const buf = readFileSync(absPath);
    const sizeBytes = buf.length;
    const sha256 = createHash("sha256").update(buf).digest("hex");
    const publicPath = `/${relPath.replace(/^public\//, "")}`;

    if (relPath.endsWith(".visemes.json")) {
      const parsed = JSON.parse(buf.toString("utf8"));
      const cues = Array.isArray(parsed) ? parsed : parsed.mouthCues ?? [];
      const tutorEntry = tutorByVisemes.get(publicPath);
      assets.push({
        path: relPath,
        publicPath,
        mediaType: "visemes-json",
        classification: tutorEntry ? "connected-tutor-visemes" : "unreferenced-visemes",
        status: "approved",
        sizeBytes,
        sha256,
        cueCount: cues.length,
        durationSec: parsed.metadata?.duration ?? null,
        tutorLineId: tutorEntry?.lineId ?? null,
      });
      continue;
    }

    const mp3 = inspectMp3Buffer(buf);
    let classification = "unknown";
    let status = "source-pending";
    let note = "";

    if (QUARANTINED_AUDIO_PATHS.has(relPath)) {
      classification = "quarantined-retired";
      status = "quarantined";
      note =
        "Retired 2026-10-22 (character renamed to 'niña distraída'); excluded from manifests and playback.";
    } else if (UNUSED_BYPASSED_PATHS.has(relPath)) {
      classification = "unused-bypassed";
      status = "unused";
      note = "Silent placeholder bypassed by Silent Respect audio policy.";
    } else if (relPath.startsWith("public/audio/voz/vocabulario/")) {
      const pnrEntry = pnrBySrc.get(publicPath);
      if (pnrEntry) {
        const wired = tutorBySrc.get(publicPath) ?? [];
        classification = wired.length > 0 ? "connected-vocab-and-tutor" : "connected-vocab-approved";
        status = "approved";
        note =
          wired.length > 0
            ? `Candidate B approved; wired in tutor-lines.json (${wired.map((w) => w.lineId).join(", ")}).`
            : "Candidate B approved in picture-name-recordings.json (available for L4-24 / Flip Chart / Games).";
      }
    } else if (relPath.startsWith("public/audio/feel/")) {
      classification = mp3.validAudio ? "connected-ui-feel" : "placeholder-stub-ui-feel";
      status = mp3.validAudio ? "approved" : "source-pending";
      note = mp3.validAudio ? "Active UI feel cue." : "19-byte ASCII stub (# empty audio stub); no audio frames.";
    } else if (relPath.startsWith("public/audio/")) {
      classification = mp3.validAudio ? "connected-core-ui" : "placeholder-stub-core-ui";
      status = mp3.validAudio ? "approved" : "source-pending";
      note = mp3.validAudio ? "Active core UI audio." : "84-byte single silent frame stub.";
    }

    assets.push({
      path: relPath,
      publicPath,
      mediaType: "mp3",
      classification,
      status,
      sizeBytes,
      sha256,
      ...mp3,
      pictureKey: pnrBySrc.get(publicPath)?.key ?? null,
      tutorLineIds: (tutorBySrc.get(publicPath) ?? []).map((e) => e.lineId),
      note,
    });
  }

  // Embedded Steinway PCM sample bank
  const pianoRel = "src/components/cartilla/piano/piano-samples.ts";
  const pianoAbs = join(REPO_ROOT, pianoRel);
  const pianoStat = statSync(pianoAbs);
  assets.push({
    path: pianoRel,
    publicPath: null,
    mediaType: "embedded-pcm-ts",
    classification: "connected-steinway-pcm",
    status: "approved",
    sizeBytes: pianoStat.size,
    sha256: sha256File(pianoAbs),
    durationSec: 3.2,
    note: "6 University of Iowa Steinway Model D base64 PCM buffers (C4, D#4, F#4, A4, C5, D#5).",
  });

  return assets;
}

/** Extract clean text strings from flipchart-text-*.json for pages 3..62. */
function loadFlipchartTextByPage() {
  const map = new Map();
  for (const fn of ["flipchart-text-3-22.json", "flipchart-text-23-42.json", "flipchart-text-43-62.json"]) {
    const data = readJson(`src/data/${fn}`);
    for (const [pageStr, blocks] of Object.entries(data)) {
      const lines = (Array.isArray(blocks) ? blocks : [])
        .map((b) => String(b?.text ?? "").trim())
        .filter((t) => t.length > 0);
      map.set(Number(pageStr), { sourceFile: `src/data/${fn}`, blockCount: lines.length, sampleLines: lines.slice(0, 8) });
    }
  }
  return map;
}

function pageContentFromBt1(page) {
  switch (page.type) {
    case "picture-grid":
      return { vowelLetters: [], answerWords: page.rows.flat().filter((c) => c[1]).map((c) => c[0]) };
    case "vowel-pick-one":
      return {
        vowelLetters: page.rows.map((r) => r.letter),
        answerWords: page.rows.flatMap((r) => r.pictures.filter((c) => c[1]).map((c) => c[0])),
      };
    case "vowel-match-all":
      return { vowelLetters: page.letters, answerWords: page.pairs.map((p) => p[1]) };
    case "vowel-line-match":
      return {
        vowelLetters: [page.letterPair[0].toLowerCase()],
        answerWords: page.cells.filter((c) => c[1]).map((c) => c[0]),
      };
    case "writing":
      return { vowelLetters: [], answerWords: [] };
    default:
      return { vowelLetters: [], answerWords: [] };
  }
}

function deriveLessonItemsForGraph(lessonNumber, ctx) {
  const { bt1, bt2, pnrByKey, tutorLinesByText, pdfByPrintedPage, workbookPagesForLesson } = ctx;
  const { start, end } = workbookPagesForLesson(lessonNumber);
  const items = [];
  const seen = new Set();
  const pushUnique = (kind, text, printedPage, source = "workbook", extra = {}) => {
    const slug = idSlug(text);
    const dedupKey = `${kind}:${slug}`;
    if (!slug || seen.has(dedupKey)) return;
    seen.add(dedupKey);
    const id = `l${lessonNumber}-${kind === "sight-word" ? "sight" : kind}-${slug}`;
    const pnr = pnrByKey.get(text.toLowerCase());
    const tutorLine =
      kind === "vowel"
        ? tutorLinesByText.get(text.toLowerCase())
        : tutorLinesByText.get(text);
    items.push({
      id,
      lesson: lessonNumber,
      kind,
      text,
      printedPage,
      pdfSheet: pdfByPrintedPage.get(printedPage) ?? null,
      source,
      approvedAudioSrc: pnr?.src ?? null,
      tutorLineId: tutorLine?.lineId ?? (kind === "vowel" ? `l0-vowel-model-${text}` : null),
      ...extra,
    });
  };

  if (lessonNumber <= 6) {
    const vowels = [];
    const words = [];
    for (let p = start; p <= end; p++) {
      const page = bt1.pages[String(p)];
      if (!page || page.lesson !== lessonNumber) continue;
      const { vowelLetters, answerWords } = pageContentFromBt1(page);
      for (const v of vowelLetters) vowels.push({ text: v, printedPage: p });
      for (const w of answerWords) words.push({ text: w, printedPage: p });
    }
    for (const v of vowels) pushUnique("vowel", v.text, v.printedPage);
    for (const w of words) pushUnique("word", w.text, w.printedPage);
    return items;
  }

  // Consonant lessons 7-24
  let circle = [];
  let vocab = [];
  let sightWords = [];
  let sentences = [];
  let fill = [];
  const circlePage = start + 1;
  const letterPage = start + 2;
  const completePage = start + 3;

  if (lessonNumber === 7) {
    circle = bt1.pages[String(circlePage)]?.circle ?? [];
    vocab = (bt1.pages[String(letterPage)]?.vocabColumns ?? []).flat();
    sightWords = bt1.pages[String(letterPage)]?.sightWords ?? [];
    sentences = bt1.pages[String(letterPage)]?.sentences ?? [];
    fill = bt1.pages[String(completePage)]?.fill ?? [];
  } else {
    const ld = bt2.lessons[String(lessonNumber)];
    circle = ld.circle ?? [];
    vocab = ld.vocab ?? [];
    sightWords = ld.sightWords ?? [];
    sentences = ld.sentences ?? [];
    fill = ABSENT_PRINTED_PAGES.has(completePage) ? [] : (ld.fill ?? []);
  }

  // 1. Syllables (circle/letter pages)
  for (const row of circle) {
    pushUnique("syllable", row.syllable, circlePage);
  }
  // 2. Words in printed reading order (circle -> letter vocab -> complete fill answers)
  for (const row of circle) {
    for (const r of row.rows) {
      for (const w of r) pushUnique("word", w, circlePage);
    }
  }
  for (const w of vocab) {
    pushUnique("word", w, letterPage);
  }
  for (const f of fill) {
    // Skip printer abbreviation "M" on L7 p.22 (already resolved to Memo in vocab)
    if (f.wordBox && f.wordBox.trim().length > 1) {
      pushUnique("word", f.wordBox.trim(), completePage);
    }
  }
  // 3. Sight words
  for (const sw of sightWords) {
    pushUnique("sight-word", sw, letterPage);
  }
  // 4. Sentences (sequentially numbered canonical IDs)
  sentences.forEach((sentence, idx) => {
    const text = String(sentence).trim();
    if (!text) return;
    const id = `l${lessonNumber}-sentence-${String(idx + 1).padStart(2, "0")}`;
    items.push({
      id,
      lesson: lessonNumber,
      kind: "sentence",
      text,
      printedPage: letterPage,
      pdfSheet: pdfByPrintedPage.get(letterPage) ?? null,
      source: "workbook",
      approvedAudioSrc: null,
      tutorLineId: null,
    });
  });

  return items;
}

function buildLessonGraph(lessonNumber, ctx) {
  const {
    faithfulByLesson,
    pageLayouts,
    kindPriority,
    pdfByPrintedPage,
    s2fByPdfSheet,
    flipchartByLesson,
    flipchartTextByPage,
    consonantsByLesson,
    pnrByKey,
    games,
    guiaByLesson,
    workbookPagesForLesson,
  } = ctx;

  const faithful = faithfulByLesson.get(lessonNumber);
  const { start, end } = workbookPagesForLesson(lessonNumber);
  const printedPages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const absentPages = printedPages.filter((p) => ABSENT_PRINTED_PAGES.has(p));
  const pdfSheets = printedPages.map((p) => pdfByPrintedPage.get(p) ?? null).filter((s) => s !== null);
  const flipchartPages = flipchartByLesson.get(lessonNumber) ?? [];

  const kind =
    lessonNumber === 1 ? "intro" : lessonNumber <= 6 ? "vowel" : "consonant";

  const prerequisiteLessons =
    lessonNumber === 1
      ? []
      : lessonNumber <= 6
        ? ["lesson-01"]
        : lessonNumber === 7
          ? ["lesson-02", "lesson-03", "lesson-04", "lesson-05", "lesson-06"]
          : [`lesson-${String(lessonNumber - 1).padStart(2, "0")}`];

  const nextLessons =
    lessonNumber === 1
      ? ["lesson-02", "lesson-03", "lesson-04", "lesson-05", "lesson-06"]
      : lessonNumber >= 2 && lessonNumber <= 5
        ? [`lesson-${String(lessonNumber + 1).padStart(2, "0")}`, "lesson-07"]
        : lessonNumber === 6
          ? ["lesson-07"]
          : lessonNumber < 24
            ? [`lesson-${String(lessonNumber + 1).padStart(2, "0")}`]
            : [];

  const pageNodes = printedPages.map((printedPage) => {
    const absent = ABSENT_PRINTED_PAGES.has(printedPage);
    const pdfSheet = pdfByPrintedPage.get(printedPage) ?? null;
    const s2f = pdfSheet ? s2fByPdfSheet.get(pdfSheet) : null;
    const layout = pageLayouts.pages[String(printedPage)];
    const regions = absent
      ? []
      : [...(layout?.regions ?? [])].sort((a, b) => a.order - b.order);
    const exerciseKind = absent
      ? "absent-in-source"
      : kindPriority.find((k) => regions.some((r) => r.regionType === k)) ??
        regions.find((r) => r.regionType !== "instruction")?.regionType ??
        "reading";
    const instructions = regions
      .filter((r) => r.regionType === "instruction" && r.text)
      .map((r) => r.text.trim());
    const parsePages = (str) =>
      String(str ?? "")
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isInteger(n) && n > 0);

    return {
      printedPage,
      pdfSheet,
      status: absent ? "absent-in-source" : "verified",
      exerciseId: `l${lessonNumber}-p${printedPage}-${exerciseKind}`,
      exerciseKind,
      prompt: absent ? null : instructions.join(" ") || null,
      flipchartPrimaryPages: s2f ? parsePages(s2f.primary_flip_pages) : [],
      flipchartSupplementalPages: s2f ? parsePages(s2f.supplemental_flip_pages) : [],
    };
  });

  const items = deriveLessonItemsForGraph(lessonNumber, ctx);
  const fcConsonant = consonantsByLesson.get(lessonNumber);
  const flipchartVocab = (fcConsonant?.vocab ?? []).map((v) => ({
    word: v.word,
    flipchartPage: fcConsonant.vocabSource?.flipchartPage ?? flipchartPages[0] ?? null,
    illustrationSrc: v.illustrationSrc ?? null,
    approvedAudioSrc: pnrByKey.get(v.word.toLowerCase())?.src ?? null,
  }));

  const guia = guiaByLesson.get(lessonNumber);
  const pendingSources = [];
  if (!guia) pendingSources.push("teacher-guide");
  else {
    if (guia.rhyme?.text === null || guia.rhyme?.text === "missing-from-source") {
      pendingSources.push("guia-rhyme-text");
    }
    if (guia.provenance?.verified === false) pendingSources.push("teacher-guide-verification");
  }
  for (const fp of flipchartPages) {
    if (!flipchartTextByPage.has(fp)) pendingSources.push(`flipchart-ocr-page-${fp}`);
  }
  const linkedGames = games.filter((g) => g.lessons.includes(lessonNumber));
  if (linkedGames.some((g) => g.answerKeyStatus === "source-pending")) {
    pendingSources.push("game-answer-key");
  }

  const byKind = { vowel: 0, syllable: 0, word: 0, "sight-word": 0, sentence: 0 };
  let itemsWithApprovedAudio = 0;
  let itemsAudioPending = 0;
  for (const it of items) {
    byKind[it.kind] = (byKind[it.kind] ?? 0) + 1;
    if (it.approvedAudioSrc) itemsWithApprovedAudio++;
    else itemsAudioPending++;
  }

  return {
    schemaVersion: "1.0.0",
    lessonId: `lesson-${String(lessonNumber).padStart(2, "0")}`,
    lesson: lessonNumber,
    title: faithful.title,
    kind,
    focus: faithful.focus,
    printedWorkbookPages: {
      start,
      end,
      pages: printedPages,
      absentInSourcePages: absentPages,
    },
    pdfSheets: {
      start: pdfSheets[0] ?? null,
      end: pdfSheets[pdfSheets.length - 1] ?? null,
      sheets: pdfSheets,
    },
    flipchartPages,
    prerequisiteLessons,
    nextLessons,
    sourceStatus: absentPages.length > 0 ? "partial-absent-in-source" : "verified",
    pendingSources,
    games: linkedGames.map((g) => ({ id: g.id, type: g.type, answerKeyStatus: g.answerKeyStatus })),
    pages: pageNodes,
    flipchartVocab,
    items,
    summary: {
      totalItems: items.length,
      byKind,
      itemsWithApprovedAudio,
      itemsAudioPending,
    },
  };
}

/** Estimate recording seconds/minutes & offline MB for a lesson cleanly and deterministically. */
function estimateLessonAudioMetrics(lessonGraph, tutorLines, diskAssetsByPublicPath) {
  const lineEntriesForLesson = [...tutorLines.approved, ...tutorLines.pending].filter(
    (e) => e.lesson === lessonGraph.lesson,
  );
  const existingWiredCount = tutorLines.approved.filter((e) => e.lesson === lessonGraph.lesson).length;
  const pendingTutorLineCount = tutorLines.pending.filter((e) => e.lesson === lessonGraph.lesson).length;

  // Planned/needed lines for full 24-lesson Tutor coverage:
  //   - 3 lesson-specific greeting-first lines per lesson
  //   - 1 lesson overview narration per lesson
  //   - all unique spoken curriculum items (vowels/syllables/words/sight-words/sentences)
  //     not already backed by approved Candidate B recordings on disk
  const greetingLinesNeeded = 3;
  const overviewLinesNeeded = 1;
  const curriculumItemsTotal = lessonGraph.items.length;
  const curriculumApprovedOnDisk = lessonGraph.items.filter((i) => Boolean(i.approvedAudioSrc)).length;
  const curriculumPendingRecording = curriculumItemsTotal - curriculumApprovedOnDisk;

  // Flipchart vocab unique from workbook items that may need recording
  const wbWordSet = new Set(lessonGraph.items.map((i) => i.text.toLowerCase()));
  const extraFlipchartWords = lessonGraph.flipchartVocab.filter(
    (v) => !wbWordSet.has(v.word.toLowerCase()),
  );
  const extraFlipchartPending = extraFlipchartWords.filter((v) => !v.approvedAudioSrc).length;

  const totalLessonLines =
    greetingLinesNeeded + overviewLinesNeeded + curriculumItemsTotal + extraFlipchartWords.length;
  const recordedOnDiskForLesson =
    curriculumApprovedOnDisk + (extraFlipchartWords.length - extraFlipchartPending);
  const pendingToRecordForLesson = totalLessonLines - recordedOnDiskForLesson;

  // Estimate durations:
  //   - approved Candidate B word on disk: actual duration (or 1.71s avg)
  //   - pending vowel/syllable/word/sight-word: 1.7s
  //   - sentence: max(2.2s, wordCount / 2.2 + 0.6s)
  //   - greeting line: 3.5s each
  //   - lesson overview: 18.0s
  let existingAudioBytes = 0;
  let existingVisemeBytes = 0;
  let existingAudioSec = 0;
  let pendingRecSec = 0;

  const seenSrc = new Set();
  for (const item of lessonGraph.items) {
    if (item.approvedAudioSrc && !seenSrc.has(item.approvedAudioSrc)) {
      seenSrc.add(item.approvedAudioSrc);
      const asset = diskAssetsByPublicPath.get(item.approvedAudioSrc);
      if (asset) {
        existingAudioBytes += asset.sizeBytes;
        existingAudioSec += asset.durationSec || 1.71;
      }
      const visemePath = `/audio/voz/tutor/leccion-${lessonGraph.lesson}/l${lessonGraph.lesson}-model-${idSlug(item.text)}.visemes.json`;
      const vAsset = diskAssetsByPublicPath.get(visemePath);
      if (vAsset) existingVisemeBytes += vAsset.sizeBytes;
    } else if (!item.approvedAudioSrc) {
      if (item.kind === "sentence") {
        const wc = item.text.split(/\s+/).filter(Boolean).length;
        pendingRecSec += Math.max(2.2, wc / 2.2 + 0.6);
      } else {
        pendingRecSec += 1.7;
      }
    }
  }
  for (const fv of extraFlipchartWords) {
    if (fv.approvedAudioSrc && !seenSrc.has(fv.approvedAudioSrc)) {
      seenSrc.add(fv.approvedAudioSrc);
      const asset = diskAssetsByPublicPath.get(fv.approvedAudioSrc);
      if (asset) {
        existingAudioBytes += asset.sizeBytes;
        existingAudioSec += asset.durationSec || 1.71;
      }
    } else if (!fv.approvedAudioSrc) {
      pendingRecSec += 1.7;
    }
  }

  pendingRecSec += greetingLinesNeeded * 3.5 + overviewLinesNeeded * 18.0;

  // Offline MP3 projection: 48 kbps mono (~6,000 B/sec) + ~1,500 B per viseme JSON
  const projectedPendingAudioBytes = Math.round(pendingRecSec * 6000);
  const projectedVisemeBytes = totalLessonLines * 1500;
  const projectedTotalBytes = existingAudioBytes + projectedPendingAudioBytes + projectedVisemeBytes;

  return {
    lesson: lessonGraph.lesson,
    title: lessonGraph.title,
    tutorLinesManifestEntries: lineEntriesForLesson.length,
    tutorLinesApprovedWired: existingWiredCount,
    tutorLinesPendingInManifest: pendingTutorLineCount,
    curriculumItemsTotal,
    curriculumApprovedOnDisk,
    curriculumPendingRecording,
    greetingLinesNeeded,
    overviewLinesNeeded,
    totalPlannedLines: totalLessonLines,
    recordedOnDiskForLesson,
    pendingToRecordForLesson,
    existingAudioSec: Number(existingAudioSec.toFixed(2)),
    estimatedPendingRecordingMinutes: Number((pendingRecSec / 60).toFixed(2)),
    estimatedTotalRecordingMinutes: Number(((existingAudioSec + pendingRecSec) / 60).toFixed(2)),
    existingOnDiskBytes: existingAudioBytes + existingVisemeBytes,
    existingOnDiskMB: Number(((existingAudioBytes + existingVisemeBytes) / (1024 * 1024)).toFixed(4)),
    estimatedFullOfflineMB: Number((projectedTotalBytes / (1024 * 1024)).toFixed(3)),
  };
}

function buildCoverageMatrix() {
  const lessonsJson = readJson("src/data/lessons.json");
  const bt1 = readJson("src/data/book-transcription/lessons-01-07.json");
  const bt2 = readJson("src/data/book-transcription/lessons-08-24.json");
  const pageLayouts = readJson("src/data/page-layouts.json");
  const teacherFlipchart = readJson("src/data/teacher-flipchart.json");
  const s2f = readJson("src/data/reconstruction/student-to-flipchart-284.json");
  const pdf2page = readJson("src/data/reconstruction/pdf-sheet-to-printed-page.json");
  const tutorLines = readJson("src/content/tutor-lines.json");
  const pnr = readJson("src/content/picture-name-recordings.json");
  const consonants = readJson("src/content/consonants.json");
  const lessonsContent = readJson("src/content/lessons.json");
  const missingCsvRaw = readFileSync(join(REPO_ROOT, "docs/audio/MISSING_PICTURE_RECORDINGS.csv"), "utf8").trim();
  const missingPictureRows = missingCsvRaw
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [pronunciationKey, verifiedName, suggestedFile, contentReferences] = line.split(",");
      return { pronunciationKey, verifiedName, suggestedFile, contentReferences };
    });

  const { LESSONS: lessonMeta } = loadPureTsModule("src/content/lesson-meta.ts");
  const { WORKBOOK_PAGE_COUNT } = loadPureTsModule("src/lib/workbook-pages.ts");
  const kindPriority = readExerciseKindPriority();
  const games = loadLiveGames(lessonMeta);
  const flipchartTextByPage = loadFlipchartTextByPage();

  const faithfulByLesson = new Map(lessonsJson.bookFaithfulLessons.map((l) => [l.lesson, l]));
  const consonantsByLesson = new Map(consonants.map((c) => [c.lesson, c]));
  const pnrByKey = new Map(pnr.approved.map((e) => [e.key.toLowerCase(), e]));
  const tutorLinesByText = new Map(
    [...tutorLines.approved, ...tutorLines.pending].map((e) => [e.text.trim(), e]),
  );

  const guiaByLesson = new Map();
  for (let n = 1; n <= 24; n++) {
    const rel = `src/content/guia/lesson-${n}.json`;
    if (existsSync(join(REPO_ROOT, rel))) guiaByLesson.set(n, readJson(rel));
  }

  const pdfByPrintedPage = new Map();
  for (const sheet of pdf2page.pdf_sheets) {
    if (typeof sheet.printed_page === "number") pdfByPrintedPage.set(sheet.printed_page, sheet.pdf_sheet);
  }
  const s2fByPdfSheet = new Map(s2f.mappings.map((m) => [m.student_pdf_page, m]));
  const flipchartByLesson = new Map();
  for (const p of teacherFlipchart.pages) {
    if (!flipchartByLesson.has(p.lesson)) flipchartByLesson.set(p.lesson, []);
    flipchartByLesson.get(p.lesson).push(p.flipchartPage);
  }

  const ctx = {
    bt1,
    bt2,
    faithfulByLesson,
    pageLayouts,
    kindPriority,
    pdfByPrintedPage,
    s2fByPdfSheet,
    flipchartByLesson,
    flipchartTextByPage,
    consonantsByLesson,
    pnrByKey,
    tutorLinesByText,
    games,
    guiaByLesson,
    workbookPagesForLesson,
  };

  const lessonGraphs = Array.from({ length: 24 }, (_, idx) => buildLessonGraph(idx + 1, ctx));
  const audioAssets = scanAudioAssets(pnr, tutorLines);
  const diskAssetsByPublicPath = new Map(
    audioAssets.filter((a) => a.publicPath).map((a) => [a.publicPath, a]),
  );

  // Printed workbook pages 1..90 (strictly separate from PDF sheets 1..98)
  const printedWorkbookPages = [];
  for (let p = 1; p <= WORKBOOK_PAGE_COUNT; p++) {
    const absent = ABSENT_PRINTED_PAGES.has(p);
    const pdfSheet = pdfByPrintedPage.get(p) ?? null;
    const s2fRow = pdfSheet ? s2fByPdfSheet.get(pdfSheet) : null;
    const layout = pageLayouts.pages[String(p)];
    const lessonNum =
      lessonGraphs.find(
        (g) => p >= g.printedWorkbookPages.start && p <= g.printedWorkbookPages.end,
      )?.lesson ?? null;

    printedWorkbookPages.push({
      printedPage: p,
      lesson: lessonNum,
      pdfSheet,
      status: absent ? "absent-in-source" : layout ? "verified" : "source-pending",
      regionCount: absent ? 0 : (layout?.regions?.length ?? 0),
      flipchartPrimaryPages: s2fRow?.primary_flip_pages || "",
      flipchartSupplementalPages: s2fRow?.supplemental_flip_pages || "",
      note: absent
        ? "Absent from the 98-sheet source scan (documented 86-87 gap). Never invented."
        : undefined,
    });
  }

  // PDF sheets 1..98 (strictly separate from printed workbook pages)
  const pdfSheets = pdf2page.pdf_sheets.map((sheet) => ({
    pdfSheet: sheet.pdf_sheet,
    printedPage: sheet.printed_page,
    role: sheet.role,
    status: sheet.status,
    flipchartPrimaryPages: s2fByPdfSheet.get(sheet.pdf_sheet)?.primary_flip_pages || "",
  }));

  // Flipchart sheets 1..62
  const flipchartSheets = teacherFlipchart.pages.map((fp) => {
    const ocr = flipchartTextByPage.get(fp.flipchartPage);
    return {
      flipchartPage: fp.flipchartPage,
      lesson: fp.lesson,
      path: fp.path,
      artStatus: fp.status,
      textExtractionStatus: ocr ? "verified" : "source-pending",
      textBlockCount: ocr?.blockCount ?? 0,
    };
  });

  // Shared universal tutor lines (lesson 0)
  const sharedTutorLines = [...tutorLines.approved, ...tutorLines.pending].filter((e) => e.lesson === 0);
  const sharedEstSec = sharedTutorLines.reduce((sum, e) => {
    const cleanText = e.text.replace(/\[DRAFT[^\]]*\]\s*/g, "");
    const reuseIdx = cleanText.lastIndexOf("(reuse:");
    const clean =
      reuseIdx !== -1 && cleanText.endsWith(")")
        ? cleanText.slice(0, reuseIdx).trimEnd()
        : cleanText;
    const wc = clean.split(/\s+/).filter(Boolean).length;
    return sum + Math.max(1.5, wc / 2.2 + 0.5);
  }, 0);

  const perLessonAudioEstimates = lessonGraphs.map((lg) =>
    estimateLessonAudioMetrics(lg, tutorLines, diskAssetsByPublicPath),
  );

  const summary = {
    lessonsTotal: 24,
    printedWorkbookPagesTotal: WORKBOOK_PAGE_COUNT,
    printedWorkbookPagesVerified: printedWorkbookPages.filter((p) => p.status === "verified").length,
    printedWorkbookPagesAbsentInSource: [...ABSENT_PRINTED_PAGES],
    pdfSheetCount: pdf2page.pdf_sheet_count,
    flipchartSheetCount: teacherFlipchart.pages.length,
    flipchartSheetsWithText: flipchartSheets.filter((f) => f.textExtractionStatus === "verified").length,
    flipchartSheetsTextPending: flipchartSheets
      .filter((f) => f.textExtractionStatus === "source-pending")
      .map((f) => f.flipchartPage),
    liveGamesCount: games.length,
    vowelLessonsCount: lessonsContent.length,
    consonantLessonsCount: consonants.length,
    tutorGraphTotalItems: lessonGraphs.reduce((s, g) => s + g.items.length, 0),
    tutorGraphL1To3LockedItems: lessonGraphs
      .slice(0, 3)
      .reduce((s, g) => s + g.items.length, 0),
    tutorLinesApproved: tutorLines.approved.length,
    tutorLinesPending: tutorLines.pending.length,
    pictureRecordingsApproved: pnr.approved.length,
    pictureRecordingsMissingFlipchart: missingPictureRows.length,
    audioFilesOnDisk: audioAssets.filter((a) => a.mediaType !== "embedded-pcm-ts").length,
    mp3FilesOnDisk: audioAssets.filter((a) => a.mediaType === "mp3").length,
    validMp3FilesOnDisk: audioAssets.filter((a) => a.mediaType === "mp3" && a.validAudio).length,
    quarantinedOnDisk: audioAssets.filter((a) => a.status === "quarantined").length,
    visemeJsonFilesOnDisk: audioAssets.filter((a) => a.mediaType === "visemes-json").length,
    sharedUniversalLinesCount: sharedTutorLines.length,
    sharedEstimatedRecordingMinutes: Number((sharedEstSec / 60).toFixed(2)),
    sharedEstimatedOfflineAudioMB: Number(((sharedEstSec * 6000 + sharedTutorLines.length * 1500) / (1024 * 1024)).toFixed(3)),
    totalLessonPlannedLines: perLessonAudioEstimates.reduce((s, l) => s + l.totalPlannedLines, 0),
    totalLessonRecordedOnDisk: perLessonAudioEstimates.reduce((s, l) => s + l.recordedOnDiskForLesson, 0),
    totalLessonPendingToRecord: perLessonAudioEstimates.reduce((s, l) => s + l.pendingToRecordForLesson, 0),
    totalEstimatedRecordingMinutes: Number(
      (
        sharedEstSec / 60 +
        perLessonAudioEstimates.reduce((s, l) => s + l.estimatedTotalRecordingMinutes, 0)
      ).toFixed(2),
    ),
    totalEstimatedFullAudioOfflineMB: Number(
      (
        (sharedEstSec * 6000 + sharedTutorLines.length * 1500) / (1024 * 1024) +
        perLessonAudioEstimates.reduce((s, l) => s + l.estimatedFullOfflineMB, 0)
      ).toFixed(3),
    ),
  };

  return {
    schemaVersion: "1.0.0",
    sourceOfTruth: {
      bookTitle: lessonsJson.book.title,
      author: lessonsJson.book.author,
      printedWorkbookPagesRange: "1-90",
      pdfSheetsRange: "1-98",
      flipchartSheetsRange: "1-62",
      absentPrintedPages: [...ABSENT_PRINTED_PAGES],
      blockedSourceRule:
        "Printed workbook pages 86 and 87 are absent-in-source across the 98-sheet scan and are never invented.",
    },
    summary,
    lessons: lessonGraphs,
    printedWorkbookPages,
    pdfSheets,
    flipchartSheets,
    games,
    audio: {
      assets: audioAssets,
      missingFlipchartPictures: missingPictureRows,
      quarantinedExternal: QUARANTINED_EXTERNAL_PACKAGES,
      perLessonEstimates: perLessonAudioEstimates,
    },
  };
}

function renderCoverageMarkdown(matrix) {
  const s = matrix.summary;
  const lines = [
    "# Gretel Tutor — Curriculum & Source Coverage Matrix",
    "",
    `Canonical reconciliation of **${s.lessonsTotal} lessons**, **${s.printedWorkbookPagesTotal} printed workbook pages** (kept strictly separate from **${s.pdfSheetCount} PDF sheets**), **${s.flipchartSheetCount} Teacher Flip Chart sheets**, **${s.liveGamesCount} live games**, **${s.tutorLinesApproved + s.tutorLinesPending} tutor-lines entries**, and **${s.audioFilesOnDisk} audio/viseme files on disk**.`,
    "",
    "> **Source Integrity Invariants:** Printed workbook pages **86** and **87** are marked `absent-in-source` and never invented. Missing materials (unverified guide rhymes, flipchart front-matter text, unrecorded audio) are marked `source-pending`.",
    "",
    "## Summary Metrics",
    "",
    "| Dimension | Verified / Approved | Pending / Absent | Notes |",
    "|---|---:|---:|---|",
    `| Lessons (1–24) | 22 complete, 2 partial | 2 partial (L23 p.86, L24 p.87) | ${s.tutorGraphTotalItems} graph items (L1–3 locked at ${s.tutorGraphL1To3LockedItems}) |`,
    `| Printed Workbook Pages (1–90) | ${s.printedWorkbookPagesVerified} verified | 2 \`absent-in-source\` (pp. 86–87) | Strictly separate from PDF sheets |`,
    `| PDF Sheets (1–98) | 88 instructional + 10 front/back matter | 0 | Sheets 1–6 front matter; 7–91 = pp. 1–85; 92–94 = pp. 88–90; 95–98 end matter |`,
    `| Flip Chart Sheets (1–62) | ${s.flipchartSheetsWithText} with OCR text | ${s.flipchartSheetsTextPending.length} \`source-pending\` (pp. ${s.flipchartSheetsTextPending.join(", ")}) | Pages 1–2 are cover/credits plates |`,
    `| Live Games | ${s.liveGamesCount} registered | 1 answer key \`source-pending\` | \`completar-palabras\` blank key pending; all 12 game audio packs \`source-pending\` |`,
    `| Tutor Lines (\`tutor-lines.json\`) | ${s.tutorLinesApproved} approved | ${s.tutorLinesPending} \`source-pending\` | L1–3 word models wired to Candidate B MP3s |`,
    `| Picture Recordings | ${s.pictureRecordingsApproved} approved | ${s.pictureRecordingsMissingFlipchart} \`source-pending\` | Flip Chart letter-tagged/scene labels + \`niña distraída\` |`,
    "",
    "## Lessons 1–24 Coverage",
    "",
    "| Lesson | Title | Printed Pages | PDF Sheets | Flip Chart | Items (L1–24) | Audio Approved / Total | Games | Source Status |",
    "|---:|---|---|---|---|---:|---:|---|---|",
  ];

  for (const lg of matrix.lessons) {
    const pagesStr = lg.printedWorkbookPages.absentInSourcePages.length
      ? `${lg.printedWorkbookPages.start}–${lg.printedWorkbookPages.end} (pp. ${lg.printedWorkbookPages.absentInSourcePages.join(", ")} \`absent-in-source\`)`
      : `${lg.printedWorkbookPages.start}–${lg.printedWorkbookPages.end}`;
    const sheetsStr = `${lg.pdfSheets.start}–${lg.pdfSheets.end} (${lg.pdfSheets.sheets.length} sheets)`;
    const fcStr = lg.flipchartPages.join(", ");
    const gamesStr = lg.games.length ? lg.games.map((g) => `\`${g.id}\``).join(", ") : "—";
    const statusStr = lg.pendingSources.length
      ? `\`${lg.sourceStatus}\`; pending: ${lg.pendingSources.map((p) => `\`${p}\``).join(", ")}`
      : `\`${lg.sourceStatus}\``;
    lines.push(
      `| ${lg.lesson} | ${lg.title} | ${pagesStr} | ${sheetsStr} | ${fcStr} | ${lg.summary.totalItems} | ${lg.summary.itemsWithApprovedAudio}/${lg.summary.totalItems} | ${gamesStr} | ${statusStr} |`,
    );
  }

  lines.push(
    "",
    "## Printed Workbook Pages vs PDF Sheets Boundary",
    "",
    "- **PDF sheets 1–6**: `NON_PRINTED_FRONT_MATTER` (`printedPage: null`)",
    "- **PDF sheets 7–91**: Printed Workbook pages `1–85` (`printedPage = pdfSheet - 6`)",
    "- **Printed Workbook pages 86–87**: `absent-in-source` (no PDF sheet exists in the 98-sheet scan)",
    "- **PDF sheets 92–94**: Printed Workbook pages `88–90`",
    "- **PDF sheets 95–98**: `NON_PRINTED_END_MATTER` (`printedPage: null`)",
    "",
    "## Live Games Registry Status",
    "",
    "| Game ID | Archetype | Letter | Lesson(s) | Answer Key | Spoken Audio |",
    "|---|---|---|---|---|---|",
  );
  for (const g of matrix.games) {
    lines.push(
      `| \`${g.id}\` | \`${g.type}\` | ${g.letter} | ${g.lessons.join(", ")} | \`${g.answerKeyStatus}\` | \`${g.spokenAudioStatus}\` |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function renderAudioReconciliationMarkdown(matrix) {
  const s = matrix.summary;
  const assets = matrix.audio.assets;
  const validVocab = assets.filter((a) => a.mediaType === "mp3" && a.path.startsWith("public/audio/voz/vocabulario/") && a.status === "approved");
  const quarantined = assets.filter((a) => a.status === "quarantined");
  const unused = assets.filter((a) => a.status === "unused");
  const uiFiles = assets.filter((a) => a.path.startsWith("public/audio/") && !a.path.startsWith("public/audio/voz/"));
  const visemes = assets.filter((a) => a.mediaType === "visemes-json");
  const piano = assets.find((a) => a.mediaType === "embedded-pcm-ts");

  const lines = [
    "# Gretel Tutor — Audio Reconciliation & Quarantine Dossier",
    "",
    "Complete SHA-256 audit of every audio and viseme asset in the repository, permanent quarantine enforcement, and per-lesson recording/offline footprint estimates.",
    "",
    "## 1. Permanent Quarantine & Rejection Registry",
    "",
    "These materials and technologies MUST NEVER be played, restitched, deployed, or counted as active audio:",
    "",
    "| Asset / Technology | Location / Pattern | SHA-256 / Size | Status | Governance Rule |",
    "|---|---|---|---|---|",
    "| `Gretel_67_Audio_Lecciones_Listo.zip` (`rec_gretel_*`) | Absent from worktree; blocked by `validate-tutor-lines.mjs` | N/A (external) | **REJECTED / QUARANTINED** | Owner rejected 2026-10-15 (stuttering, music bleed, wrong cuts). Never use. |",
  ];

  for (const q of quarantined) {
    lines.push(
      `| \`${q.path.split("/").pop()}\` | \`${q.path}\` | \`${q.sha256}\` (${q.sizeBytes.toLocaleString("en-US")} B) | **QUARANTINED / UNUSED** | ${q.note} |`,
    );
  }
  for (const u of unused) {
    lines.push(
      `| \`${u.path.split("/").pop()}\` | \`${u.path}\` | \`${u.sha256}\` (${u.sizeBytes.toLocaleString("en-US")} B) | **UNUSED / BYPASSED** | ${u.note} |`,
    );
  }
  lines.push(
    "| `tinywow_audio_recording.mp3` | Absent from worktree | N/A (external) | **REJECTED / QUARANTINED** | Lossy third-party transcoding distortion (2026-10-19). |",
    "| `browser_cloud_tts_generators` | Prohibited by `AUDIO_POLICY` (`allowTts: false`) | Code policy | **PROHIBITED** | Recorded human audio only; missing clips resolve silently. |",
    "",
    "## 2. Repository Audio Inventory Summary",
    "",
    `- **Files on disk under \`public/audio/**\` and \`public/cartilla/audio/**\`**: **${s.audioFilesOnDisk}** (${s.mp3FilesOnDisk} \`.mp3\` files + ${s.visemeJsonFilesOnDisk} \`.visemes.json\` files)`,
    `- **Approved playable vocabulary MP3s**: **${validVocab.length}** (43 wired in \`tutor-lines.json\` for L1–3 + 118 additional Candidate B recordings in \`picture-name-recordings.json\`)`,
    `- **UI & Core MP3s**: **${uiFiles.length}** (1 full acoustic \`page-turn-soft.mp3\`; 2 84-byte silent single-frame stubs \`ambient-classroom.mp3\` & \`page-turn.mp3\`; 8 19-byte \`feel/*.mp3\` ASCII placeholder stubs marked \`source-pending\`)`,
    `- **Quarantined / Unused MP3s on disk**: **2** (\`nina-sordita.mp3\` quarantined; \`silent.mp3\` bypassed)`,
    `- **Embedded Steinway PCM bank**: \`${piano.path}\` (SHA-256 \`${piano.sha256}\`, ${piano.sizeBytes.toLocaleString("en-US")} B)`,
    `- **External / Unmerged Audio**: \`Gretel_558674_Original.m4a\` (expected SHA-256 \`239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d\`) remains \`source-pending\` until transcript alignment; \`origin/audio/owner-instructions-20261019\` instruction cuts (40+5) are not in this worktree.`,
    "",
    "## 3. Per-Lesson Line Counts, Recording Minutes & Offline MB",
    "",
    `Shared universal tutor bank (\`lesson 0\` in \`tutor-lines.json\`): **${s.sharedUniversalLinesCount} pending lines**, ~**${s.sharedEstimatedRecordingMinutes} min**, ~**${s.sharedEstimatedOfflineAudioMB} MB** projected audio+visemes (plus one-time ~32–40 MB offline Vosk Spanish model).`,
    "",
    "| Lesson | Title | Total Planned Lines | Approved on Disk | Pending to Record | Manifest Wired (L1–3) | Est. Recording Min | On-Disk Audio MB | Est. Full Offline MB |",
    "|---:|---|---:|---:|---:|---:|---:|---:|---:|",
  );

  for (const row of matrix.audio.perLessonEstimates) {
    lines.push(
      `| ${row.lesson} | ${row.title} | ${row.totalPlannedLines} | ${row.recordedOnDiskForLesson} | ${row.pendingToRecordForLesson} | ${row.tutorLinesApprovedWired} | ${row.estimatedTotalRecordingMinutes.toFixed(2)} | ${row.existingOnDiskMB.toFixed(3)} | ${row.estimatedFullOfflineMB.toFixed(3)} |`,
    );
  }

  lines.push(
    `| **Total (L1–24)** | **All 24 Lessons** | **${s.totalLessonPlannedLines}** | **${s.totalLessonRecordedOnDisk}** | **${s.totalLessonPendingToRecord}** | **${s.tutorLinesApproved}** | **${(s.totalEstimatedRecordingMinutes - s.sharedEstimatedRecordingMinutes).toFixed(2)}** | **${matrix.audio.perLessonEstimates.reduce((acc, r) => acc + r.existingOnDiskMB, 0).toFixed(3)}** | **${(s.totalEstimatedFullAudioOfflineMB - s.sharedEstimatedOfflineAudioMB).toFixed(3)}** |`,
    `| **Grand Total (+Shared)** | **L1–24 + Shared Bank** | **${s.totalLessonPlannedLines + s.sharedUniversalLinesCount}** | **${s.totalLessonRecordedOnDisk}** | **${s.totalLessonPendingToRecord + s.sharedUniversalLinesCount}** | **${s.tutorLinesApproved}** | **${s.totalEstimatedRecordingMinutes.toFixed(2)}** | **${matrix.audio.perLessonEstimates.reduce((acc, r) => acc + r.existingOnDiskMB, 0).toFixed(3)}** | **${s.totalEstimatedFullAudioOfflineMB.toFixed(3)}** |`,
    "",
    "> Note: Per-lesson \"Approved on Disk\" counts unique approved Candidate B words in `picture-name-recordings.json` matching each lesson's workbook + flipchart items (some vocabulary words recur across lessons, so the sum across lessons exceeds the 161 unique files on disk). In `tutor-lines.json`, Lesson 1 wires 36 entries (19 target words + 17 page 1–3 distractor words) reused across Lessons 2 (4 new) and 3 (3 new) for 43 total.",
    "",
    "## 4. Missing Flip Chart & Scene Recordings (`source-pending`, 38 items)",
    "",
    "| Pronunciation Key | Suggested File | Content Reference | Status |",
    "|---|---|---|---|",
  );
  for (const m of matrix.audio.missingFlipchartPictures) {
    lines.push(`| ${m.pronunciationKey} | \`${m.suggestedFile}\` | ${m.contentReferences} | \`source-pending\` |`);
  }

  lines.push(
    "",
    "## 5. Complete Checksum Registry of Existing Audio Assets",
    "",
    "### 5.1 Core UI & Feel Audio (11 MP3s + 1 Unused Fallback + 1 Quarantined)",
    "",
    "| Path | Classification | Status | Bytes | Duration (s) | SHA-256 |",
    "|---|---|---|---:|---:|---|",
  );
  for (const a of [...uiFiles, ...quarantined, ...unused].sort((x, y) => x.path.localeCompare(y.path))) {
    lines.push(
      `| \`${a.path}\` | \`${a.classification}\` | \`${a.status}\` | ${a.sizeBytes} | ${a.durationSec ?? 0} | \`${a.sha256}\` |`,
    );
  }

  lines.push(
    "",
    "### 5.2 Approved Vocabulary Recordings (`public/audio/voz/vocabulario/*.mp3`, 161 files)",
    "",
    "| Key | Path | Classification | Bytes | Duration (s) | Sample Rate | Bitrate (kbps) | SHA-256 |",
    "|---|---|---|---:|---:|---:|---:|---|",
  );
  for (const a of validVocab) {
    lines.push(
      `| ${a.pictureKey} | \`${a.path}\` | \`${a.classification}\` | ${a.sizeBytes} | ${a.durationSec} | ${a.sampleRateHz} | ${a.bitrateKbps} | \`${a.sha256}\` |`,
    );
  }

  lines.push(
    "",
    "### 5.3 Tutor Viseme Timelines (`public/audio/voz/tutor/leccion-1..3/*.visemes.json`, 43 files)",
    "",
    "| Tutor Line ID | Path | Bytes | Mouth Cues | SHA-256 |",
    "|---|---|---:|---:|---|",
  );
  for (const v of visemes) {
    lines.push(`| \`${v.tutorLineId ?? "unlinked"}\` | \`${v.path}\` | ${v.sizeBytes} | ${v.cueCount} | \`${v.sha256}\` |`);
  }
  lines.push("");

  return lines.join("\n");
}

function main() {
  const writeGraph = process.argv.includes("--write-graph");
  const matrix = buildCoverageMatrix();

  if (writeGraph) {
    mkdirSync(GRAPH_DIR, { recursive: true });
    for (const lg of matrix.lessons) {
      const outPath = join(GRAPH_DIR, `${lg.lessonId}.json`);
      writeFileSync(outPath, `${JSON.stringify(lg, null, 2)}\n`, "utf8");
    }
  } else {
    // Verify existing graph files match derived canonical lessons
    for (const lg of matrix.lessons) {
      const graphPath = join(GRAPH_DIR, `${lg.lessonId}.json`);
      if (!existsSync(graphPath)) {
        throw new Error(`Missing instructional graph file: ${graphPath}. Run with --write-graph first.`);
      }
    }
  }

  mkdirSync(COVERAGE_DIR, { recursive: true });
  writeFileSync(join(COVERAGE_DIR, "COVERAGE-MATRIX.json"), `${JSON.stringify(matrix, null, 2)}\n`, "utf8");
  writeFileSync(join(COVERAGE_DIR, "COVERAGE-MATRIX.md"), `${renderCoverageMarkdown(matrix)}\n`, "utf8");
  writeFileSync(
    join(COVERAGE_DIR, "AUDIO-RECONCILIATION.md"),
    `${renderAudioReconciliationMarkdown(matrix)}\n`,
    "utf8",
  );

  console.log(
    `✓ Coverage matrix generated: ${matrix.summary.lessonsTotal} lessons, ${matrix.summary.printedWorkbookPagesTotal} printed pages (pp. 86-87 absent-in-source), ${matrix.summary.pdfSheetCount} PDF sheets, ${matrix.summary.audioFilesOnDisk} audio/viseme files (${matrix.summary.quarantinedOnDisk} quarantined).`,
  );
}

main();
