import { afterEach, describe, expect, it, vi } from "vitest";
import { CATALOG } from "@/lib/lesson-catalog";
import { lessonGraphFor, type TutorItem } from "@/lib/tutor-content";
import { letterStrokes, teachingTarget } from "../classroom-writing";
import { animateClassroomFrame } from "../classroom-board-motion";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("classroom writing follows the curriculum", () => {
  it("covers every vowel and syllable target across the 24 lessons", () => {
    const lessonsWithBoardWork = new Set<number>();
    for (const lesson of CATALOG) {
      const graph = lessonGraphFor(lesson.n);
      expect(graph).toBeDefined();
      for (const item of graph!.items) {
        if (item.kind !== "vowel" && item.kind !== "syllable") continue;
        const target = teachingTarget(item, lesson);
        expect(target).toBe(item.text);
        for (const grapheme of Array.from(target!.normalize("NFC"))) {
          expect(letterStrokes(grapheme), item.id).not.toBeNull();
        }
        lessonsWithBoardWork.add(lesson.n);
      }
    }
    expect(lessonsWithBoardWork.size).toBe(24);
  });

  it("keeps the confirmed bee example in Lesson 3 and preserves accent strokes", () => {
    const bee = lessonGraphFor(3)!.items.find((item) => item.id === "l3-word-abeja")!;
    expect(teachingTarget(bee, CATALOG.find((lesson) => lesson.n === 3))).toBe("a");
    expect(teachingTarget({ ...bee, id: "l3-word-arbol" }, CATALOG.find((lesson) => lesson.n === 3))).toBeNull();
    expect(letterStrokes("á")?.length).toBe(letterStrokes("a")!.length + 1);
    expect(letterStrokes("ñ")?.length).toBe(letterStrokes("n")!.length + 1);
    expect(letterStrokes("n\u0303")).toEqual(letterStrokes("ñ"));
    expect(letterStrokes("ü")?.length).toBe(letterStrokes("u")!.length + 2);
    expect(letterStrokes("🙂")).toBeNull();
  });

  it("supports all 26 Spanish alphabet lowercase letters including h, k, q, w, x", () => {
    for (const letter of Array.from("abcdefghijklmnopqrstuvwxyzñáéíóúü")) {
      expect(letterStrokes(letter), letter).not.toBeNull();
    }
  });

  it("does not substitute a letter for workbook sentences", () => {
    const sentence: TutorItem = { id: "sample", lesson: 8, text: "Papá.", kind: "sentence", printedPage: 23 };
    expect(teachingTarget(sentence, CATALOG.find((lesson) => lesson.n === 8))).toBeNull();
  });
});

describe("classroom frame timing", () => {
  it("starts at zero when a frame timestamp predates the start of the stroke", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(performance, "now").mockReturnValue(100);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const paint = vi.fn();
    const done = animateClassroomFrame(10, paint, new AbortController().signal);
    frames.shift()!(95);
    frames.shift()!(111);
    await done;
    expect(paint.mock.calls).toEqual([[0], [1]]);
  });

  it("settles after a drawing failure so the session can fall back to a still board", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(performance, "now").mockReturnValue(100);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const done = animateClassroomFrame(10, () => { throw new Error("unavailable canvas"); },
      new AbortController().signal);
    const outcome = expect(done).rejects.toThrow("unavailable canvas");
    frames.shift()!(105);
    await outcome;
  });
});
