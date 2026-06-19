// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Asset-integrity guard. Self-hosted fonts are what make the app render
// correctly offline (the service worker can only cache same-origin files), so
// a missing or stubbed font file is a real, shippable bug — not a warning.

const root = (p: string) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));

// Every stylesheet that declares an @font-face pointing at /fonts/.
const FONT_STYLESHEETS = ["src/styles.css", "src/styles/themes.css"];

// Fonts that are precached by the service worker for offline use — these must
// be real font files, not placeholders.
const OFFLINE_CRITICAL = ["caveat-latin.woff2", "nunito-latin.woff2"];

function referencedFontFiles(): string[] {
  const found = new Set<string>();
  for (const sheet of FONT_STYLESHEETS) {
    const css = readFileSync(root(sheet), "utf-8");
    for (const m of css.matchAll(/url\(\s*['"]?\/fonts\/([^'")]+\.woff2)/g)) {
      found.add(m[1]);
    }
  }
  return [...found];
}

describe("self-hosted fonts", () => {
  it("declares at least the two offline-critical @font-face fonts", () => {
    const refs = referencedFontFiles();
    for (const f of OFFLINE_CRITICAL) {
      expect(refs, `${f} should be referenced via @font-face`).toContain(f);
    }
  });

  it("ships a real file on disk for every @font-face it references", () => {
    for (const file of referencedFontFiles()) {
      expect(existsSync(root(`public/fonts/${file}`)), `public/fonts/${file} is missing`).toBe(true);
    }
  });

  it("uses genuine (non-stub) font files for the offline-critical fonts", () => {
    for (const file of OFFLINE_CRITICAL) {
      const size = statSync(root(`public/fonts/${file}`)).size;
      // A real woff2 is tens of KB; the project has shipped 16-byte stubs before.
      expect(size, `public/fonts/${file} looks like a placeholder stub (${size} bytes)`).toBeGreaterThan(2048);
    }
  });

  // Known gap, intentionally surfaced rather than asserted-away:
  // public/fonts/OpenDyslexic.woff2 is currently a 16-byte stub, so the
  // dyslexia-friendly accessibility theme falls back to a system font. Replace
  // it with a real OpenDyslexic woff2, then promote this to a real assertion.
  it.todo("ships a real OpenDyslexic.woff2 so the dyslexia accessibility theme works");
});
