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
      expect(statSync(abs).size, `${a.word} stub ${a.illustrationSrc}`).toBeGreaterThanOrEqual(
        MIN_BYTES,
      );
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

  // NOTE: a prior revision of this file banned leccion-18-rr/perro.webp and
  // leccion-17-r/rana.webp by path — both were found wrong during earlier
  // review (perro was really the burro/donkey cell mislabeled; rana had a
  // numeral fragment bled in from a neighboring cell). Both have since been
  // re-cropped clean from their real source pages (rr-page-42's "Perri el
  // perrito" rhyme scene for perro; r-page-37 for rana) and re-verified
  // visually — see ART_BACKLOG.md. The path-ban is removed rather than kept
  // stale, since banning by path can't distinguish a fixed file from the
  // original bad one; "is this actually the right animal" is a semantic
  // check no structural test can make — that's what the visual QA pass in
  // ART_BACKLOG.md's history is for.

  it("every card links to a real lesson (1–24) and carries a hex accent", () => {
    for (const a of ANIMAL_GALLERY) {
      expect(a.lessonNumber, a.word).toBeGreaterThanOrEqual(1);
      expect(a.lessonNumber, a.word).toBeLessThanOrEqual(24);
      expect(a.accent, a.word).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
