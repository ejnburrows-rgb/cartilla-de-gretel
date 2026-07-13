import { describe, it, expect } from "vitest";
import {
  getGuiaLesson,
  getGuiaManifestStatus,
  getRhymeTitle,
  getRhymeText,
  getEvaluationPage,
  hasRealObjectives,
} from "../loader";

describe("guia loader", () => {
  it("loads all 24 lessons", () => {
    for (let n = 1; n <= 24; n++) {
      expect(getGuiaLesson(n)).not.toBeNull();
    }
  });

  it("returns null for a lesson number that doesn't exist", () => {
    expect(getGuiaLesson(99)).toBeNull();
  });

  it("reports a real rhyme + real objectives for a fully-transcribed lesson (1)", () => {
    expect(getRhymeTitle(1)).toBe("Cinco hermanitas");
    expect(getEvaluationPage(1)).toBe(1);
    expect(hasRealObjectives(1)).toBe(true);
  });

  it("reports no rhyme text for a lesson whose rhyme title exists but body doesn't (14 has none missing; 16 has a real title but no text)", () => {
    // Lesson 1's rhyme text is null (title-only, never transcribed) even
    // though objectives/motivation/script are real — the loader must not
    // conflate "lesson has real content" with "this specific field is real".
    expect(getRhymeTitle(1)).toBe("Cinco hermanitas");
    expect(getRhymeText(1)).toBeNull();
  });

  it("surfaces the real rhyme for a partial lesson (17) without real objectives", () => {
    expect(getRhymeTitle(17)).toBe("La rosca de Manolo");
    expect(getRhymeText(17)).toContain("La r para la rama");
    expect(hasRealObjectives(17)).toBe(false);
  });

  it("surfaces the real rhyme for lesson 18 (rr) transcribed from in-repo scans", () => {
    expect(getRhymeTitle(18)).toBe("¡Rápido arriba!");
    expect(getRhymeText(18)).toContain("Barri el burrito");
  });

  it("surfaces the real L15 rhyme transcribed from student-book scan (b-page-33)", () => {
    expect(getRhymeTitle(15)).toBe("Sube la bola");
    expect(getRhymeText(15)).toContain("Bebo batea la bola");
    expect(hasRealObjectives(15)).toBe(true);
  });

  it("does not invent a rhyme for a lesson where none was transcribed (16)", () => {
    expect(getRhymeTitle(16)).toBeNull();
  });

  it("reads the manifest status for transcribed vs partial lessons", () => {
    expect(getGuiaManifestStatus(1)).toBe("transcribed");
    expect(getGuiaManifestStatus(17)).toBe("rhyme_only_no_teacher_guide_source");
    expect(getGuiaManifestStatus(18)).toBe("rhyme_only_no_teacher_guide_source");
  });

  it("all 24 lessons have a real, non-null evaluation page number (deterministic pattern)", () => {
    for (let n = 1; n <= 24; n++) {
      expect(getEvaluationPage(n)).toBe(n);
    }
  });
});
