/**
 * Colorization pass #70 — regression guard.
 *
 * Verifies:
 *  1. Semantic color tokens are defined in styles.css
 *  2. interactive-exercises.css uses var() refs, not bare hex, for state colors
 *  3. activity-mechanics.css uses var(--am-teal) not #457b9d
 *  4. focus-visible selectors exist on every interactive target class
 *  5. No graded state relies on color alone (non-color secondary cue present)
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../../../../");

function css(relPath: string): string {
  return readFileSync(join(ROOT, "src", relPath), "utf-8");
}

const stylesCss = css("styles.css");
const ixCss = css("styles/interactive-exercises.css");
const amCss = css("styles/activity-mechanics.css");

// ── 1. Semantic tokens defined ──────────────────────────────────────────────
describe("styles.css — semantic color tokens", () => {
  it("defines --color-correct", () => {
    expect(stylesCss).toMatch(/--color-correct\s*:/);
  });
  it("defines --color-incorrect", () => {
    expect(stylesCss).toMatch(/--color-incorrect\s*:/);
  });
  it("defines --color-correct-fg", () => {
    expect(stylesCss).toMatch(/--color-correct-fg\s*:/);
  });
  it("defines --color-incorrect-fg", () => {
    expect(stylesCss).toMatch(/--color-incorrect-fg\s*:/);
  });
});

// ── 2. interactive-exercises.css uses token refs, not bare hex ──────────────
describe("interactive-exercises.css — no bare hex for state colors", () => {
  it("does not use bare #10b981 without a var() wrapper", () => {
    const offenders = ixCss
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("/*"))
      .filter((l) => l.includes("#10b981") && !l.includes("var(--color-correct"));
    expect(offenders).toHaveLength(0);
  });

  it("does not use bare #f43f5e without a var() wrapper", () => {
    const offenders = ixCss
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("/*"))
      .filter((l) => l.includes("#f43f5e") && !l.includes("var(--color-incorrect"));
    expect(offenders).toHaveLength(0);
  });

  it("graded-correct badge uses var(--color-correct)", () => {
    expect(ixCss).toMatch(/graded-correct[^}]*background:\s*var\(--color-correct/s);
  });

  it("graded-wrong badge uses var(--color-incorrect)", () => {
    expect(ixCss).toMatch(/graded-wrong[^}]*background:\s*var\(--color-incorrect/s);
  });

  it("syllable graded-correct uses var(--color-correct)", () => {
    expect(ixCss).toMatch(/syllable__word\.graded-correct[^}]*var\(--color-correct/s);
  });

  it("fill graded-correct uses var(--color-correct)", () => {
    expect(ixCss).toMatch(/fill__choice\.graded-correct[^}]*var\(--color-correct/s);
  });
});

// ── 3. activity-mechanics.css uses --am-teal, not bare #457b9d ──────────────
describe("activity-mechanics.css — no bare #457b9d", () => {
  it("does not use bare #457b9d outside color-mix()", () => {
    const offenders = amCss
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("/*"))
      .filter((l) => l.includes("#457b9d") && !l.includes("color-mix"));
    expect(offenders).toHaveLength(0);
  });

  it("dibuja verb uses var(--am-teal)", () => {
    expect(amCss).toMatch(/am-dibuja__verb[^}]*color:\s*var\(--am-teal\)/s);
  });

  it("toggle button active uses var(--am-teal)", () => {
    expect(amCss).toMatch(/is-active[^}]*color:\s*var\(--am-teal\)/s);
  });
});

// ── 4. focus-visible selectors present on all interactive targets ────────────
describe("focus-visible outlines — keyboard navigation coverage", () => {
  it("fp-ix-cell has focus-visible (interactive-exercises.css)", () => {
    expect(ixCss).toMatch(/\.fp-ix-cell:focus-visible/);
  });
  it("fp-ix-check-btn has focus-visible", () => {
    expect(ixCss).toMatch(/\.fp-ix-check-btn:focus-visible/);
  });
  it("fp-ix-syllable__word has focus-visible", () => {
    expect(ixCss).toMatch(/\.fp-ix-syllable__word:focus-visible/);
  });
  it("fp-ix-fill__choice has focus-visible", () => {
    expect(ixCss).toMatch(/\.fp-ix-fill__choice:focus-visible/);
  });
  it("am-paint__swatch has focus-visible (activity-mechanics.css)", () => {
    expect(amCss).toMatch(/\.am-paint__swatch:focus-visible/);
  });
  it("am-paint__size has focus-visible", () => {
    expect(amCss).toMatch(/\.am-paint__size:focus-visible/);
  });
  it("am-dibuja__card has focus-visible", () => {
    expect(amCss).toMatch(/\.am-dibuja__card:focus-visible/);
  });
  it("am-lasso__target has focus-visible", () => {
    expect(amCss).toMatch(/\.am-lasso__target:focus-visible/);
  });
});

// ── 5. Non-color secondary cues for graded states ───────────────────────────
describe("graded states — non-color-only cues", () => {
  it("graded-correct badge shows check text content", () => {
    expect(ixCss).toMatch(/graded-correct[^}]*content:\s*['"]\u2713['"]/s);
  });
  it("graded-wrong badge shows x text content", () => {
    expect(ixCss).toMatch(/graded-wrong[^}]*content:\s*['"]\u2715['"]/s);
  });
  it("graded-missed uses dashed border-style (non-color cue)", () => {
    expect(ixCss).toMatch(/graded-missed[^}]*border-style:\s*dashed/s);
  });
  it("graded-wrong uses shake animation (non-color motion cue)", () => {
    expect(ixCss).toMatch(/graded-wrong[^}]*animation:\s*fpIxShake/s);
  });
});
