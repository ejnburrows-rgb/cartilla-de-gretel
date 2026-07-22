// @vitest-environment node
/**
 * Art color + completeness guard (fast local mirror of the build gate).
 *
 * The actual invariant lives in scripts/validate-art-color.mjs and runs in the
 * build (package.json "build" → "validate:art-color"), so it gates CI. This test
 * imports the SAME functions and lists so the two can never drift, and gives
 * per-check feedback during `pnpm test`.
 *
 * Why it exists: existence/size checks (art-slots-integrity.test.ts) pass on a
 * fully-formed *grayscale* webp, so uncolored book drawings (uña, uniforme,
 * abeja, ...) shipped invisibly again and again. These checks read real pixels.
 *
 * Pinned to the node environment (above) because pixel decoding uses sharp.
 */
import { describe, it, expect } from "vitest";
import {
  findGrayscaleArt,
  findUntriagedGaps,
  findStaleAbsent,
  collectWiredSrcs,
} from "../../../scripts/validate-art-color.mjs";

describe("art color guard — no grayscale art ships to students", () => {
  it("every wired illustrationSrc is actually colored, not grayscale", async () => {
    const gray = await findGrayscaleArt();
    expect(
      gray.map((g) => `${g.rel} (spread ${g.spread.toFixed(1)})`),
      "grayscale art still wired",
    ).toEqual([]);
  }, 15000); // under full-suite load when other test files are competing for CPU. // isolation (~1.5s) but the default 5s timeout intermittently trips // Decodes ~100 real images concurrently (sharp/libvips) — fast in

  it("actually has crops to check (guard is wired to real data)", () => {
    expect(collectWiredSrcs().length).toBeGreaterThan(50);
  });
});

describe("art completeness guard — no silent emoji-only gaps", () => {
  it("every emoji-only consonant vocab word is triaged in CONFIRMED_ABSENT", () => {
    expect(
      findUntriagedGaps(),
      "emoji-only vocab with no illustration and no CONFIRMED_ABSENT entry — " +
        "crop the real book art or add it to the list in validate-art-color.mjs",
    ).toEqual([]);
  });

  it("CONFIRMED_ABSENT stays tidy — no listed word is actually wired now", () => {
    expect(findStaleAbsent(), "remove these from CONFIRMED_ABSENT — they are wired now").toEqual(
      [],
    );
  });
});
