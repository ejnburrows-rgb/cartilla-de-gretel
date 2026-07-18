// animal-gallery.ts — curated roster of every REAL, book-faithful animal
// illustration in the cartilla, for the "Conoce a los animales" showcase page
// (src/routes/cartilla/animales.tsx).
//
// IMPORTANT: this list is hand-curated and hand-verified, NOT generated from
// public/cartilla/art/faithful/manifest.json. The manifest's per-entry metadata
// is not trustworthy on its own — several entries whose slug/word looked like a
// real animal (lobo, loro, vaca, delfín, yegua, cisne) actually point at
// mislabeled garbage crops (a drinking glass, dice, a blank page, a girl's
// hair, the octopus mascot, the fox again). Every `src` below was opened and
// visually confirmed to depict the labeled animal before being added here, and
// `src/content/__tests__/animal-gallery.test.ts` enforces that each file exists
// and is genuinely colored (not a grayscale/stub) so a future bad crop can't
// silently slip in.
//
// `lessonNumber` links each card back to the lesson that teaches the animal's
// key letter/sound (e.g. the fox "zorro" → the Z lesson), using the lesson
// numbering in src/content/consonants.json + the vowel lessons. `accent` is
// that lesson's own color, reused so the card chrome matches the rest of the
// app rather than inventing a new palette.

export interface AnimalGalleryEntry {
  /** Spanish word, shown as the card caption and spoken aloud on tap. */
  word: string;
  /** Real, verified, colored book crop under public/. */
  illustrationSrc: string;
  /** Lesson that teaches this animal's key letter/sound; the card links here. */
  lessonNumber: number;
  /** That lesson's own accent color (from consonants.json / lessons.json). */
  accent: string;
}

export const ANIMAL_GALLERY: AnimalGalleryEntry[] = [
  // Vowel-lesson animals
  { word: "abeja", illustrationSrc: "/cartilla/art/faithful/vocal-a/abeja.webp", lessonNumber: 3, accent: "#E63946" },
  { word: "araña", illustrationSrc: "/cartilla/art/faithful/vocal-a/arana.webp", lessonNumber: 3, accent: "#E63946" },
  { word: "ardilla", illustrationSrc: "/cartilla/art/faithful/vocal-a/ardilla.webp", lessonNumber: 3, accent: "#E63946" },
  { word: "águila", illustrationSrc: "/cartilla/art/faithful/leccion-1/aguila.webp", lessonNumber: 3, accent: "#E63946" },
  { word: "elefante", illustrationSrc: "/cartilla/art/faithful/vocal-e/elefante.webp", lessonNumber: 4, accent: "#F4A261" },
  { word: "erizo", illustrationSrc: "/cartilla/art/faithful/vocal-e/erizo.webp", lessonNumber: 4, accent: "#F4A261" },
  { word: "iguana", illustrationSrc: "/cartilla/art/faithful/vocal-i/iguana.webp", lessonNumber: 5, accent: "#2A9D8F" },
  { word: "oso", illustrationSrc: "/cartilla/art/faithful/vocal-o/oso.webp", lessonNumber: 2, accent: "#264653" },
  { word: "oveja", illustrationSrc: "/cartilla/art/faithful/vocal-o/oveja.webp", lessonNumber: 2, accent: "#264653" },

  // Consonant-lesson animals
  { word: "mono", illustrationSrc: "/cartilla/art/faithful/leccion-7-m/mono.webp", lessonNumber: 7, accent: "#E63946" },
  { word: "pez", illustrationSrc: "/cartilla/art/faithful/leccion-1/pez.webp", lessonNumber: 8, accent: "#F4A261" },
  { word: "sapo", illustrationSrc: "/cartilla/art/faithful/leccion-9-s/sapo.webp", lessonNumber: 9, accent: "#2A9D8F" },
  { word: "rana", illustrationSrc: "/cartilla/art/faithful/leccion-17-r/rana.webp", lessonNumber: 17, accent: "#E63946" },
  { word: "perro", illustrationSrc: "/cartilla/art/faithful/leccion-18-rr/perro.webp", lessonNumber: 18, accent: "#F4A261" },
  { word: "gusano", illustrationSrc: "/cartilla/art/faithful/leccion-19-g/gusano.webp", lessonNumber: 19, accent: "#2A9D8F" },
  { word: "jirafa", illustrationSrc: "/cartilla/art/faithful/leccion-21-j/jirafa.webp", lessonNumber: 21, accent: "#8338EC" },
  { word: "jicotea", illustrationSrc: "/cartilla/art/faithful/leccion-21-j/jicotea.webp", lessonNumber: 21, accent: "#8338EC" },
  { word: "conejo", illustrationSrc: "/cartilla/art/faithful/leccion-19-c/conejo.webp", lessonNumber: 22, accent: "#E63946" },
  { word: "zorro", illustrationSrc: "/cartilla/art/faithful/leccion-23-z/zorro.webp", lessonNumber: 24, accent: "#2A9D8F" },
];
