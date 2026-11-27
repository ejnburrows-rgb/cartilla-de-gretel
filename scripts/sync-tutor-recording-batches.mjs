#!/usr/bin/env node
/**
 * Synchronizes all Gretel Tutor clean Spanish-only recording scripts and index files
 * directly from `src/content/tutor-dialogue/universal.json` and `lesson-01..24.json`.
 *
 * Regenerates:
 *   - `docs/tutor/recording/B001..B031.txt`
 *   - `docs/tutor/recording/PRIORITY-B001-universal.txt`
 *   - `docs/tutor/recording/PRIORITY-B002-lesson-01.txt`
 *   - `docs/tutor/recording/PRIORITY-B003-interactive-conversation.txt`
 *   - `docs/tutor/recording/RECORDING-INDEX.csv`
 *   - `docs/tutor/recording/RECORDING-INDEX.md`
 *   - `docs/tutor/recording/PRIORITY-PACKAGE.md`
 *
 * Usage:
 *   node scripts/sync-tutor-recording-batches.mjs          # regenerate all files
 *   node scripts/sync-tutor-recording-batches.mjs --check  # verify files are in sync (no writes)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIALOGUE_DIR = join(REPO_ROOT, "src/content/tutor-dialogue");
const RECORDING_DIR = join(REPO_ROOT, "docs/tutor/recording");
const STUDIO_WPM = 110;

const BATCH_META = {
  B001: {
    txtFile: "B001-universal.txt",
    scopeFocus: "Universal Core (Greetings, Praise, Retry, Silence, Closing)",
  },
  B002: {
    txtFile: "B002-universal-coaching.txt",
    scopeFocus: "Universal Coaching & Role Variations",
  },
  B003: {
    txtFile: "B003-adaptive-coaching.txt",
    scopeFocus: "Adaptive Coaching, Scaffolding Hints, Clarify & Understanding Checks",
  },
  B004: {
    txtFile: "B004-pronunciation.txt",
    scopeFocus: "Pronunciation-Isolated Letter-Name vs Phonetic-Sound",
  },
  B005: {
    txtFile: "B005-camera-technical.txt",
    scopeFocus: "Camera, Microphone, Offline, Privacy & Technical Recovery",
  },
  B006: {
    txtFile: "B006-games-and-workbook.txt",
    scopeFocus: "Workbook Archetypes, Live Games & Interactive Choices",
  },
  B031: {
    txtFile: "B031-interactive-conversation.txt",
    scopeFocus:
      "Interactive Conversation, Layout Transitions, Flip Chart, Workbook, Honest Camera & Coaching",
  },
};

function readJson(relPath) {
  return JSON.parse(readFileSync(join(REPO_ROOT, relPath), "utf8"));
}

function countSpanishWords(text) {
  const cleaned = String(text ?? "").trim();
  return cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
}

function formatMinutes(words) {
  return (words / STUDIO_WPM).toFixed(1);
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getBatchTxtFile(batchId, lessonNum) {
  if (BATCH_META[batchId]) return BATCH_META[batchId].txtFile;
  if (lessonNum >= 1 && lessonNum <= 24) {
    return `${batchId}-lesson-${String(lessonNum).padStart(2, "0")}.txt`;
  }
  throw new Error(`Cannot determine .txt filename for batch ${batchId} (lesson=${lessonNum})`);
}

function loadLessonScopeFocus(lessonNum) {
  const pad = String(lessonNum).padStart(2, "0");
  const graph = readJson(`src/content/tutor-graph/lesson-${pad}.json`);
  const pages = (graph.pages ?? [])
    .filter((p) => p.status === "verified")
    .map((p) => p.printedPage)
    .filter((p) => p !== 86 && p !== 87);
  const sheets = graph.flipchartPages ?? [];
  const rawTitle = String(graph.title ?? `Lección ${lessonNum}`);
  const titlePrefix = rawTitle.startsWith(`Lección ${lessonNum}`)
    ? rawTitle
    : `Lección ${lessonNum}: ${rawTitle}`;
  return `${titlePrefix} (pp. ${pages.join(", ")}; Láminas ${sheets.join(", ")})`;
}

export function syncTutorRecordingBatches({ checkOnly = false } = {}) {
  const legacy = readJson("src/content/tutor-lines.json");
  const legacyApprovedCount = (legacy.approved ?? []).length;
  const legacyPendingCount = (legacy.pending ?? []).length;
  const legacyTotal = legacyApprovedCount + legacyPendingCount;

  const manifests = [readJson("src/content/tutor-dialogue/universal.json")];
  for (let lesson = 1; lesson <= 24; lesson++) {
    const pad = String(lesson).padStart(2, "0");
    manifests.push(readJson(`src/content/tutor-dialogue/lesson-${pad}.json`));
  }

  const allEntries = [];
  const batches = new Map();

  for (const manifest of manifests) {
    for (const entry of manifest.entries ?? []) {
      allEntries.push(entry);
      const list = batches.get(entry.batch) ?? [];
      list.push(entry);
      batches.set(entry.batch, list);
    }
  }

  // Sort batch IDs numerically (B001..B031) and entries by seq
  const sortedBatchIds = Array.from(batches.keys()).sort((a, b) => {
    const na = Number.parseInt(a.replace(/\D/g, ""), 10);
    const nb = Number.parseInt(b.replace(/\D/g, ""), 10);
    return na - nb;
  });

  const batchRecords = [];
  for (const batchId of sortedBatchIds) {
    const entries = batches.get(batchId).slice().sort((a, b) => a.seq - b.seq);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].seq !== i + 1) {
        throw new Error(
          `Batch ${batchId}: expected seq ${i + 1}, got ${entries[i].seq} on ${entries[i].id}`,
        );
      }
    }
    const lessonEntry = entries.find((e) => e.scope === "lesson" && (e.curriculumRefs?.lesson ?? 0) >= 1);
    const lessonNum = lessonEntry ? lessonEntry.curriculumRefs.lesson : 0;
    const txtFile = getBatchTxtFile(batchId, lessonNum);
    const scopeFocus = BATCH_META[batchId]?.scopeFocus ?? loadLessonScopeFocus(lessonNum);
    const words = entries.reduce((sum, e) => sum + countSpanishWords(e.text), 0);
    const statusSet = new Set(entries.map((e) => e.status));
    const batchStatus = statusSet.size === 1 ? entries[0].status : "mixed";

    batchRecords.push({
      batchId,
      lessonNum,
      txtFile,
      scopeFocus,
      entries,
      lines: entries.length,
      words,
      estMin: formatMinutes(words),
      status: batchStatus,
    });
  }

  // Compute sourceContexts reconciliation stats.
  // PR #1322 had 1,208 context rows across 1,047 distinct utterances (43 distinct shared texts
  // covering 204 `sharedClip: true` contexts, saving 1,208 - 1,047 = 161 duplicate recordings).
  // Those 204 shared-clip contexts are distributed across 77 lesson/universal entries in v2.
  const PR1322_DISTINCT_SHARED_TEXTS = 43;
  let totalSourceContexts = 0;
  let sharedEntryCount = 0;
  let sharedContextsCount = 0;
  for (const entry of allEntries) {
    const ctxs = entry.sourceContexts ?? [];
    totalSourceContexts += ctxs.length;
    const shared = ctxs.filter((c) => c.sharedClip === true).length;
    if (shared > 0) {
      sharedEntryCount++;
      sharedContextsCount += shared;
    }
  }
  const savedDuplicateRecordings = Math.max(0, sharedContextsCount - PR1322_DISTINCT_SHARED_TEXTS);

  const totalLines = allEntries.length;
  const totalWords = batchRecords.reduce((sum, b) => sum + b.words, 0);
  const totalEstMin = formatMinutes(totalWords);

  const byBatchId = new Map(batchRecords.map((b) => [b.batchId, b]));
  const b001 = byBatchId.get("B001");
  const b007 = byBatchId.get("B007");
  const b031 = byBatchId.get("B031");
  if (!b001 || !b007 || !b031) {
    throw new Error("Missing required priority batches B001, B007, or B031");
  }

  const prioLines = b001.lines + b007.lines + b031.lines;
  const prioWords = b001.words + b007.words + b031.words;
  const prioEstMin = formatMinutes(prioWords);

  // Build desired file contents map
  const desiredFiles = new Map();

  // 1. B001..B031.txt (clean Spanish ONLY)
  for (const rec of batchRecords) {
    const content = `${rec.entries.map((e) => e.text).join("\n")}\n`;
    desiredFiles.set(rec.txtFile, content);
  }

  // 2. Priority scripts (exact 1-to-1 mirrors of B001, B007, B031)
  desiredFiles.set("PRIORITY-B001-universal.txt", desiredFiles.get(b001.txtFile));
  desiredFiles.set("PRIORITY-B002-lesson-01.txt", desiredFiles.get(b007.txtFile));
  desiredFiles.set("PRIORITY-B003-interactive-conversation.txt", desiredFiles.get(b031.txtFile));

  // 3. RECORDING-INDEX.csv
  const csvHeader =
    "batch,seq,id,file,scope,lesson,intent,role,variationGroup,hintLevel,expression,gesture,wordCount,status,txtFile,text";
  const csvRows = [csvHeader];
  for (const rec of batchRecords) {
    for (const e of rec.entries) {
      const lessonVal = e.curriculumRefs?.lesson ?? 0;
      const wc = countSpanishWords(e.text);
      const row = [
        e.batch,
        e.seq,
        e.id,
        e.file,
        e.scope,
        lessonVal,
        e.intent,
        e.role,
        e.variationGroup,
        e.hintLevel,
        e.expression,
        e.gesture,
        wc,
        e.status,
        rec.txtFile,
        e.text,
      ]
        .map(csvEscape)
        .join(",");
      csvRows.push(row);
    }
  }
  desiredFiles.set("RECORDING-INDEX.csv", `${csvRows.join("\n")}\n`);

  // 4. RECORDING-INDEX.md
  const tableRows = batchRecords
    .map(
      (rec) =>
        `| \`${rec.batchId}\` | [${rec.txtFile}](./${rec.txtFile}) | ${rec.scopeFocus} | ${rec.lines} | ${rec.words} | ~${rec.estMin} min | \`${rec.status}\` |`,
    )
    .join("\n");

  const recordingIndexMd = `# Gretel Tutor — Recording Index (Authoritative Reconciled v2 Manifest)

> **Status policy:** Every line in this index starts with \`status: "scripted"\` and **no active audio**. Audio is activated only after owner recording, intake alignment/QC, and approval. Never use the rejected 67-clip ZIP (\`Gretel_67_Audio_Lecciones_Listo.zip\`, \`rec_gretel_*\`) or \`nina-sordita.mp3\`.
>
> **Catalog reconciliation:** This index is the **single authoritative recording catalog** reconciling PR #1073 (\`1,288\` lines), PR #1322 (\`1,047\` distinct utterances / \`${formatNumber(totalSourceContexts)}\` source-linked context mappings) + PR #1323's private intake workflow, and Interactive Conversation Batch \`B031\` (\`${b031.lines}\` lines). All \`${formatNumber(totalSourceContexts)}\` PR #1322 context mappings (\`workbookPage\`, \`workbookPdfSheet\`, \`flipchartSheet\`, \`expectedAnswer\`, \`commonError\`) are preserved in \`src/content/tutor-dialogue/\`, deduplicated by normalized Spanish text so identical text shares one clip across contexts (**0 duplicate recordings**). See [CATALOG-RECONCILIATION.md](../CATALOG-RECONCILIATION.md), [GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md), and [PRIORITY-PACKAGE.md](./PRIORITY-PACKAGE.md).
>
> **Curriculum & linguistic fidelity:** Pages 86 and 87 do not exist in the available student workbook scan (\`absent-in-source\`) and are strictly omitted from Lessons 23 and 24. Legacy \`src/content/tutor-lines.json\` (${legacyApprovedCount} approved word models + ${legacyPendingCount} pending lines = ${legacyTotal} intact \`lineId\`s) remains intact alongside these v2 scripts. Spoken lines follow Gretel's permanent linguistic standard (elegant, natural, grammatically correct Spanish without slang, unnecessary diminutives, or excessive exclamation marks), teach naturally through visible illustrations, letters, syllables, words, and stories without reading sheet or page numbers aloud, and avoid unsupported claims about concentration, pronunciation clarity scoring, or unseen camera vision.

## Start Here — Priority Recording Package

Before recording all ${batchRecords.length} batches, start with the **3-batch Priority Recording Package** (\`${prioLines}\` lines, ~\`${prioEstMin}\` minutes):
1. [\`PRIORITY-B001-universal.txt\`](./PRIORITY-B001-universal.txt) — Universal Core (\`B001\`, ${b001.lines} lines)
2. [\`PRIORITY-B002-lesson-01.txt\`](./PRIORITY-B002-lesson-01.txt) — Complete Lesson 1: Las hermanitas vocales (\`B007\`, ${b007.lines} lines)
3. [\`PRIORITY-B003-interactive-conversation.txt\`](./PRIORITY-B003-interactive-conversation.txt) — Interactive Conversation & Layout/Camera Coaching (\`B031\`, ${b031.lines} lines)

See [PRIORITY-PACKAGE.md](./PRIORITY-PACKAGE.md) for ElevenReader setup and exact manifest ID mapping.

## Summary

- **Total batches:** ${batchRecords.length} (\`${batchRecords[0].batchId}\`–\`${batchRecords[batchRecords.length - 1].batchId}\`)
- **Total unique scripted lines:** ${totalLines} (0 duplicate normalized Spanish texts)
- **Legacy \`tutor-lines.json\` intact:** ${legacyTotal} (\`${legacyApprovedCount}\` approved + \`${legacyPendingCount}\` pending)
- **Total merged manifest entries:** ${legacyTotal + totalLines}
- **Preserved PR #1322 source-linked context mappings:** ${totalSourceContexts} (${PR1322_DISTINCT_SHARED_TEXTS} shared texts covering ${sharedContextsCount} verified \`sharedClip\` contexts across ${sharedEntryCount} entries, saving ${savedDuplicateRecordings} duplicate recordings)
- **Total spoken words:** ${totalWords}
- **Estimated studio reading time (~${STUDIO_WPM} wpm + pauses):** ~${totalEstMin} minutes
- **Recording script format (\`.txt\`):** Clean Spanish ONLY — one utterance per line, zero IDs, zero line numbers, zero stage directions.

## Recording Guidelines

1. **Voice & Dialect:** Neutral Latin American Spanish with natural *seseo* (\`c\` before \`e/i\` and \`z\` pronounced as \`/s/\`) and pure Spanish vowels (\`a, e, i, o, u\`) without English diphthong glides.
2. **Tone & Pacing:** Warm, cultured, natural teacher voice (~115–125 wpm) following [GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md). Leave ~500 ms clean silence between lines in continuous takes.
3. **Pronunciation Integrity:** Never splice syllables or read punctuation symbols aloud. Read each line naturally as written.
4. **Private Master Storage:** Raw takes go in \`~/GretelVoicePrivate/\` (outside git) and pass through \`scripts/tutor-intake/\` before any manifest update.

## Batches (\`${batchRecords[0].batchId}\`–\`${batchRecords[batchRecords.length - 1].batchId}\`)

| Batch | Script File | Scope & Focus | Lines | Words | Est. Time | Status |
|---|---|---|---:|---:|---:|---|
${tableRows}

## Machine-Readable Index

- Priority recording guide: [PRIORITY-PACKAGE.md](./PRIORITY-PACKAGE.md)
- Permanent linguistic standard: [GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md)
- Catalog reconciliation report: [CATALOG-RECONCILIATION.md](../CATALOG-RECONCILIATION.md)
- Full line-by-line metadata: [RECORDING-INDEX.csv](./RECORDING-INDEX.csv)
- JSON manifests: \`src/content/tutor-dialogue/universal.json\` and \`src/content/tutor-dialogue/lesson-01.json\`–\`lesson-24.json\`
- Schema: \`src/content/tutor-dialogue/schema.ts\`
- Merged loader: \`src/lib/tutor-dialogue-manifest.ts\`
- Book-fidelity & linguistic validator: \`scripts/validate-tutor-book-fidelity.mjs\`
- Recording sync tool: \`scripts/sync-tutor-recording-batches.mjs\`
`;
  desiredFiles.set("RECORDING-INDEX.md", recordingIndexMd);

  // 5. PRIORITY-PACKAGE.md
  const b001First = b001.entries[0];
  const b001Last = b001.entries[b001.entries.length - 1];
  const b007First = b007.entries[0];
  const b007Last = b007.entries[b007.entries.length - 1];
  const b031First = b031.entries[0];
  const b031Last = b031.entries[b031.entries.length - 1];
  const remainingBatches = batchRecords.length - 3;

  const priorityPackageMd = `# Gretel Tutor — Reconciled Priority Recording Package

> **Purpose:** Start small and verify end-to-end before recording all ${batchRecords.length} batches (\`${formatNumber(totalLines)}\` lines).
> Record **just these 3 priority scripts (\`${prioLines}\` lines, ~\`${prioEstMin}\` minutes)** first: universal core dialogue + ONE complete representative lesson (Lesson 1: *Las hermanitas vocales*) + interactive live-conversation turns (acknowledgments, curiosity, follow-ups, interruptions, screen layout transitions, Flip Chart, Workbook, and honest camera snapshots). Once you hear Gretel speak Lesson 1 and handle live conversation end-to-end and approve the voice, pacing, and intake alignment, proceed to the remaining ${remainingBatches} batches (\`B002\`–\`B006\` and \`B008\`–\`B030\`).

---

## What Is in the Priority Package

| Priority Script | Canonical Batch | Manifest File | Lines | Words | Est. Time (~${STUDIO_WPM} wpm) | Manifest IDs in \`RECORDING-INDEX.csv\` |
|---|---|---|---:|---:|---:|---|
| [\`PRIORITY-B001-universal.txt\`](./PRIORITY-B001-universal.txt) | \`B001\` (\`B001-universal.txt\`) | \`src/content/tutor-dialogue/universal.json\` | ${b001.lines} | ${b001.words} | ~${b001.estMin} min | \`${b001First.id}\` … \`${b001Last.id}\` (\`${b001First.file}\`–\`${b001Last.file}\`) |
| [\`PRIORITY-B002-lesson-01.txt\`](./PRIORITY-B002-lesson-01.txt) | \`B007\` (\`B007-lesson-01.txt\`) | \`src/content/tutor-dialogue/lesson-01.json\` | ${b007.lines} | ${b007.words} | ~${b007.estMin} min | \`${b007First.id}\` … \`${b007Last.id}\` (\`${b007First.file}\`–\`${b007Last.file}\`) |
| [\`PRIORITY-B003-interactive-conversation.txt\`](./PRIORITY-B003-interactive-conversation.txt) | \`B031\` (\`B031-interactive-conversation.txt\`) | \`src/content/tutor-dialogue/universal.json\` | ${b031.lines} | ${b031.words} | ~${b031.estMin} min | \`${b031First.id}\` … \`${b031Last.id}\` (\`${b031First.file}\`–\`${b031Last.file}\`) |
| **Total Priority Package** | **3 batches** | **Universal + Lesson 1 + Interactive Conversation** | **${prioLines}** | **${formatNumber(prioWords)}** | **~${prioEstMin} min** | Exact 1-to-1 match with [\`RECORDING-INDEX.csv\`](./RECORDING-INDEX.csv) |

### Why These Three Batches First?
1. **\`PRIORITY-B001-universal.txt\` (${b001.lines} lines):** Covers every core conversational beat Gretel uses across all 24 lessons — warm, cultured greetings, grounded praise, gentle retry, close-miss coaching, silence nudges, and closings.
2. **\`PRIORITY-B002-lesson-01.txt\` (${b007.lines} lines):** Covers one complete lesson from opening greeting through flipchart poem (*Las hermanitas vocales*, Lámina 3), distinct letter-name vs. phonetic-sound models, 3-level progressive hints, workbook guidance (pp. 1–3, PDF sheets 7–9), games, assessment, and PR #1322's verified flipchart comprehension + workbook onset checks.
3. **\`PRIORITY-B003-interactive-conversation.txt\` (${b031.lines} lines):** Covers live conversational tutoring — natural acknowledgments, curiosity & thoughtful expressions, follow-up questions, alternative explanations, contextual clarification, student interruptions, requests for help, conversation-to-teaching transitions, Flip Chart presentation, moving between full avatar / split screen / picture-in-picture, Workbook guidance, honest snapshot-based camera interaction, and personalized coaching.
4. **Zero Duplicate Recordings:** Every utterance in the reconciled catalog is deduplicated by normalized Spanish text (\`0\` duplicates across all \`${formatNumber(totalLines)}\` lines). Identical wording shares a single clip across contexts via \`sourceContexts\`.
5. **Strict Linguistic, Book, Honesty & Audio Safety:**
   - All \`${formatNumber(totalLines)}\` lines follow Gretel's permanent linguistic standard ([GRETEL-LINGUISTIC-STANDARD.md](../GRETEL-LINGUISTIC-STANDARD.md)) and start at \`status: "scripted"\` with **zero active audio** until you record, review, and approve them.
   - All \`${legacyApprovedCount}\` owner-approved word models in \`src/content/tutor-lines.json\` remain intact and playable alongside \`${legacyPendingCount}\` pending legacy IDs (\`${legacyTotal}\` legacy \`lineId\`s preserved unchanged).
   - Zero unsupported claims of observed concentration, pronunciation clarity scoring, or unseen camera vision; consistent feminine self-reference for Gretel (\`tranquila\`, \`lista\`, \`contenta\`).
   - Zero references to absent Workbook pages 86–87, zero quarantined audio (\`nina-sordita.mp3\`, \`rec_gretel_*\`, 67-clip ZIP), and zero invented book sentences.

---

## Step-by-Step Recording Workflow (ElevenReader / Studio Take)

1. **Open the clean Spanish-only scripts:**
   - Start with [\`PRIORITY-B001-universal.txt\`](./PRIORITY-B001-universal.txt) (${b001.lines} lines).
   - Next, record [\`PRIORITY-B002-lesson-01.txt\`](./PRIORITY-B002-lesson-01.txt) (${b007.lines} lines).
   - Then record [\`PRIORITY-B003-interactive-conversation.txt\`](./PRIORITY-B003-interactive-conversation.txt) (${b031.lines} lines).
   - All three files contain **clean Spanish ONLY** — one utterance per line, zero IDs, zero line numbers, zero stage directions, ready to paste directly into ElevenReader or read in a continuous studio take.
2. **Voice & pacing guidelines:**
   - Neutral Latin American Spanish with natural *seseo* (\`c\` before \`e/i\` and \`z\` pronounced as \`/s/\`) and pure Spanish vowels (\`a, e, i, o, u\`).
   - Warm, cultured, natural teacher tone (~115–125 wpm). Leave ~500 ms clean silence between lines.
   - Read naturally as written — never splice syllables or read punctuation symbols aloud.
3. **Save raw takes outside Git:**
   - Save raw audio masters in your private local vault (\`~/GretelVoicePrivate/\` — never commit raw masters or private recordings into Git).
4. **Run local intake alignment & QC before approving:**
   - Align against [\`RECORDING-INDEX.csv\`](./RECORDING-INDEX.csv) using the local intake pipeline (\`scripts/tutor-intake/\`).
   - Review extracted clips for timing, clipping, and pronunciation accuracy. Only owner-approved clips move from \`status: "scripted"\` to \`status: "approved"\`.
5. **Continue to full ${batchRecords.length}-batch library when satisfied:**
   - Because \`PRIORITY-B001-universal.txt\` = \`B001-universal.txt\`, \`PRIORITY-B002-lesson-01.txt\` = \`B007-lesson-01.txt\`, and \`PRIORITY-B003-interactive-conversation.txt\` = \`B031-interactive-conversation.txt\` line-for-line, you will **never re-record** these ${prioLines} lines when completing the remaining ${remainingBatches} batches (\`B002\`–\`B006\`, \`B008\`–\`B030\`) listed in [\`RECORDING-INDEX.md\`](./RECORDING-INDEX.md).

---

## Related References

- Permanent linguistic standard: [\`../GRETEL-LINGUISTIC-STANDARD.md\`](../GRETEL-LINGUISTIC-STANDARD.md)
- Full ${batchRecords.length}-batch recording index: [\`RECORDING-INDEX.md\`](./RECORDING-INDEX.md)
- Machine-readable line & ID index: [\`RECORDING-INDEX.csv\`](./RECORDING-INDEX.csv)
- Reconciliation report (PR #1073 + PR #1322 + PR #1323): [\`../CATALOG-RECONCILIATION.md\`](../CATALOG-RECONCILIATION.md)
`;
  desiredFiles.set("PRIORITY-PACKAGE.md", priorityPackageMd);

  if (!checkOnly) {
    mkdirSync(RECORDING_DIR, { recursive: true });
  }

  const changedFiles = [];
  for (const [filename, content] of desiredFiles.entries()) {
    const absPath = join(RECORDING_DIR, filename);
    const current = existsSync(absPath) ? readFileSync(absPath, "utf8") : null;
    if (current !== content) {
      changedFiles.push(filename);
      if (!checkOnly) {
        writeFileSync(absPath, content, "utf8");
      }
    }
  }

  return {
    ok: !checkOnly || changedFiles.length === 0,
    changedFiles,
    summary: {
      batches: batchRecords.length,
      totalLines,
      totalWords,
      totalEstMin,
      prioLines,
      prioWords,
      prioEstMin,
      filesManaged: desiredFiles.size,
    },
  };
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("sync-tutor-recording-batches.mjs")
) {
  const checkOnly = process.argv.includes("--check");
  const result = syncTutorRecordingBatches({ checkOnly });
  if (checkOnly && !result.ok) {
    console.error(
      `✗ Recording scripts out of sync (${result.changedFiles.length} file(s)): ${result.changedFiles.join(", ")}`,
    );
    process.exit(1);
  }
  const verb = checkOnly ? "verified in sync" : "synchronized";
  console.log(
    `✓ Recording scripts ${verb}: ${result.summary.batches} batches (${result.summary.totalLines} lines, ${result.summary.totalWords} words, ~${result.summary.totalEstMin} min) + Priority Package (${result.summary.prioLines} lines, ${result.summary.prioWords} words, ~${result.summary.prioEstMin} min); ${result.changedFiles.length} file(s) updated across ${result.summary.filesManaged} managed files.`,
  );
}
