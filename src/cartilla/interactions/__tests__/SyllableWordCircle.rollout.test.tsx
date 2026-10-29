/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SyllableWordCircle, validSyllableStarts } from "../SyllableWordCircle";
import { setStudentSession } from "@/lib/student-session";
import { learnerStorageKey } from "@/lib/learner-storage";
import pageLayouts from "@/data/page-layouts.json";
import type { PageRegion } from "@/lib/book-faithful";

vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: () => true }));
vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/student-session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/student-session")>();
  return {
    ...actual,
    recordEvent: vi.fn(),
  };
});

import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";

const studentSession = (id: string) => ({
  studentId: id,
  classId: "class-1",
  studentName: `Student ${id}`,
  studentCode: id.toUpperCase(),
  className: "Aula 1",
});

function getRegionsForPage(pageNumber: number): PageRegion[] {
  const page = (pageLayouts.pages as Record<string, { regions: PageRegion[] }>)[String(pageNumber)];
  return (page?.regions ?? []).filter((r) => r.regionType === "syllable-match");
}

function mockWordRect(button: HTMLElement, width = 300) {
  vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: 48,
    width,
    height: 48,
    toJSON: () => ({}),
  } as DOMRect);
  const letters = [...button.querySelectorAll(".native-syllable__letter")];
  letters.forEach((letter, index) => vi.spyOn(letter, "getBoundingClientRect").mockReturnValue({
    left: index * width / letters.length, right: (index + 1) * width / letters.length,
    top: 0, bottom: 48, width: width / letters.length, height: 48,
  } as DOMRect));
}

describe("SyllableWordCircle Rollout: Consonants Curriculum (Lessons 6–10)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("Deliverable 1: Consonant Syllables Verification across Pages 20, 24, 28, 32, 40", () => {
    it("Lesson 6 / M (Page 20): verifies all 5 syllable groups (ma, me, mi, mo, mu)", () => {
      const regions = getRegionsForPage(20);
      expect(regions).toHaveLength(5);
      expect(regions.map((r) => r.syllable)).toEqual(["ma", "me", "mi", "mo", "mu"]);

      const maRegion = regions.find((r) => r.syllable === "ma")!;
      const words = maRegion.matchRows!.flat();
      expect(words.map((w) => w.word)).toEqual(["mami", "ama", "mamá", "mima", "Coloma", "Manolo"]);

      const { unmount } = render(<SyllableWordCircle region={maRegion} lessonId="7" />);
      expect(screen.getByRole("status").textContent).toContain("0 de 6 respuestas correctas");

      // Circle all words for "ma"
      for (const entry of words) {
        const btn = screen.getByRole("button", { name: entry.word });
        fireEvent.click(btn, { detail: 0 });
        act(() => vi.advanceTimersByTime(3000));
      }

      expect(screen.getByRole("status").textContent).toContain("6 de 6 respuestas correctas");
      expect(gretelEvent).toHaveBeenCalledWith("activity:complete");
      expect(recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonId: "7",
          kind: "exercise",
          meta: expect.objectContaining({ exercise: `syllable_circle_${maRegion.id}`, completed: true }),
        }),
      );
      unmount();
    });

    it("Lesson 7 / P (Page 24): verifies all 5 syllable groups (pa, pe, pi, po, pu)", () => {
      const regions = getRegionsForPage(24);
      expect(regions).toHaveLength(5);
      expect(regions.map((r) => r.syllable)).toEqual(["pa", "pe", "pi", "po", "pu"]);

      const paRegion = regions.find((r) => r.syllable === "pa")!;
      const words = paRegion.matchRows!.flat();
      expect(words.map((w) => w.word)).toEqual(["papá", "pupa", "mapa", "Papo", "¡upa!", "pala"]);

      const { unmount } = render(<SyllableWordCircle region={paRegion} lessonId="8" />);
      // Circle "papá" and "pupa"
      fireEvent.click(screen.getByRole("button", { name: "papá" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      fireEvent.click(screen.getByRole("button", { name: "pupa" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));

      expect(screen.getByRole("status").textContent).toContain("2 de 6 respuestas correctas");
      expect(screen.getByRole("button", { name: "papá" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "pupa" }).getAttribute("aria-pressed")).toBe("true");
      unmount();
    });

    it("Lesson 8 / S (Page 28): verifies all 5 syllable groups (sa, se, si, so, su)", () => {
      const regions = getRegionsForPage(28);
      expect(regions).toHaveLength(5);
      expect(regions.map((r) => r.syllable)).toEqual(["sa", "se", "si", "so", "su"]);

      const saRegion = regions.find((r) => r.syllable === "sa")!;
      const words = saRegion.matchRows!.flat();
      expect(words.map((w) => w.word)).toEqual(["masa", "casa", "pesa", "sala", "mesa", "sapo"]);

      const { unmount } = render(<SyllableWordCircle region={saRegion} lessonId="9" />);
      fireEvent.click(screen.getByRole("button", { name: "masa" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("status").textContent).toContain("1 de 6 respuestas correctas");
      unmount();
    });

    it("Lesson 10 / T (Page 32): verifies all 5 syllable groups (ta, te, ti, to, tu)", () => {
      const regions = getRegionsForPage(32);
      expect(regions).toHaveLength(5);
      expect(regions.map((r) => r.syllable)).toEqual(["ta", "te", "ti", "to", "tu"]);

      const taRegion = regions.find((r) => r.syllable === "ta")!;
      const words = taRegion.matchRows!.flat();
      expect(words.map((w) => w.word)).toEqual(["tapa", "Mota", "Tota", "seta", "peseta", "pata"]);

      const { unmount } = render(<SyllableWordCircle region={taRegion} lessonId="10" />);
      fireEvent.click(screen.getByRole("button", { name: "tapa" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("status").textContent).toContain("1 de 6 respuestas correctas");
      unmount();
    });

    it("Lesson 9 / L (Page 40): verifies all 5 syllable groups (la, le, li, lo, lu)", () => {
      const regions = getRegionsForPage(40);
      expect(regions).toHaveLength(5);
      expect(regions.map((r) => r.syllable)).toEqual(["la", "le", "li", "lo", "lu"]);

      const laRegion = regions.find((r) => r.syllable === "la")!;
      const words = laRegion.matchRows!.flat();
      expect(words.map((w) => w.word)).toEqual(["lata", "mala", "pala", "Lamas", "mula", "pila"]);

      const { unmount } = render(<SyllableWordCircle region={laRegion} lessonId="12" />);
      fireEvent.click(screen.getByRole("button", { name: "lata" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("status").textContent).toContain("1 de 6 respuestas correctas");
      unmount();
    });
  });

  describe("Deliverable 2: Approved Pencil Marks Overlay & Responsive Geometry", () => {
    it("places pencil mark circle precisely around the syllable substring inside word letters container", () => {
      const regions = getRegionsForPage(20);
      const maRegion = regions.find((r) => r.syllable === "ma")!;
      render(<SyllableWordCircle region={maRegion} />);

      // "Coloma": length 6, "ma" is at start index 4, span 2.
      // Expected: left = (4/6)*100% = 66.6667%, width = (2/6)*100% = 33.3333%
      const colomaBtn = screen.getByRole("button", { name: "Coloma" });
      mockWordRect(colomaBtn, 300);

      fireEvent.click(colomaBtn, { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));

      const mark = colomaBtn.querySelector(".native-syllable__mark") as HTMLElement;
      expect(mark).toBeTruthy();
      expect(mark.style.left).toBe(`${(4 / 6) * 100}%`);
      expect(mark.style.width).toBe(`${(2 / 6) * 100}%`);

      // Verify mark is inside .native-syllable__letters
      const lettersSpan = colomaBtn.querySelector(".native-syllable__letters");
      expect(lettersSpan?.contains(mark)).toBe(true);

      // Verify WorkbookPencilMark circle was rendered
      const pencilMark = mark.querySelector(".workbook-pencil-mark");
      expect(pencilMark).toBeTruthy();
      expect(pencilMark?.getAttribute("data-mark-type")).toBe("circle");
    });

    it("retries a wrong syllable inside a word without awarding credit", () => {
      const regions = getRegionsForPage(20);
      const maRegion = regions.find((r) => r.syllable === "ma")!;
      render(<SyllableWordCircle region={maRegion} />);

      const mamiBtn = screen.getByRole("button", { name: "mami" });
      mockWordRect(mamiBtn, 200);

      // Tap on the right side of "mami" (e.g. clientX: 180) where 'mi' is
      fireEvent.pointerUp(mamiBtn, { clientX: 180, pointerId: 1 });
      act(() => vi.advanceTimersByTime(3000));
      act(() => vi.advanceTimersByTime(100));

      expect(mamiBtn.getAttribute("aria-pressed")).toBe("false");
      expect(mamiBtn.querySelector(".native-syllable__mark")).toBeNull();
      expect(screen.getByRole("status").textContent).toContain("0 de 6");
      expect(recordEvent).not.toHaveBeenCalled();
    });

    it("uses rendered letter bounds and ignores button padding", () => {
      const maRegion = getRegionsForPage(20).find((r) => r.syllable === "ma")!;
      render(<SyllableWordCircle region={maRegion} />);
      const word = screen.getByRole("button", { name: "mami" });
      mockWordRect(word, 500);
      const bounds = [[350, 375], [375, 395], [395, 420], [420, 430]];
      word.querySelectorAll(".native-syllable__letter").forEach((letter, index) => {
        vi.spyOn(letter, "getBoundingClientRect").mockReturnValue({
          left: bounds[index][0], right: bounds[index][1], top: 10, bottom: 40,
        } as DOMRect);
      });
      fireEvent.pointerUp(word, { clientX: 20, clientY: 25, pointerId: 1 });
      act(() => vi.advanceTimersByTime(3000));
      expect(word.getAttribute("aria-pressed")).toBe("false");
      expect(word.querySelector(".native-syllable__mark")).toBeNull();

      // This is the actual m, even though button-relative division would call it mi.
      fireEvent.pointerUp(word, { clientX: 360, clientY: 25, pointerId: 2 });
      act(() => vi.advanceTimersByTime(3000));
      expect(word.getAttribute("aria-pressed")).toBe("true");
    });

    it("multi-occurrence word allows tapping either occurrence to circle it", () => {
      const regions = getRegionsForPage(24);
      const paRegion = regions.find((r) => r.syllable === "pa")!;
      render(<SyllableWordCircle region={paRegion} />);

      const papaBtn = screen.getByRole("button", { name: "papá" });
      mockWordRect(papaBtn, 200);

      // Tap first "pa" (clientX = 20)
      fireEvent.pointerUp(papaBtn, { clientX: 20, pointerId: 1 });
      act(() => vi.advanceTimersByTime(3000));
      expect(papaBtn.getAttribute("aria-pressed")).toBe("true");
      let mark = papaBtn.querySelector(".native-syllable__mark") as HTMLElement;
      expect(mark.style.left).toBe("0%");
      expect(mark.style.width).toBe("50%");

      // Tap again to toggle off
      fireEvent.pointerUp(papaBtn, { clientX: 20, pointerId: 2 });
      expect(papaBtn.getAttribute("aria-pressed")).toBe("false");

      // Tap second "pa" (clientX = 160)
      fireEvent.pointerUp(papaBtn, { clientX: 160, pointerId: 3 });
      act(() => vi.advanceTimersByTime(3000));
      expect(papaBtn.getAttribute("aria-pressed")).toBe("true");
      mark = papaBtn.querySelector(".native-syllable__mark") as HTMLElement;
      expect(mark.style.left).toBe("50%");
      expect(mark.style.width).toBe("50%");
    });
  });

  describe("Deliverable 3: Persistence across Reloads & Learner Isolation", () => {
    it("persists completed syllable marks and exact starts across unmount and remount (page reload)", () => {
      const regions = getRegionsForPage(20);
      const maRegion = regions.find((r) => r.syllable === "ma")!;

      act(() => setStudentSession(studentSession("student-1")));
      const { unmount } = render(<SyllableWordCircle region={maRegion} lessonId="7" />);

      // Mark words 0 ("mami") and 4 ("Coloma")
      fireEvent.click(screen.getByRole("button", { name: "mami" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      fireEvent.click(screen.getByRole("button", { name: "Coloma" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));

      expect(screen.getByRole("status").textContent).toContain("2 de 6 respuestas correctas");
      unmount();

      // Remount (simulating page reload for the same student)
      render(<SyllableWordCircle region={maRegion} lessonId="7" />);
      expect(screen.getByRole("status").textContent).toContain("2 de 6 respuestas correctas");
      expect(screen.getByRole("button", { name: "mami" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "Coloma" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "ama" }).getAttribute("aria-pressed")).toBe("false");

      // Verify exact syllable start positions survived
      const colomaMark = screen.getByRole("button", { name: "Coloma" }).querySelector(".native-syllable__mark") as HTMLElement;
      expect(colomaMark.style.left).toBe(`${(4 / 6) * 100}%`);
    });

    it("strictly isolates Student A and Student B: Student A's answers never appear for Student B", () => {
      const regions = getRegionsForPage(20);
      const maRegion = regions.find((r) => r.syllable === "ma")!;

      // 1. Student A logs in and marks 3 words
      act(() => setStudentSession(studentSession("student-a")));
      const { unmount } = render(<SyllableWordCircle region={maRegion} lessonId="7" />);

      fireEvent.click(screen.getByRole("button", { name: "mami" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      fireEvent.click(screen.getByRole("button", { name: "ama" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      fireEvent.click(screen.getByRole("button", { name: "mamá" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));

      expect(screen.getByRole("status").textContent).toContain("3 de 6 respuestas correctas");

      // 2. Switch to Student B while on the same screen
      act(() => setStudentSession(studentSession("student-b")));

      // Student B must see 0 marks
      expect(screen.getByRole("status").textContent).toContain("0 de 6 respuestas correctas");
      expect(screen.getByRole("button", { name: "mami" }).getAttribute("aria-pressed")).toBe("false");
      expect(screen.getByRole("button", { name: "ama" }).getAttribute("aria-pressed")).toBe("false");
      expect(screen.getByRole("button", { name: "mamá" }).getAttribute("aria-pressed")).toBe("false");

      // 3. Student B marks a different word: "Coloma"
      fireEvent.click(screen.getByRole("button", { name: "Coloma" }), { detail: 0 });
      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("status").textContent).toContain("1 de 6 respuestas correctas");
      expect(screen.getByRole("button", { name: "Coloma" }).getAttribute("aria-pressed")).toBe("true");

      // 4. Switch back to Student A
      act(() => setStudentSession(studentSession("student-a")));

      // Student A must see their 3 original marks restored intact
      expect(screen.getByRole("status").textContent).toContain("3 de 6 respuestas correctas");
      expect(screen.getByRole("button", { name: "mami" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "ama" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "mamá" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "Coloma" }).getAttribute("aria-pressed")).toBe("false");

      unmount();
    });

    it("clearing a marked answer updates storage and emits activity:retry", () => {
      const regions = getRegionsForPage(28);
      const saRegion = regions.find((r) => r.syllable === "sa")!;
      render(<SyllableWordCircle region={saRegion} lessonId="9" />);

      const masaBtn = screen.getByRole("button", { name: "masa" });
      mockWordRect(masaBtn, 200);

      // Circle the actual "sa" in "masa".
      fireEvent.pointerUp(masaBtn, { clientX: 150, pointerId: 1 });
      act(() => vi.advanceTimersByTime(3000));
      expect(masaBtn.getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("status").textContent).toContain("1 de 6 respuestas correctas");

      // Tap again to erase
      fireEvent.pointerUp(masaBtn, { clientX: 150, pointerId: 2 });
      expect(masaBtn.getAttribute("aria-pressed")).toBe("false");
      expect(screen.getByRole("status").textContent).toContain("0 de 6 respuestas correctas");
      expect(gretelEvent).toHaveBeenCalledWith("activity:retry", { reason: "work-cleared" });
    });
  });
});
