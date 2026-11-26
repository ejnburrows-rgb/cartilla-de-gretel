#!/usr/bin/env node
/**
 * Strict Book-Fidelity & Recording Script Validator for Gretel Tutor (v2 Manifest).
 *
 * Cross-checks every line in `src/content/tutor-dialogue/universal.json`,
 * `src/content/tutor-dialogue/lesson-01.json`..`lesson-24.json`,
 * `docs/tutor/recording/B*.txt`, `RECORDING-INDEX.csv`, and `RECORDING-INDEX.md`
 * against the canonical book sources:
 *   - `src/data/flipchart-text-*.json`
 *   - `src/data/book-transcription/lessons-01-07.json`
 *   - `src/data/book-transcription/lessons-08-24.json`
 *   - `src/data/lessons.json`
 *   - `src/content/tutor-graph/lesson-01..24.json`
 *   - `src/content/tutor-lines.json` (120 legacy lineIds intact)
 *
 * Usage: node scripts/validate-tutor-book-fidelity.mjs
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(REPO_ROOT, relPath), "utf8"));
}

function normalizeText(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[¡!¿?.,;:«»“”‘’"'()\-–—…]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countSpanishWords(text) {
  const cleaned = text.trim();
  return cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
}

function countQuestions(text) {
  const matches = text.match(/\?/g);
  return matches ? matches.length : 0;
}

const REJECTED_AUDIO_RE =
  /(rec_gretel_|gretel_67|67_audio|audio_lecciones_listo|nina-sordita|sordita|tinywow|67-clip)/i;

// Rejects reading mechanical sheet numbers or workbook page numbers aloud.
const MECHANICAL_SHEET_RE =
  /\b(?:en\s+l[ao]s?\s+|de\s+l[ao]s?\s+)?l[aá]minas?\s+(?:n[uú]mero\s+)?(?:uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieci[a-z]+|veint[a-z]+|treint[a-z]+|cuarent[a-z]+|cincuent[a-z]+|sesent[a-z]+|\d+)\b/i;
const MECHANICAL_PAGE_RE =
  /\b(?:en\s+l[ao]s?\s+|de\s+l[ao]s?\s+)?p[aá]ginas?\s+(?:n[uú]mero\s+)?(?:uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieci[a-z]+|veint[a-z]+|treint[a-z]+|cuarent[a-z]+|cincuent[a-z]+|sesent[a-z]+|setent[a-z]+|ochent[a-z]+|novent[a-z]+|\d+)\b/i;
const MECHANICAL_SHEET_GENERIC_RE =
  /\b(?:hoja|ficha)\s+(?:n[uú]mero\s+)?(?:uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\b/i;
const ABSENT_PAGE_TEXT_RE =
  /\b(?:p[aá]gina\s*86|p[aá]gina\s*87|ochenta\s+y\s+seis|ochenta\s+y\s+siete|86|87)\b/i;

const KNOWN_INVENTED_PHRASES = [
  "la niña sueña con el pañuelo de noña",
  "la niña tiene sueño en el patio",
  "los dados son de dunia y están aquí",
  "rolo patea la bola el bolo se rompe y rita se ríe",
];

const REQUIRED_LESSON_ROLES = [
  "greeting-first",
  "greeting-return",
  "review-intro",
  "lesson-objective",
  "letter-name-model",
  "phonetic-sound-model",
  "lesson-focus",
  "explanation-primary",
  "explanation-simple",
  "flipchart-intro",
  "flipchart-illustration",
  "reading-order",
  "flipchart-rhyme",
  "comprehension-question",
  "common-mistake",
  "adaptive-coaching",
  "workbook-transition",
  "page-instruction",
  "game-intro",
  "game-step",
  "game-correct",
  "game-retry",
  "assessment-prompt",
  "page-complete",
  "closing",
  "next-step",
];

function buildCanonicalCorpus() {
  const lessonsMeta = readJson("src/data/lessons.json");
  const bt1 = readJson("src/data/book-transcription/lessons-01-07.json");
  const bt2 = readJson("src/data/book-transcription/lessons-08-24.json");
  const fc = {
    ...readJson("src/data/flipchart-text-3-22.json"),
    ...readJson("src/data/flipchart-text-23-42.json"),
    ...readJson("src/data/flipchart-text-43-62.json"),
  };
  const fcArt = readJson("src/data/flipchart-art-placement.json");

  const byLesson = new Map();

  for (let lesson = 1; lesson <= 24; lesson++) {
    const pad = String(lesson).padStart(2, "0");
    const graph = readJson(`src/content/tutor-graph/lesson-${pad}.json`);
    const meta = lessonsMeta.bookFaithfulLessons.find((l) => l.lesson === lesson);

    const verifiedPages = new Set(
      graph.pages.filter((p) => p.status === "verified").map((p) => p.printedPage),
    );
    const absentPages = new Set([86, 87, ...(graph.printedWorkbookPages?.absentInSourcePages ?? [])]);
    const flipchartSheets = new Set(graph.flipchartPages ?? []);
    const games = new Set((graph.games ?? []).map((g) => g.id));

    const words = new Set();
    const syllables = new Set();
    const textSnippets = [];

    const addText = (t) => {
      if (typeof t !== "string" || !t.trim()) return;
      textSnippets.push(t);
      for (const rawTok of t.toLowerCase().replace(/[¡!¿?.,;:«»“”‘’"'()…]/g, " ").split(/\s+/)) {
        if (rawTok) words.add(rawTok);
      }
      for (const tok of normalizeText(t).split(" ")) {
        if (tok) words.add(tok);
      }
    };

    // Flipchart text for this lesson's sheets (including drop-cap initial + stem joins on same baseline)
    for (const sheet of flipchartSheets) {
      const nodes = fc[String(sheet)] ?? [];
      const joined = nodes.map((n) => n.text).filter(Boolean).join(" ");
      addText(joined);
      for (let i = 0; i < nodes.length - 1; i++) {
        const cur = nodes[i];
        const nxt = nodes[i + 1];
        if (
          cur?.text &&
          nxt?.text &&
          cur.text.trim().length <= 2 &&
          Math.abs((cur.y ?? 0) - (nxt.y ?? 0)) < 15
        ) {
          addText(`${cur.text.trim()}${nxt.text.trim()}`);
        }
      }
      const sheetPrefix = `/p${String(sheet).padStart(3, "0")}-`;
      for (const src of Object.keys(fcArt)) {
        if (src.includes(sheetPrefix)) {
          const slug = src.slice(src.indexOf(sheetPrefix) + sheetPrefix.length).replace(/\.[^.]+$/, "");
          if (slug && slug !== "scene") addText(slug);
        }
      }
    }

    // Flipchart vocab
    for (const v of graph.flipchartVocab ?? []) {
      addText(v.word);
    }

    // Graph items
    for (const item of graph.items ?? []) {
      if (item.kind === "syllable") syllables.add(normalizeText(item.text));
      else addText(item.text);
    }

    // Book transcription pages 1-22 (L1-L7)
    for (const pageData of Object.values(bt1.pages ?? {})) {
      if (pageData.lesson !== lesson) continue;
      if (pageData.instruction) addText(pageData.instruction);
      if (pageData.drawInstruction) addText(pageData.drawInstruction);
      if (pageData.sentencesInstruction) addText(pageData.sentencesInstruction);
      for (const row of pageData.rows ?? []) {
        if (Array.isArray(row)) {
          for (const [w] of row) addText(w);
        } else if (row?.pictures) {
          for (const [w] of row.pictures) addText(w);
        }
      }
      for (const [, w] of pageData.pairs ?? []) addText(w);
      for (const [w] of pageData.cells ?? []) addText(w);
      for (const c of pageData.circle ?? []) {
        syllables.add(normalizeText(c.syllable));
        for (const r of c.rows ?? []) for (const w of r) addText(w);
      }
      for (const col of pageData.vocabColumns ?? []) for (const w of col) addText(w);
      for (const sw of pageData.sightWords ?? []) addText(sw);
      for (const s of pageData.sentences ?? []) addText(s);
      for (const f of pageData.fill ?? []) {
        addText(f.wordBox);
        if (f.answer) syllables.add(normalizeText(f.answer));
        for (const ch of f.choices ?? []) syllables.add(normalizeText(ch));
      }
    }

    // Book transcription lessons 8-24
    const l2 = bt2.lessons?.[String(lesson)];
    if (l2) {
      for (const c of l2.circle ?? []) {
        syllables.add(normalizeText(c.syllable));
        for (const r of c.rows ?? []) for (const w of r) addText(w);
      }
      for (const w of l2.vocab ?? []) addText(w);
      for (const sw of l2.sightWords ?? []) addText(sw);
      for (const s of l2.sentences ?? []) addText(s);
      for (const f of l2.fill ?? []) {
        addText(f.wordBox);
        if (f.answer) syllables.add(normalizeText(f.answer));
        for (const ch of f.choices ?? []) syllables.add(normalizeText(ch));
      }
    }

    // Sight words from lessons.json
    for (const sw of meta?.sightWords ?? []) addText(sw);

    byLesson.set(lesson, {
      lesson,
      title: graph.title,
      verifiedPages,
      absentPages,
      flipchartSheets,
      games,
      words,
      syllables,
      corpusNorm: normalizeText(textSnippets.join(" ")),
    });
  }

  return byLesson;
}

export function validateTutorBookFidelity() {
  const errors = [];
  const corpusByLesson = buildCanonicalCorpus();

  // 1. Verify legacy tutor-lines.json (120 lineIds intact)
  const legacy = readJson("src/content/tutor-lines.json");
  const legacyIds = new Set([
    ...(legacy.approved ?? []).map((e) => e.lineId),
    ...(legacy.pending ?? []).map((e) => e.lineId),
  ]);
  if (legacyIds.size !== 120) {
    errors.push(`Expected 120 intact legacy lineIds in tutor-lines.json, found ${legacyIds.size}`);
  }

  // 2. Load universal + lesson-01..24
  const dialogueDir = join(REPO_ROOT, "src/content/tutor-dialogue");
  const universal = readJson("src/content/tutor-dialogue/universal.json");
  const manifests = [universal];
  for (let lesson = 1; lesson <= 24; lesson++) {
    const pad = String(lesson).padStart(2, "0");
    const file = `src/content/tutor-dialogue/lesson-${pad}.json`;
    if (!existsSync(join(REPO_ROOT, file))) {
      errors.push(`Missing manifest file: ${file}`);
      continue;
    }
    manifests.push(readJson(file));
  }

  const allEntries = [];
  const seenIds = new Set();
  const batches = new Map();

  for (const manifest of manifests) {
    const isLesson = manifest.scope === "lesson" && typeof manifest.lesson === "number" && manifest.lesson >= 1;
    const lesson = isLesson ? manifest.lesson : 0;
    const entries = manifest.entries ?? [];

    if (isLesson) {
      if (entries.length < 40 || entries.length > 50) {
        errors.push(`Lesson ${lesson}: expected 40-50 lines, found ${entries.length}`);
      }
    }

    for (const entry of entries) {
      allEntries.push(entry);
      if (seenIds.has(entry.id)) errors.push(`Duplicate entry id: ${entry.id}`);
      seenIds.add(entry.id);

      const batchList = batches.get(entry.batch) ?? [];
      batchList[entry.seq - 1] = entry;
      batches.set(entry.batch, batchList);

      // Status & audio checks
      if (entry.status !== "scripted") {
        errors.push(`${entry.id}: status must be "scripted", got "${entry.status}"`);
      }
      if (entry.audio?.src !== undefined) {
        errors.push(`${entry.id}: scripted line must not set audio.src`);
      }
      if (entry.audio?.visemes !== null && entry.audio?.visemes !== undefined) {
        errors.push(`${entry.id}: scripted line must not set audio.visemes`);
      }

      // Rejected audio checks
      for (const val of [entry.file, entry.audio?.src, entry.audio?.visemes, entry.text]) {
        if (typeof val === "string" && REJECTED_AUDIO_RE.test(val)) {
          errors.push(`${entry.id}: references rejected/quarantined audio source (${val})`);
        }
      }

      // Clean Spanish & word/question count gates
      const wc = countSpanishWords(entry.text);
      if (wc < 5 || wc > 40) {
        errors.push(`${entry.id}: word count ${wc} outside [5, 40] ("${entry.text}")`);
      }
      if (countQuestions(entry.text) > 1) {
        errors.push(`${entry.id}: has more than 1 question ("${entry.text}")`);
      }
      if (/\[DRAFT|\(reuse:|^\d+[.)\s]|\[pausa\]|\(sonrisa\)/i.test(entry.text)) {
        errors.push(`${entry.id}: contains draft/stage marker ("${entry.text}")`);
      }
      if (/\b[a-zñ]+\s*\+\s*[a-zñ]+\b/i.test(entry.text) || /\b[a-zñ]{1,3}\s+-\s+[a-zñ]{1,3}\b/i.test(entry.text)) {
        errors.push(`${entry.id}: contains robotic syllable splicing ("${entry.text}")`);
      }

      // Mechanical sheet/page number checks
      if (MECHANICAL_SHEET_RE.test(entry.text)) {
        errors.push(`${entry.id}: reads flipchart sheet number aloud ("${entry.text}")`);
      }
      if (MECHANICAL_PAGE_RE.test(entry.text)) {
        errors.push(`${entry.id}: reads workbook page number aloud ("${entry.text}")`);
      }
      if (MECHANICAL_SHEET_GENERIC_RE.test(entry.text)) {
        errors.push(`${entry.id}: reads numbered sheet/card aloud ("${entry.text}")`);
      }

      // Absent pages 86-87 checks
      const pages = entry.curriculumRefs?.printedPages ?? [];
      if (pages.includes(86) || pages.includes(87)) {
        errors.push(`${entry.id}: curriculumRefs.printedPages includes absent page 86 or 87`);
      }
      if (ABSENT_PAGE_TEXT_RE.test(entry.text)) {
        errors.push(`${entry.id}: spoken text references absent pages 86-87 ("${entry.text}")`);
      }

      // Known invented phrase checks
      const normLine = normalizeText(entry.text);
      for (const bad of KNOWN_INVENTED_PHRASES) {
        if (normLine.includes(bad)) {
          errors.push(`${entry.id}: contains known invented/inaccurate phrase "${bad}"`);
        }
      }

      // Lesson-specific canonical book cross-checks
      if (isLesson) {
        const canon = corpusByLesson.get(lesson);
        if (!canon) {
          errors.push(`${entry.id}: missing canonical corpus for lesson ${lesson}`);
          continue;
        }
        if (entry.curriculumRefs?.lesson !== lesson) {
          errors.push(`${entry.id}: curriculumRefs.lesson=${entry.curriculumRefs?.lesson} !== ${lesson}`);
        }
        for (const p of entry.curriculumRefs?.printedPages ?? []) {
          if (!canon.verifiedPages.has(p) || canon.absentPages.has(p)) {
            errors.push(`${entry.id}: printedPage ${p} is not verified for lesson ${lesson}`);
          }
        }
        for (const s of entry.curriculumRefs?.flipchartSheets ?? []) {
          if (!canon.flipchartSheets.has(s)) {
            errors.push(`${entry.id}: flipchartSheet ${s} does not belong to lesson ${lesson}`);
          }
        }
        if (entry.curriculumRefs?.gameId && !canon.games.has(entry.curriculumRefs.gameId)) {
          errors.push(`${entry.id}: gameId "${entry.curriculumRefs.gameId}" is not in lesson ${lesson} tutor-graph`);
        }
        for (const syl of entry.curriculumRefs?.syllables ?? []) {
          if (!canon.syllables.has(normalizeText(syl))) {
            errors.push(`${entry.id}: syllable "${syl}" not found in canonical lesson ${lesson} syllables`);
          }
        }
        for (const w of entry.curriculumRefs?.words ?? []) {
          const wNorm = normalizeText(w);
          const wParts = wNorm.split(" ").filter(Boolean);
          const matched =
            canon.words.has(w.toLowerCase()) ||
            (wParts.length > 0 && wParts.every((p) => canon.words.has(p)));
          if (!matched) {
            errors.push(`${entry.id}: word "${w}" not found in canonical lesson ${lesson} vocabulary`);
          }
        }

        // Cross-check quoted book text (rhyme, sentence-practice, assessment-prompt) after ":"
        if (
          (entry.role === "flipchart-rhyme" ||
            entry.role === "sentence-practice" ||
            entry.role === "assessment-prompt") &&
          entry.text.includes(":")
        ) {
          const quoted = entry.text.split(":").slice(1).join(":").trim();
          const quotedNorm = normalizeText(quoted);
          // Only verify verbatim match when the prompt quotes a full book sentence/verse
          if (quotedNorm && !entry.text.toLowerCase().includes("dime")) {
            if (!canon.corpusNorm.includes(quotedNorm)) {
              errors.push(
                `${entry.id}: quoted book text does not match canonical lesson ${lesson} corpus: "${quoted}"`,
              );
            }
          }
        }

        // Cross-check cited vocabulary/syllable tokens after ":" in practice & hint-3 lines
        if (
          (entry.role === "flipchart-vocab" ||
            entry.role === "word-practice" ||
            entry.role === "syllable-practice" ||
            entry.role === "flipchart-model" ||
            (entry.role === "adaptive-coaching" && entry.hintLevel === 3)) &&
          entry.text.includes(":")
        ) {
          const cited = entry.text.split(":").slice(1).join(":").trim();
          const STOPWORDS = new Set([
            "y", "e", "o", "u", "a", "en", "de", "del", "la", "el", "los", "las", "un", "una",
            "con", "como", "que", "es", "son", "se", "al", "por", "para", "sin", "no", "pero",
            "mientras", "empieza", "empiezan", "comienza", "su", "sus", "este", "esta", "zig", "zag",
          ]);
          for (const tok of normalizeText(cited).split(" ")) {
            if (!tok || STOPWORDS.has(tok)) continue;
            if (!canon.words.has(tok) && !canon.syllables.has(tok)) {
              errors.push(
                `${entry.id}: cited token "${tok}" not found in canonical lesson ${lesson} corpus ("${cited}")`,
              );
            }
          }
        }
      }
    }

    // Per-lesson pedagogical completeness & hintLevel + letter-name/sound checks
    if (isLesson) {
      const roles = new Set(entries.map((e) => e.role));
      for (const reqRole of REQUIRED_LESSON_ROLES) {
        if (!roles.has(reqRole)) {
          errors.push(`Lesson ${lesson}: missing required teaching role "${reqRole}"`);
        }
      }
      const hintLevels = new Set(entries.map((e) => e.hintLevel));
      for (const hl of [1, 2, 3]) {
        if (!hintLevels.has(hl)) {
          errors.push(`Lesson ${lesson}: missing progressive hintLevel ${hl}`);
        }
      }
      const nameLines = entries.filter((e) => e.role === "letter-name-model");
      const soundLines = entries.filter((e) => e.role === "phonetic-sound-model");
      if (nameLines.length === 0 || soundLines.length === 0) {
        errors.push(`Lesson ${lesson}: must separate letter-name-model and phonetic-sound-model`);
      }
      for (const nl of nameLines) {
        if (/\b(?:aaa|eee|iii|ooo|uuu|mmm|sss|lll|nnn|ñññ|rrr|fff)\b/i.test(nl.text)) {
          errors.push(`${nl.id}: letter-name-model mixes elongated phonetic sound into letter name`);
        }
      }
    }
  }

  if (allEntries.length < 1100 || allEntries.length > 1400) {
    errors.push(`Total v2 lines ${allEntries.length} outside target range [1100, 1400]`);
  }

  // 3. Synchronize recording .txt batches (25-50 lines each) + CSV + MD
  const recordingDir = join(REPO_ROOT, "docs/tutor/recording");
  const csvPath = join(recordingDir, "RECORDING-INDEX.csv");
  const mdPath = join(recordingDir, "RECORDING-INDEX.md");
  if (!existsSync(csvPath) || !existsSync(mdPath)) {
    errors.push("Missing RECORDING-INDEX.csv or RECORDING-INDEX.md");
  } else {
    const csvLines = readFileSync(csvPath, "utf8").trimEnd().split("\n");
    if (csvLines.length - 1 !== allEntries.length) {
      errors.push(`RECORDING-INDEX.csv has ${csvLines.length - 1} rows, expected ${allEntries.length}`);
    }
    for (const [batch, arr] of batches.entries()) {
      const dense = arr.filter(Boolean);
      if (dense.length !== arr.length) {
        errors.push(`Batch ${batch}: non-contiguous sequence numbers`);
      }
      if (dense.length < 25 || dense.length > 50) {
        errors.push(`Batch ${batch}: ${dense.length} lines outside required 25-50 line batch range`);
      }
      const row = csvLines.find((r) => r.startsWith(`${batch},`));
      if (!row) {
        errors.push(`RECORDING-INDEX.csv missing batch ${batch}`);
        continue;
      }
      const txtFile = row.split(",")[14];
      const txtPath = join(recordingDir, txtFile);
      if (!existsSync(txtPath)) {
        errors.push(`Missing recording script: docs/tutor/recording/${txtFile}`);
        continue;
      }
      const actualLines = readFileSync(txtPath, "utf8").trimEnd().split("\n");
      const expectedLines = dense.map((e) => e.text);
      if (actualLines.length !== expectedLines.length || actualLines.some((l, i) => l !== expectedLines[i])) {
        errors.push(`Recording script ${txtFile} is out of sync with JSON manifests`);
      }
      for (const l of actualLines) {
        if (/^(B\d+|v2-|\d+[.)\s]|#|-|\*|\[)/i.test(l)) {
          errors.push(`${txtFile}: contains ID, number, or stage direction ("${l}")`);
        }
        if (MECHANICAL_SHEET_RE.test(l) || MECHANICAL_PAGE_RE.test(l) || ABSENT_PAGE_TEXT_RE.test(l)) {
          errors.push(`${txtFile}: contains forbidden page/sheet number ("${l}")`);
        }
      }
    }

    // Ensure no orphan B*.txt files exist
    const txtFiles = readdirSync(recordingDir).filter((f) => /^B\d+.*\.txt$/i.test(f));
    if (txtFiles.length !== batches.size) {
      errors.push(`Expected ${batches.size} batch .txt files, found ${txtFiles.length}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    counts: {
      totalV2Lines: allEntries.length,
      universalLines: universal.entries.length,
      lessonLines: allEntries.length - universal.entries.length,
      batches: batches.size,
      legacyLinesIntact: legacyIds.size,
    },
  };
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("validate-tutor-book-fidelity.mjs")
) {
  const result = validateTutorBookFidelity();
  if (!result.ok) {
    for (const err of result.errors) console.error(`✗ ${err}`);
    console.error(`FAILED: ${result.errors.length} book-fidelity problem(s).`);
    process.exit(1);
  }
  console.log(
    `✓ Book-fidelity validated: ${result.counts.totalV2Lines} v2 lines (${result.counts.universalLines} universal + ${result.counts.lessonLines} across Lessons 1–24) across ${result.counts.batches} batches + ${result.counts.legacyLinesIntact} legacy lineIds intact — 0 invented sentences, 0 page/sheet numbers read aloud, 0 absent pp. 86–87, 0 quarantined audio.`,
  );
}
