import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { GRETEL_PRIMARY_VOICE, GRETEL_FALLBACK_VOICE } from "@/lib/gretel-voice";
import approvedClips from "@/data/gretel-approved-clips.json";

export type GretelCinematicAction =
  | "enter"
  | "wave"
  | "talk"
  | "point-left"
  | "point-right"
  | "listen"
  | "teach"
  | "help"
  | "gentle-error"
  | "celebrate"
  | "exit";

export type GretelCinematic = {
  id: string;
  kind: "welcome" | "how-to" | "lesson" | "milestone" | "final";
  lesson: number | null;
  script: string;
  captions: string[];
  durationSeconds: number;
  actions: GretelCinematicAction[];
  voice: { primary: string; fallback: string; locale: "es-MX" };
  /** Register only produced, approved files. An absent clip uses the still. */
  video?: { mp4: string; webm?: string; poster: string };
};

function lessonScript(entry: CatalogEntry): string {
  if (entry.kind === "intro") {
    return "Hoy vamos a conocer las cinco vocales. Mira con atención, escucha sus sonidos y después inténtalo tú.";
  }
  if (entry.kind === "vowel") {
    return `Hoy trabajaremos con la vocal ${entry.vowel.toUpperCase()}. Escucha su sonido, observa las palabras y practica conmigo.`;
  }
  return `Hoy trabajaremos con la letra ${entry.letter.toUpperCase()} y sus sílabas: ${entry.data.syllables.join(", ")}. Mira, escucha y después inténtalo tú.`;
}

function cinematicBase(partial: Omit<GretelCinematic, "voice">): GretelCinematic {
  return {
    ...partial,
    video: (approvedClips as Record<string, GretelCinematic["video"]>)[partial.id],
    voice: { primary: GRETEL_PRIMARY_VOICE, fallback: GRETEL_FALLBACK_VOICE, locale: "es-MX" },
  };
}

export const GRETEL_CINEMATICS: GretelCinematic[] = [
  cinematicBase({
    id: "master-welcome",
    kind: "welcome",
    lesson: null,
    script: "¡Hola! Soy Gretel. Vamos a aprender juntos. Mira con atención, escucha y ahora inténtalo tú.",
    captions: ["¡Hola! Soy Gretel.", "Vamos a aprender juntos.", "Mira con atención, escucha y ahora inténtalo tú."],
    durationSeconds: 9,
    actions: ["enter", "wave", "talk", "point-right"],
  }),
  cinematicBase({
    id: "how-to",
    kind: "how-to",
    lesson: null,
    script: "En cada lección vamos a mirar, escuchar, trazar, leer y practicar. Puedes repetir una actividad cuando lo necesites.",
    captions: ["Mira y escucha.", "Traza, lee y practica.", "Puedes repetir cuando lo necesites."],
    durationSeconds: 10,
    actions: ["enter", "talk", "teach", "listen", "exit"],
  }),
  ...CATALOG.map((entry) =>
    cinematicBase({
      id: `lesson-${String(entry.n).padStart(2, "0")}-intro`,
      kind: "lesson",
      lesson: entry.n,
      script: lessonScript(entry),
      captions: [lessonScript(entry)],
      durationSeconds: 8,
      actions: ["enter", "wave", "talk", "teach", "exit"],
    }),
  ),
  ...[6, 12, 18, 24].map((lesson) =>
    cinematicBase({
      id: `milestone-${lesson}`,
      kind: "milestone",
      lesson,
      script: lesson === 24
        ? "¡Terminaste las veinticuatro lecciones! Mira todo lo que has aprendido. Celebremos tu esfuerzo."
        : `¡Muy bien! Ya llegaste a la lección ${lesson}. Has trabajado mucho. Sigamos aprendiendo.`,
      captions: [lesson === 24 ? "¡Terminaste las 24 lecciones!" : `¡Llegaste a la lección ${lesson}!`],
      durationSeconds: 7,
      actions: ["enter", "celebrate", "talk", "exit"],
    }),
  ),
  cinematicBase({
    id: "cartilla-final",
    kind: "final",
    lesson: 24,
    script: "¡Lo lograste! Terminaste La Cartilla de Gretel. Sigue leyendo, practicando y descubriendo nuevas palabras cada día.",
    captions: ["¡Lo lograste!", "Terminaste La Cartilla de Gretel.", "Sigue leyendo cada día."],
    durationSeconds: 9,
    actions: ["enter", "celebrate", "talk", "exit"],
  }),
];

export function getLessonCinematic(lesson: number): GretelCinematic {
  return GRETEL_CINEMATICS.find((item) => item.kind === "lesson" && item.lesson === lesson)
    ?? GRETEL_CINEMATICS[0]!;
}


export function getCinematicById(id: string): GretelCinematic | null {
  return GRETEL_CINEMATICS.find((item) => item.id === id) ?? null;
}

export function getCompletionCinematic(lesson: number): GretelCinematic | null {
  if (lesson === 24) {
    return GRETEL_CINEMATICS.find((item) => item.id === "cartilla-final") ?? null;
  }
  return GRETEL_CINEMATICS.find((item) => item.kind === "milestone" && item.lesson === lesson) ?? null;
}
