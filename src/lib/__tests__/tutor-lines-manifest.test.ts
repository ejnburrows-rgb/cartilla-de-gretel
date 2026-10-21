/**
 * Tutor line-bank manifest guard (spec §6 / §18.5).
 * Runs the canonical validator (scripts/validate-tutor-lines.mjs) against the
 * real manifest, then asserts each rejection case on in-memory fixtures.
 */
import { describe, it, expect } from "vitest";
import { join } from "node:path";
import tutorLines from "../../content/tutor-lines.json";
import pictureNameRecordings from "../../content/picture-name-recordings.json";
import {
  DRAFT_MARK,
  isRejectedSourcePath,
  validateTutorLines,
} from "../../../scripts/validate-tutor-lines.mjs";

const REPO_ROOT = process.cwd();
const approvedRecordings = new Set(
  (pictureNameRecordings.approved as Array<{ src: string }>).map((entry) => entry.src),
);

const realContext = {
  checkFiles: true,
  publicDir: join(REPO_ROOT, "public"),
  approvedRecordings,
};

const validApprovedEntry = {
  lineId: "l1-model-oso",
  lesson: 1,
  role: "word-model",
  text: "oso",
  src: "/audio/voz/vocabulario/oso.mp3",
  emotion: "warm",
  approval: "picture-name-recordings.json (owner-approved 2026)",
};

const validPendingEntry = {
  lineId: "l0-praise-01",
  lesson: 0,
  role: "praise",
  text: `${DRAFT_MARK} ¡Perfecto!`,
  emotion: "excited",
};

function fixture(overrides?: {
  approved?: unknown[];
  pending?: unknown[];
}): { approved: unknown[]; pending: unknown[] } {
  return {
    approved: overrides?.approved ?? [validApprovedEntry],
    pending: overrides?.pending ?? [validPendingEntry],
  };
}

describe("tutor-lines manifest: real manifest passes the validator", () => {
  it("validates with file existence and approved-recording checks on", () => {
    const result = validateTutorLines(tutorLines, realContext);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.counts.approved).toBe(43);
    expect(result.counts.pending).toBe(77);
  });

  it("has exactly 43 approved word models, all owner-approved picture-name recordings", () => {
    const approved = tutorLines.approved as Array<{ role: string; src: string; approval: string }>;
    expect(approved.length).toBe(43);
    for (const entry of approved) {
      expect(entry.role).toBe("word-model");
      expect(approvedRecordings.has(entry.src)).toBe(true);
      expect(entry.approval).toBe("picture-name-recordings.json (owner-approved 2026)");
    }
  });

  it("pending role counts match the spec §18.5 line bank", () => {
    const expected = {
      "greeting-first": 9,
      "greeting-return": 3,
      praise: 12,
      "praise-streak": 4,
      "praise-after-retry": 4,
      "close-miss": 4,
      "try-again": 6,
      confusion: 5,
      "wrong-word": 3,
      "repeat-ack": 2,
      "dont-know": 3,
      help: 3,
      "silence-nudge": 3,
      noise: 2,
      redirect: 3,
      "review-intro": 2,
      closing: 3,
      "idle-end": 1,
      "vowel-model": 5,
    } as Record<string, number>;
    const actual: Record<string, number> = {};
    for (const entry of tutorLines.pending as Array<{ role: string }>) {
      actual[entry.role] = (actual[entry.role] ?? 0) + 1;
    }
    expect(actual).toEqual(expected);
  });

  it("never references a rejected audio source", () => {
    for (const entry of tutorLines.approved as Array<{ src?: string; visemes?: string }>) {
      expect(isRejectedSourcePath(entry.src ?? "")).toBe(false);
      expect(isRejectedSourcePath(entry.visemes ?? "")).toBe(false);
    }
  });
});

describe("tutor-lines validator: bad fixtures are rejected", () => {
  it("accepts a well-formed fixture", () => {
    const result = validateTutorLines(fixture(), { checkFiles: false });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects an approved entry missing its approval reference", () => {
    const { approval, ...withoutApproval } = validApprovedEntry;
    void approval;
    const result = validateTutorLines(fixture({ approved: [withoutApproval] }), { checkFiles: false });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing its approval reference");
  });

  it("rejects an approved entry whose file does not exist under public/", () => {
    const ghost = { ...validApprovedEntry, src: "/audio/voz/vocabulario/no-existe.mp3" };
    const result = validateTutorLines(
      { approved: [ghost], pending: [] },
      { checkFiles: true, publicDir: join(REPO_ROOT, "public") },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("does not exist under public/");
  });

  it("rejects a duplicated lineId", () => {
    const result = validateTutorLines(fixture({ pending: [validPendingEntry, { ...validPendingEntry }] }), {
      checkFiles: false,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("duplicate lineId");
  });

  it("rejects an unknown role", () => {
    const result = validateTutorLines(
      fixture({ pending: [{ ...validPendingEntry, role: "cheer" }] }),
      { checkFiles: false },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain('unknown role "cheer"');
  });

  it("rejects rec_gretel_ and 67-clip ZIP source paths", () => {
    const recClip = { ...validApprovedEntry, src: "/audio/rec_gretel_0001.mp3" };
    const zipClip = { ...validApprovedEntry, lineId: "l1-model-oso", src: "/audio/Gretel_67_Audio_Lecciones_Listo/oso.mp3" };
    const byPath = validateTutorLines({ approved: [recClip, zipClip], pending: [] }, { checkFiles: false });
    expect(byPath.ok).toBe(false);
    expect(byPath.errors.length).toBeGreaterThanOrEqual(2);
    expect(byPath.errors.join("\n")).toContain("REJECTED audio source");
    expect(isRejectedSourcePath("/audio/rec_gretel_0001.mp3")).toBe(true);
    expect(isRejectedSourcePath("Gretel_67_Audio_Lecciones_Listo.zip")).toBe(true);
    expect(isRejectedSourcePath("/audio/voz/vocabulario/oso.mp3")).toBe(false);
  });

  it("rejects a word-model line whose src is not an owner-approved picture-name recording", () => {
    const result = validateTutorLines(
      {
        approved: [{ ...validApprovedEntry, src: "/audio/voz/tutor/leccion-1/oso.mp3" }],
        pending: [],
      },
      { checkFiles: false, approvedRecordings },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("not in the owner-approved picture-name recordings");
  });

  it("rejects a word-model lineId that breaks the l<n>-model-<word> format", () => {
    const result = validateTutorLines(
      fixture({ approved: [{ ...validApprovedEntry, lineId: "praise-oso" }] }),
      { checkFiles: false },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("l<n>-model-<word>");
  });

  it("rejects a pending entry that references audio", () => {
    const withSrc = { ...validPendingEntry, src: "/audio/voz/tutor/l0-praise-01.mp3" };
    const result = validateTutorLines(fixture({ pending: [withSrc] }), { checkFiles: false });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("pending entries must not reference audio");
  });

  it("rejects pending wording that is not marked DRAFT or reuse", () => {
    const result = validateTutorLines(
      fixture({ pending: [{ ...validPendingEntry, text: "¡Perfecto!" }] }),
      { checkFiles: false },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain(DRAFT_MARK);
  });

  it("rejects a manifest missing either array", () => {
    const noPending = validateTutorLines({ approved: [] }, { checkFiles: false });
    expect(noPending.ok).toBe(false);
    expect(noPending.errors.join("\n")).toContain('"pending"');
    const noApproved = validateTutorLines({ pending: [] }, { checkFiles: false });
    expect(noApproved.ok).toBe(false);
    expect(noApproved.errors.join("\n")).toContain('"approved"');
  });
});
