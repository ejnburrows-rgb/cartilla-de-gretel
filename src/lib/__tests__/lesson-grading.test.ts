import { describe, it, expect } from "vitest";
import {
  getWorkbookPagesForLesson,
  getPageLayout,
  type PageRegion,
  type PageGridCell,
  type SyllableMatchRow,
  type FillInBlankItem,
} from "@/lib/book-faithful";

/**
 * Mirrors `gradeOf` in `InteractivePageExercises.tsx` (unexported there):
 * a cell/entry with `correct === undefined` is ungraded and excluded from
 * both the correct- and wrong-answer checks below.
 */
function isCorrectPick(picked: boolean, correct: boolean | undefined): boolean | null {
  if (correct === undefined) return null;
  return picked === correct;
}

function evaluateCells(cells: PageGridCell[], pickedIdx: Set<number>) {
  let gradable = false;
  let allCorrect = true;
  cells.forEach((cell, i) => {
    const verdict = isCorrectPick(pickedIdx.has(i), cell.correct);
    if (verdict === null) return;
    gradable = true;
    if (!verdict) allCorrect = false;
  });
  return { gradable, allCorrect };
}

function correctCellPicks(cells: PageGridCell[]): Set<number> {
  const picks = new Set<number>();
  cells.forEach((cell, i) => {
    if (cell.correct) picks.add(i);
  });
  return picks;
}

/** Picks a known-wrong cell if one exists, otherwise picks nothing (missing every correct cell). */
function wrongCellPicks(cells: PageGridCell[]): Set<number> {
  const falseIdx = cells.findIndex((cell) => cell.correct === false);
  return falseIdx === -1 ? new Set<number>() : new Set([falseIdx]);
}

function evaluateSyllableMatch(rows: SyllableMatchRow[], pickedKeys: Set<string>) {
  let gradable = false;
  let allCorrect = true;
  rows.forEach((row, r) => {
    row.forEach((entry, w) => {
      const verdict = isCorrectPick(pickedKeys.has(`${r}-${w}`), entry.correct);
      if (verdict === null) return;
      gradable = true;
      if (!verdict) allCorrect = false;
    });
  });
  return { gradable, allCorrect };
}

function correctSyllablePicks(rows: SyllableMatchRow[]): Set<string> {
  const picks = new Set<string>();
  rows.forEach((row, r) =>
    row.forEach((entry, w) => {
      if (entry.correct) picks.add(`${r}-${w}`);
    }),
  );
  return picks;
}

function evaluateFillInBlank(items: FillInBlankItem[], pickedIdxByItem: Record<number, number>) {
  let gradable = false;
  let allCorrect = true;
  items.forEach((item, i) => {
    const correctIdx = item.choices.findIndex((choice) => choice.correct);
    if (correctIdx === -1) return;
    gradable = true;
    if (pickedIdxByItem[i] !== correctIdx) allCorrect = false;
  });
  return { gradable, allCorrect };
}

function correctFillInBlankPicks(items: FillInBlankItem[]): Record<number, number> {
  const picks: Record<number, number> = {};
  items.forEach((item, i) => {
    const correctIdx = item.choices.findIndex((choice) => choice.correct);
    if (correctIdx !== -1) picks[i] = correctIdx;
  });
  return picks;
}

function evaluateVowelPickOneRows(
  rows: Array<{ letter: string; cells: PageGridCell[] }>,
  pickedIdxByRow: number[],
) {
  let gradable = false;
  let allCorrect = true;
  rows.forEach((row, r) => {
    const correctIdx = row.cells.findIndex((cell) => cell.correct);
    if (correctIdx === -1) return;
    gradable = true;
    if (pickedIdxByRow[r] !== correctIdx) allCorrect = false;
  });
  return { gradable, allCorrect };
}

function correctVowelPickOnePicks(
  rows: Array<{ letter: string; cells: PageGridCell[] }>,
): number[] {
  return rows.map((row) => row.cells.findIndex((cell) => cell.correct));
}

function wrongVowelPickOnePicks(rows: Array<{ letter: string; cells: PageGridCell[] }>): number[] {
  return rows.map((row) => {
    const correctIdx = row.cells.findIndex((cell) => cell.correct);
    if (correctIdx === -1) return -1;
    const otherIdx = row.cells.findIndex((_, i) => i !== correctIdx);
    return otherIdx === -1 ? correctIdx : otherIdx;
  });
}

/**
 * All 24 lessons, driven off the same faithful `page-layouts.json` data (and
 * the same `getWorkbookPagesForLesson` lookup) the live app renders from.
 * Only lesson 1 grading had been hand-verified before this; this walks every
 * gradable region on every lesson's pages and asserts a correct answer set
 * grades fully correct while a deliberately wrong one does not — so a broken
 * `correct` flag anywhere in the content regresses a test, not just a
 * classroom demo.
 */
describe("lesson grading — real content across all 24 lessons", () => {
  for (let lessonNumber = 1; lessonNumber <= 24; lessonNumber++) {
    describe(`lesson ${lessonNumber}`, () => {
      const pages = getWorkbookPagesForLesson(lessonNumber);
      const regions: PageRegion[] = pages.flatMap((page) => getPageLayout(page.pageNumber) ?? []);
      let gradedRegionCount = 0;

      for (const region of regions) {
        switch (region.regionType) {
          case "picture-grid":
          case "vowel-line-match": {
            const cells = region.cells ?? [];
            const correct = evaluateCells(cells, correctCellPicks(cells));
            if (!correct.gradable) break;
            gradedRegionCount++;
            it(`${region.regionType} region "${region.id}" has at least one correct cell in its answer key`, () => {
              expect(cells.some((cell) => cell.correct === true)).toBe(true);
            });
            it(`${region.regionType} region "${region.id}" grades the correct answer as correct`, () => {
              expect(correct.allCorrect).toBe(true);
            });
            it(`${region.regionType} region "${region.id}" grades a wrong answer as wrong`, () => {
              const wrong = evaluateCells(cells, wrongCellPicks(cells));
              expect(wrong.allCorrect).toBe(false);
            });
            break;
          }
          case "vowel-pick-one": {
            const rows = region.vowelRows ?? [];
            const correct = evaluateVowelPickOneRows(rows, correctVowelPickOnePicks(rows));
            if (!correct.gradable) break;
            gradedRegionCount++;
            it(`vowel-pick-one region "${region.id}" has exactly one correct picture per row`, () => {
              rows.forEach((row) => {
                const correctCount = row.cells.filter((cell) => cell.correct === true).length;
                expect(correctCount).toBe(1);
              });
            });
            it(`vowel-pick-one region "${region.id}" grades the correct answer as correct`, () => {
              expect(correct.allCorrect).toBe(true);
            });
            it(`vowel-pick-one region "${region.id}" grades a wrong answer as wrong`, () => {
              const wrong = evaluateVowelPickOneRows(rows, wrongVowelPickOnePicks(rows));
              expect(wrong.allCorrect).toBe(false);
            });
            break;
          }
          case "vowel-match-all": {
            // No distractors by design (every pair is the single correct
            // match) — there is no "wrong answer" to grade, so this only
            // asserts the answer key itself is intact.
            const pairs = region.vowelPairs ?? [];
            if (pairs.length === 0) break;
            gradedRegionCount++;
            it(`vowel-match-all region "${region.id}" has every pair marked correct`, () => {
              expect(pairs.every((pair) => pair.correct === true)).toBe(true);
            });
            break;
          }
          case "syllable-match": {
            const rows = region.matchRows ?? [];
            const correct = evaluateSyllableMatch(rows, correctSyllablePicks(rows));
            if (!correct.gradable) break;
            gradedRegionCount++;
            it(`syllable-match region "${region.id}" has at least one correct word in every row`, () => {
              rows.forEach((row) => {
                expect(row.some((entry) => entry.correct === true)).toBe(true);
              });
            });
            it(`syllable-match region "${region.id}" grades the correct answer as correct`, () => {
              expect(correct.allCorrect).toBe(true);
            });
            it(`syllable-match region "${region.id}" grades a wrong answer (marking nothing) as wrong`, () => {
              const wrong = evaluateSyllableMatch(rows, new Set<string>());
              expect(wrong.allCorrect).toBe(false);
            });
            break;
          }
          case "fill-in-blank": {
            const items = region.fillItems ?? [];
            const correct = evaluateFillInBlank(items, correctFillInBlankPicks(items));
            if (!correct.gradable) break;
            gradedRegionCount++;
            it(`fill-in-blank region "${region.id}" has exactly one correct choice per item`, () => {
              items.forEach((item) => {
                const correctCount = item.choices.filter(
                  (choice) => choice.correct === true,
                ).length;
                expect(correctCount).toBe(1);
              });
            });
            it(`fill-in-blank region "${region.id}" grades the correct answer as correct`, () => {
              expect(correct.allCorrect).toBe(true);
            });
            it(`fill-in-blank region "${region.id}" grades a wrong answer (leaving it blank) as wrong`, () => {
              const wrong = evaluateFillInBlank(items, {});
              expect(wrong.allCorrect).toBe(false);
            });
            break;
          }
          default:
            break;
        }
      }

      it("has at least one gradable exercise", () => {
        expect(gradedRegionCount).toBeGreaterThan(0);
      });
    });
  }
});
