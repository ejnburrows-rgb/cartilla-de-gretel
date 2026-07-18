/**
 * animal-gallery.ts integrity — structural guard for the animals showcase
 * (/cartilla/animales).
 *
 * The pixel/color check (no grayscale, no stub) lives in the build-time guard
 * scripts/validate-art-color.mjs, which now also scans animal-gallery.ts — so
 * this test deliberately covers the fast, sharp-free structural invariants that
 * catch the *other* ways a bad entry sneaks in: a typo'd/missing path, a
 * 0-byte stub, a duplicate animal, or an out-of-range lesson link.
 */
import { describe, it, expect } from "vitest";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ANIMAL_GALLERY } from "../animal-gallery";

const publicRoot = join(process.cwd(), "public");
const MIN_BYTES = 1500; // same stub floor as art-slots-integrity.test.ts

describe("animal-gallery integrity", () => {
  it("has a non-trivial roster", () => {
    expect(ANIMAL_GALLERY.length).toBeGreaterThanOrEqual(15);
  });

  it("every entry points at a real, non-stub file under public/", () => {
    for (const a of ANIMAL_GALLERY) {
      expect(a.illustrationSrc.startsWith("/cartilla/art/faithful/"), a.word).toBe(true);
      const abs = join(publicRoot, a.illustrationSrc.replace(/^\//, ""));
      expect(existsSync(abs), `${a.word} missing ${a.illustrationSrc}`).toBe(true);
      expect(
        statSync(abs).size,
        `${a.word} stub ${a.illustrationSrc}`,
      ).toBeGreaterThanOrEqual(MIN_BYTES);
    }
  });

  it("has no duplicate animals", () => {
    const words = ANIMAL_GALLERY.map((a) => a.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("never links to the mislabeled/garbage crops proven wrong in QA", () => {
    // lobo/loro/vaca/delfín/yegua/cisne exist in manifest.json but their pixels
    // are wrong (a glass, dice, a blank page, hair, the octopus mascot, the
    // fox). They must never appear in the curated gallery.
    const banned = ["lobo", "loro", "vaca", "delfin", "delfín", "yegua", "cisne"];
    for (const a of ANIMAL_GALLERY) {
      expect(banned).not.toContain(a.word.toLowerCase());
      for (const b of banned) {
        expect(a.illustrationSrc.includes(`/${b}.webp`), `${a.word} uses banned crop`).toBe(false);
      }
    }
  });

  it("never links to the specific bad crop file found during this file's own review", () => {
    // leccion-18-rr/perro.webp was actually a photo of a donkey ("burro"),
    // not a dog — the real book has no dog illustration in lessons 17/18 at
    // all. The file was moved to
    // _needs-recrop/perro-actually-shows-burro-donkey.webp; this guard stops
    // it sneaking back into the gallery under a different word/entry.
    // (leccion-17-r/rana.webp was also flagged here for a bad crop, but has
    // since been re-cropped clean from the real source page and rejoined the
    // gallery above — see ART_BACKLOG.md.)
    const bannedCrops = ["leccion-18-rr/perro.webp"];
    for (const a of ANIMAL_GALLERY) {
      for (const bad of bannedCrops) {
        expect(a.illustrationSrc.endsWith(bad), `${a.word} uses a known-bad crop (${bad})`).toBe(
          false,
        );
      }
    }
  });

  it("every card links to a real lesson (1–24) and carries a hex accent", () => {
    for (const a of ANIMAL_GALLERY) {
      expect(a.lessonNumber, a.word).toBeGreaterThanOrEqual(1);
      expect(a.lessonNumber, a.word).toBeLessThanOrEqual(24);
      expect(a.accent, a.word).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
