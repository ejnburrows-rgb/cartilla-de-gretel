import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import tutorLinesJson from "../../content/tutor-lines.json";
import {
  countQuestions,
  countSpanishWords,
  DialogueLineV2Schema,
  DialogueManifestFileSchema,
  isRejectedAudioSource,
} from "../../content/tutor-dialogue/schema";
import {
  getDialogueEntry,
  getEntriesByBatch,
  getEntriesByLesson,
  getEntriesByRole,
  getPlayableEntries,
  loadDialogueManifest,
  toLegacyTutorLineEntries,
  V2_DIALOGUE_ENTRIES,
  V2_MANIFEST_FILES,
  validateAllDialogueManifests,
} from "../tutor-dialogue-manifest";

const REPO_ROOT = process.cwd();
const RECORDING_DIR = join(REPO_ROOT, "docs/tutor/recording");

describe("tutor-dialogue-manifest v2 schema & loader", () => {
  it("validates every v2 manifest file and legacy entries cleanly", () => {
    const report = validateAllDialogueManifests();
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.counts.v2Files).toBe(25); // universal.json + lesson-01..24.json
    expect(report.counts.legacyApproved).toBe(43);
    expect(report.counts.legacyPending).toBe(77);
    expect(report.counts.v2Entries).toBeGreaterThanOrEqual(1100);
    expect(report.counts.v2Entries).toBeLessThanOrEqual(1400);
    expect(report.counts.totalMerged).toBe(120 + report.counts.v2Entries);
  });

  it("preserves all 120 existing tutor-lines.json lineIds intact", () => {
    const legacyRaw = tutorLinesJson as {
      approved: Array<{ lineId: string; src: string }>;
      pending: Array<{ lineId: string }>;
    };
    const merged = loadDialogueManifest();
    const expectedIds = [
      ...legacyRaw.approved.map((e) => e.lineId),
      ...legacyRaw.pending.map((e) => e.lineId),
    ];
    expect(expectedIds).toHaveLength(120);
    for (const id of expectedIds) {
      expect(merged.byId.has(id)).toBe(true);
    }

    const projectedLegacyOnly = toLegacyTutorLineEntries({ includeV2: false });
    expect(projectedLegacyOnly).toHaveLength(120);
    expect(toLegacyTutorLineEntries({ includeV2: true })).toHaveLength(
      120 + V2_DIALOGUE_ENTRIES.length,
    );
  });

  it("keeps every newly scripted v2 line as status 'scripted' with zero active audio", () => {
    for (const entry of V2_DIALOGUE_ENTRIES) {
      expect(entry.status).toBe("scripted");
      expect(entry.audio.src).toBeUndefined();
      expect(entry.audio.visemes).toBeNull();
    }
    // Only the 43 owner-approved legacy recordings are playable.
    const playable = getPlayableEntries();
    expect(playable).toHaveLength(43);
    for (const entry of playable) {
      expect(entry.batch).toBe("LEGACY-APPROVED");
      expect(entry.audio.src).toMatch(/^\/audio\/voz\/vocabulario\//);
    }
  });

  it("never references any rejected audio source (67-clip ZIP, rec_gretel_*, nina-sordita)", () => {
    const merged = loadDialogueManifest();
    for (const entry of merged.allEntries) {
      expect(isRejectedAudioSource(entry.file)).toBe(false);
      expect(isRejectedAudioSource(entry.audio.src)).toBe(false);
      expect(isRejectedAudioSource(entry.audio.visemes)).toBe(false);
    }
    expect(isRejectedAudioSource("Gretel_67_Audio_Lecciones_Listo.zip")).toBe(true);
    expect(isRejectedAudioSource("/audio/rec_gretel_0001.mp3")).toBe(true);
    expect(isRejectedAudioSource("/audio/nina-sordita.mp3")).toBe(true);
  });

  it("never invents or references absent-in-source workbook pages 86-87", () => {
    for (const entry of V2_DIALOGUE_ENTRIES) {
      const pages = entry.curriculumRefs.printedPages ?? [];
      expect(pages).not.toContain(86);
      expect(pages).not.toContain(87);
      expect(entry.text).not.toMatch(/\bpágina\s*86\b|\bpágina\s*87\b/i);
    }
  });

  it("covers all 24 lessons (40-50 lines each) plus universal batches B001-B030", () => {
    expect(V2_MANIFEST_FILES[0].scope).toBe("universal");
    for (let lesson = 1; lesson <= 24; lesson++) {
      const file = V2_MANIFEST_FILES[lesson];
      expect(file.lesson).toBe(lesson);
      expect(file.entries.length).toBeGreaterThanOrEqual(40);
      expect(file.entries.length).toBeLessThanOrEqual(50);
      const lessonEntries = getEntriesByLesson(lesson);
      expect(lessonEntries.some((e) => e.curriculumRefs.lesson === lesson)).toBe(true);
      // 3-level progressive hints + distinct letter-name vs phonetic-sound models
      const ownEntries = file.entries;
      expect(ownEntries.some((e) => e.hintLevel === 1)).toBe(true);
      expect(ownEntries.some((e) => e.hintLevel === 2)).toBe(true);
      expect(ownEntries.some((e) => e.hintLevel === 3)).toBe(true);
      expect(ownEntries.some((e) => e.role === "letter-name-model")).toBe(true);
      expect(ownEntries.some((e) => e.role === "phonetic-sound-model")).toBe(true);
    }
    expect(getDialogueEntry("v2-b001-greet-first-01")?.batch).toBe("B001");
    expect(getEntriesByBatch("B001").length).toBe(36);
  });

  it("passes strict book-fidelity validation (no invented text, no sheet/page numbers read aloud)", () => {
    const out = execFileSync(
      process.execPath,
      [join(REPO_ROOT, "scripts/validate-tutor-book-fidelity.mjs")],
      { encoding: "utf8" },
    );
    expect(out).toMatch(/Book-fidelity validated:/);
    for (const entry of V2_DIALOGUE_ENTRIES) {
      expect(entry.text).not.toMatch(/La niña sueña con el pañuelo de Noña/i);
      expect(entry.text).not.toMatch(/\b(?:láminas?|páginas?)\s+(?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieci|veint|treint|cuarent|cincuent|sesent|setent|ochent|novent|\d+)/i);
    }
  });
});

describe("writing & pedagogical quality gates across all v2 scripts", () => {
  it("enforces 5-40 words (<75), <=1 question at a time, and clean Spanish only", () => {
    for (const entry of V2_DIALOGUE_ENTRIES) {
      const wc = countSpanishWords(entry.text);
      expect(wc, `${entry.id} word count`).toBeGreaterThanOrEqual(5);
      expect(wc, `${entry.id} word count`).toBeLessThanOrEqual(40);
      expect(wc, `${entry.id} max word count`).toBeLessThan(75);

      const qc = countQuestions(entry.text);
      expect(qc, `${entry.id} question count`).toBeLessThanOrEqual(1);

      expect(entry.text).not.toMatch(/\[DRAFT|\(reuse:|^\d+[.)\s]|\[pausa\]|\(sonrisa\)/i);
      // No robotic syllable splicing like "m + a" or "ma - má"
      expect(entry.text).not.toMatch(/\b[a-zñ]+\s*\+\s*[a-zñ]+\b/i);
      expect(entry.text).not.toMatch(/\b[a-zñ]{1,3}\s+-\s+[a-zñ]{1,3}\b/i);
    }
  });

  it("provides 5-12 distinct variations for frequent universal coaching intents", () => {
    const frequentRoles = [
      "greeting-first",
      "greeting-return",
      "praise",
      "praise-streak",
      "praise-after-retry",
      "close-miss",
      "try-again",
      "wrong-word",
      "confusion",
      "repeat-ack",
      "dont-know",
      "help",
      "silence-nudge",
      "noise",
      "redirect",
      "review-intro",
      "idle-end",
      "closing",
    ];
    for (const role of frequentRoles) {
      const universalPool = getEntriesByRole(role, 0).filter(
        (e) => !e.batch.startsWith("LEGACY-"),
      );
      expect(universalPool.length, `universal pool for ${role}`).toBeGreaterThanOrEqual(5);
      expect(universalPool.length, `universal pool for ${role}`).toBeLessThanOrEqual(12);
      const uniqueTexts = new Set(universalPool.map((e) => e.text));
      expect(uniqueTexts.size).toBe(universalPool.length);
    }
  });

  it("rejects scripted entries with active audio or pages 86-87 in schema validation", () => {
    const base = getDialogueEntry("v2-b001-praise-01")!;
    const badAudio = DialogueLineV2Schema.safeParse({
      ...base,
      status: "scripted",
      audio: { src: "/audio/voz/tutor/fake.mp3", sha256: null, durationMs: null, visemes: null },
    });
    expect(badAudio.success).toBe(false);

    const badPage = DialogueLineV2Schema.safeParse({
      ...base,
      curriculumRefs: { lesson: 23, printedPages: [86] },
    });
    expect(badPage.success).toBe(false);

    const badManifest = DialogueManifestFileSchema.safeParse({ version: 1, entries: [] });
    expect(badManifest.success).toBe(false);
  });
});

describe("recording scripts and index synchronization", () => {
  it("B001-universal.txt has 25-50 lines of clean Spanish ONLY", () => {
    const raw = readFileSync(join(RECORDING_DIR, "B001-universal.txt"), "utf8");
    const lines = raw.trimEnd().split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(25);
    expect(lines.length).toBeLessThanOrEqual(50);
    for (const line of lines) {
      expect(line.trim()).toBe(line);
      expect(line).not.toMatch(/^(B001|v2-|\d+[.)\s]|#|-|\*)/);
      expect(countSpanishWords(line)).toBeGreaterThanOrEqual(5);
    }
  });

  it("synchronizes every batch B001-B030 .txt file and RECORDING-INDEX.csv 1-to-1 with JSON manifests", () => {
    const csvPath = join(RECORDING_DIR, "RECORDING-INDEX.csv");
    const mdPath = join(RECORDING_DIR, "RECORDING-INDEX.md");
    expect(existsSync(csvPath)).toBe(true);
    expect(existsSync(mdPath)).toBe(true);

    const csvLines = readFileSync(csvPath, "utf8").trimEnd().split("\n");
    expect(csvLines.length - 1).toBe(V2_DIALOGUE_ENTRIES.length);

    const batches = new Map<string, string[]>();
    for (const entry of V2_DIALOGUE_ENTRIES) {
      const arr = batches.get(entry.batch) ?? [];
      arr[entry.seq - 1] = entry.text;
      batches.set(entry.batch, arr);
    }

    // Verify each batch's .txt file exists, has 25-50 lines, and matches line-for-line
    for (const [batch, expectedLines] of batches.entries()) {
      expect(expectedLines.length, `batch ${batch} size`).toBeGreaterThanOrEqual(25);
      expect(expectedLines.length, `batch ${batch} size`).toBeLessThanOrEqual(50);
      const indexMatch = csvLines.find((row) => row.startsWith(`${batch},`));
      expect(indexMatch, `CSV row for ${batch}`).toBeTruthy();
      const txtFile = indexMatch!.split(",")[14];
      const txtPath = join(RECORDING_DIR, txtFile);
      expect(existsSync(txtPath), `missing ${txtPath}`).toBe(true);
      const actualLines = readFileSync(txtPath, "utf8").trimEnd().split("\n");
      expect(actualLines).toEqual(expectedLines);
    }
  });
});
