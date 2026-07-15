/**
 * Workbook art slots: every illustrationSrc must exist and be non-empty.
 * Empty stubs must not be referenced (honest pendiente instead).
 */
import { describe, it, expect } from "vitest";
import { existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pageLayouts from "@/data/page-layouts.json";
import consonants from "../consonants.json";

const publicRoot = join(process.cwd(), "public");
const MIN_BYTES = 1500;

function checkSrc(src: string | undefined, where: string) {
  if (!src) return;
  const abs = join(publicRoot, src.replace(/^\//, ""));
  expect(existsSync(abs), `${where} missing file ${src}`).toBe(true);
  const bytes = statSync(abs).size;
  expect(bytes, `${where} empty/stub ${src} (${bytes}b)`).toBeGreaterThanOrEqual(MIN_BYTES);
}

function walkLayout(obj: unknown, trail: string) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walkLayout(v, `${trail}[${i}]`));
    return;
  }
  const rec = obj as Record<string, unknown>;
  if (typeof rec.illustrationSrc === "string") {
    checkSrc(rec.illustrationSrc, trail);
  }
  for (const [k, v] of Object.entries(rec)) {
    if (k === "illustrationSrc") continue;
    walkLayout(v, `${trail}.${k}`);
  }
}

describe("workbook art slots integrity", () => {
  it("page-layouts illustrationSrc files exist and are non-empty", () => {
    walkLayout(pageLayouts.pages, "pages");
  });

  it("consonants.json vocab illustrationSrc files exist and are non-empty", () => {
    for (const c of consonants as Array<{
      lesson: number;
      vocab?: { word: string; illustrationSrc?: string }[];
    }>) {
      for (const v of c.vocab ?? []) {
        checkSrc(v.illustrationSrc, `L${c.lesson}:${v.word}`);
      }
    }
  });

  it("promoted needs-recrop crops are live at faithful destinations", () => {
    for (const rel of [
      "cartilla/art/faithful/leccion-1/taza.webp",
      "cartilla/art/faithful/leccion-1/pera.webp",
      "cartilla/art/faithful/vocal-a/anillo.webp",
      "cartilla/art/faithful/vocal-e/escoba.webp",
      "cartilla/art/faithful/leccion-1/manzana.webp",
      "cartilla/art/faithful/vocal-u/uniforme.webp",
    ]) {
      const abs = join(publicRoot, rel);
      expect(existsSync(abs), rel).toBe(true);
      expect(statSync(abs).size).toBeGreaterThanOrEqual(MIN_BYTES);
    }
  });

  it("lessons.json does not reference empty ojo/ola/iguana stubs", () => {
    const raw = readFileSync(join(process.cwd(), "src/content/lessons.json"), "utf8");
    expect(raw).not.toContain("vocal-o/ojos.webp");
    expect(raw).not.toContain("leccion-1/ola.webp");
    expect(raw).not.toContain("vocal-i/iguana.webp");
  });

  it("uña recovered from lineart u-page-17 is wired and non-empty", () => {
    const abs = join(publicRoot, "cartilla/art/faithful/vocal-u/uña.webp");
    expect(existsSync(abs)).toBe(true);
    expect(statSync(abs).size).toBeGreaterThanOrEqual(MIN_BYTES);
    const lessons = readFileSync(join(process.cwd(), "src/content/lessons.json"), "utf8");
    expect(lessons).toContain("vocal-u/uña.webp");
  });
});
