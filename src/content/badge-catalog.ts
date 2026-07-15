// badge-catalog.ts — catalog of badges shown to students + families.
// Badge AWARDING logic lives in src/lib/badge-rules.ts (other lane).
// This file only owns the VISUAL identity + bilingual copy + criteria text.

export type BadgeId =
  | "first-page"
  | "first-lesson"
  | "vowel-master"
  | "consonant-explorer"
  | "streak-3"
  | "streak-7"
  | "streak-14"
  | "streak-30"
  | "perfect-page"
  | "reading-aloud"
  | "home-helper"
  | "halfway"
  | "cartilla-complete";

export type Badge = {
  id: BadgeId;
  nameEs: string;
  nameEn: string;
  emoji: string;
  color: string;
  descriptionEs: string;
  descriptionEn: string;
  criteriaEs: string;
  criteriaEn: string;
};

export const BADGES: Badge[] = [
  {
    id: "first-page",
    nameEs: "Primera p\u00e1gina",
    nameEn: "First page",
    emoji: "\ud83c\udf31",
    color: "#2A9D8F",
    descriptionEs: "\u00a1Tu primera p\u00e1gina completada!",
    descriptionEn: "Your first page complete!",
    criteriaEs: "Completa una p\u00e1gina.",
    criteriaEn: "Complete one page.",
  },
  {
    id: "first-lesson",
    nameEs: "Primera lecci\u00f3n",
    nameEn: "First lesson",
    emoji: "\ud83c\udf93",
    color: "#264653",
    descriptionEs: "Una lecci\u00f3n entera completada.",
    descriptionEn: "One full lesson complete.",
    criteriaEs: "Completa todas las p\u00e1ginas de una lecci\u00f3n.",
    criteriaEn: "Complete every page of a lesson.",
  },
  {
    id: "vowel-master",
    nameEs: "Maestra de vocales",
    nameEn: "Vowel master",
    emoji: "\ud83c\udfb5",
    color: "#E63946",
    descriptionEs: "Dominaste las cinco vocales.",
    descriptionEn: "Mastered all five vowels.",
    criteriaEs: "Termina las lecciones 2-6 con nivel Bien o mejor.",
    criteriaEn: "Finish lessons 2-6 at Bien level or higher.",
  },
  {
    id: "consonant-explorer",
    nameEs: "Explorador de consonantes",
    nameEn: "Consonant explorer",
    emoji: "\ud83e\udded",
    color: "#F4A261",
    descriptionEs: "Empezaste el mundo de las consonantes.",
    descriptionEn: "You started the consonant world.",
    criteriaEs: "Completa la lecci\u00f3n 7 (Mm).",
    criteriaEn: "Complete lesson 7 (Mm).",
  },
  {
    id: "streak-3",
    nameEs: "3 d\u00edas seguidos",
    nameEn: "3-day streak",
    emoji: "\ud83d\udd25",
    color: "#F4A261",
    descriptionEs: "Practicaste 3 d\u00edas seguidos.",
    descriptionEn: "Practiced 3 days in a row.",
    criteriaEs: "Practica 3 d\u00edas seguidos.",
    criteriaEn: "Practice 3 days in a row.",
  },
  {
    id: "streak-7",
    nameEs: "1 semana",
    nameEn: "1-week streak",
    emoji: "\u26a1",
    color: "#E63946",
    descriptionEs: "\u00a1Una semana entera!",
    descriptionEn: "A whole week!",
    criteriaEs: "Practica 7 d\u00edas seguidos.",
    criteriaEn: "Practice 7 days in a row.",
  },
  {
    id: "streak-14",
    nameEs: "2 semanas",
    nameEn: "2-week streak",
    emoji: "\ud83c\udf1f",
    color: "#8338EC",
    descriptionEs: "\u00a1Dos semanas seguidas!",
    descriptionEn: "Two weeks straight!",
    criteriaEs: "Practica 14 d\u00edas seguidos.",
    criteriaEn: "Practice 14 days in a row.",
  },
  {
    id: "streak-30",
    nameEs: "1 mes",
    nameEn: "1-month streak",
    emoji: "\ud83c\udfc6",
    color: "#FFD166",
    descriptionEs: "\u00a1Un mes entero!",
    descriptionEn: "A whole month!",
    criteriaEs: "Practica 30 d\u00edas seguidos.",
    criteriaEn: "Practice 30 days in a row.",
  },
  {
    id: "perfect-page",
    nameEs: "P\u00e1gina perfecta",
    nameEn: "Perfect page",
    emoji: "\u2728",
    color: "#2A9D8F",
    descriptionEs: "100% sin errores en una p\u00e1gina.",
    descriptionEn: "100% with no errors on a page.",
    criteriaEs: "Termina una p\u00e1gina sin errores.",
    criteriaEn: "Finish a page with no errors.",
  },
  {
    id: "reading-aloud",
    nameEs: "Lector\u200ba en voz alta",
    nameEn: "Read aloud",
    emoji: "\ud83d\udcd6",
    color: "#264653",
    descriptionEs: "Leiste una p\u00e1gina de lectura.",
    descriptionEn: "You read a reading page.",
    criteriaEs: "Completa una p\u00e1gina de lectura.",
    criteriaEn: "Complete a reading page.",
  },
  {
    id: "home-helper",
    nameEs: "Ayudante en casa",
    nameEn: "Home helper",
    emoji: "\ud83c\udfe1",
    color: "#F4A261",
    descriptionEs: "Practicaste con tu familia.",
    descriptionEn: "Practiced with your family.",
    criteriaEs: "Sesi\u00f3n marcada por la familia.",
    criteriaEn: "Session marked by family.",
  },
  {
    id: "halfway",
    nameEs: "Mitad del libro",
    nameEn: "Halfway there",
    emoji: "\ud83d\udcaa",
    color: "#8338EC",
    descriptionEs: "\u00a1Vas por la mitad de la cartilla!",
    descriptionEn: "You're halfway through!",
    criteriaEs: "Completa 45 p\u00e1ginas.",
    criteriaEn: "Complete 45 pages.",
  },
  {
    id: "cartilla-complete",
    nameEs: "\u00a1Cartilla completa!",
    nameEn: "Cartilla complete!",
    emoji: "\ud83c\udf89",
    color: "#E63946",
    descriptionEs: "Terminaste La Cartilla de Gretel.",
    descriptionEn: "You finished La Cartilla de Gretel.",
    criteriaEs: "Completa las 90 p\u00e1ginas.",
    criteriaEn: "Complete all 90 pages.",
  },
];

export function badgeById(id: BadgeId): Badge | null {
  return BADGES.find((b) => b.id === id) ?? null;
}

export function isStreakBadge(id: BadgeId): boolean {
  return id.startsWith("streak-");
}
