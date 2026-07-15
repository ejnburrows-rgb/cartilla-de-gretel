// standards-alignment.ts — per-lesson alignment to common literacy standards.
// Used by Codex reporting + admin export. Conservative — only codes that
// directly map to the syllable/phoneme work in each lesson are listed.
//
// CCSS  = Common Core State Standards (English Language Arts, K-1)
// TEKS  = Texas Essential Knowledge and Skills (Spanish Language Arts, K-1)
// CA-ELD = California English Language Development Standards (K-1)
//
// Spanish-specific codes use Spanish wording per state standards documents.

import { LESSONS } from "./lesson-meta";

export type StandardCode = {
  framework: "CCSS" | "TEKS" | "CA-ELD";
  code: string;
  descriptionEs: string;
  descriptionEn: string;
};

const VOWEL_PHONEMIC_AWARENESS: StandardCode[] = [
  {
    framework: "CCSS",
    code: "RF.K.2.B",
    descriptionEs: "Contar, pronunciar, combinar y segmentar s\u00edlabas en palabras habladas.",
    descriptionEn: "Count, pronounce, blend, and segment syllables in spoken words.",
  },
  {
    framework: "TEKS",
    code: "\u00a7110.2.b.2.A.iii",
    descriptionEs: "Identificar y producir palabras orales que comienzan con la misma s\u00edlaba.",
    descriptionEn: "Identify and produce spoken words that begin with the same syllable.",
  },
  {
    framework: "CA-ELD",
    code: "PI.K.5",
    descriptionEs: "Escuchar activamente y responder a vocabulario b\u00e1sico.",
    descriptionEn: "Listen actively and respond to basic vocabulary.",
  },
];

const CONSONANT_PHONICS: StandardCode[] = [
  {
    framework: "CCSS",
    code: "RF.K.3.A",
    descriptionEs:
      "Demostrar conocimiento b\u00e1sico de las correspondencias entre letras y sonidos.",
    descriptionEn: "Demonstrate basic knowledge of one-to-one letter\u2013sound correspondences.",
  },
  {
    framework: "CCSS",
    code: "RF.1.2.B",
    descriptionEs: "Combinar oralmente fonemas para formar palabras de una s\u00edlaba.",
    descriptionEn: "Orally produce single-syllable words by blending sounds.",
  },
  {
    framework: "TEKS",
    code: "\u00a7110.2.b.2.B.i",
    descriptionEs:
      "Identificar y unir sonidos iniciales, mediales y finales en palabras de una y dos s\u00edlabas.",
    descriptionEn:
      "Identify and blend initial, medial, and final sounds in one- and two-syllable words.",
  },
  {
    framework: "CA-ELD",
    code: "PI.1.6",
    descriptionEs: "Leer palabras de uso frecuente y palabras decodificables.",
    descriptionEn: "Read high-frequency and decodable words.",
  },
];

const INTRO_FOUNDATIONS: StandardCode[] = [
  {
    framework: "CCSS",
    code: "RF.K.1",
    descriptionEs:
      "Demostrar comprensi\u00f3n de la organizaci\u00f3n y caracter\u00edsticas del texto impreso.",
    descriptionEn: "Demonstrate understanding of the organization and basic features of print.",
  },
  {
    framework: "TEKS",
    code: "\u00a7110.2.b.1.A",
    descriptionEs: "Escuchar atentamente y compartir informaci\u00f3n e ideas.",
    descriptionEn: "Listen attentively and share information and ideas.",
  },
];

export const STANDARDS_BY_LESSON: Record<number, StandardCode[]> = (() => {
  const out: Record<number, StandardCode[]> = {};
  for (const lesson of LESSONS) {
    if (lesson.kind === "intro") {
      out[lesson.n] = INTRO_FOUNDATIONS;
    } else if (lesson.kind === "vowel") {
      out[lesson.n] = VOWEL_PHONEMIC_AWARENESS;
    } else {
      out[lesson.n] = CONSONANT_PHONICS;
    }
  }
  return out;
})();

export function standardsForLesson(n: number): StandardCode[] {
  return STANDARDS_BY_LESSON[n] ?? [];
}

export function standardsForFramework(
  framework: StandardCode["framework"],
  lessonN: number,
): StandardCode[] {
  return standardsForLesson(lessonN).filter((s) => s.framework === framework);
}
