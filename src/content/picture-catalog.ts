// picture-catalog.ts — maps every keyword to an image asset.
// Resolves to public/illustrations/<letter>/<keyword>.webp first,
// falls back to /illustrations/placeholder/<letter>.webp,
// then to an inline SVG of the letter.

import { LESSONS } from "./lesson-meta";

export type PictureRef = {
  key: string; // e.g. "m-mama"
  word: string; // "mam\u00e1"
  letter: string; // "m"
  primaryUrl: string; // /illustrations/m/mama.webp
  fallbackUrl: string; // /illustrations/placeholder/m.webp
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PICTURE_CATALOG: Record<string, PictureRef> = (() => {
  const out: Record<string, PictureRef> = {};
  for (const lesson of LESSONS) {
    const letter = lesson.letter.toLowerCase().replace(/[^a-z\u00f1]/g, "")[0] ?? "x";
    for (const word of lesson.keywords) {
      const slugged = slug(word);
      const key = `${letter}-${slugged}`;
      out[key] = {
        key,
        word,
        letter,
        primaryUrl: `/illustrations/${letter}/${slugged}.webp`,
        fallbackUrl: `/illustrations/placeholder/${letter}.webp`,
      };
    }
  }
  return out;
})();

export function pictureForKey(key: string): PictureRef | null {
  return PICTURE_CATALOG[key] ?? null;
}

export function pictureForWord(letter: string, word: string): PictureRef | null {
  const key = `${letter.toLowerCase()}-${slug(word)}`;
  return PICTURE_CATALOG[key] ?? null;
}
