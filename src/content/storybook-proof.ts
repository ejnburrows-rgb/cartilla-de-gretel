/**
 * Storybook proof-of-direction (owner review, 4 pages only).
 *
 * The approved direction is applied ONLY to the pages listed here:
 *   Workbook  · Lección 2 (Vocal O), book pages 4 and 5
 *   Flip Chart · Lección 9 (Ss), plates 16 and 17
 * Every other page keeps the current production rendering until the owner
 * approves this blueprint. Content still comes from the existing page layouts
 * and Flip Chart text data — nothing here invents curriculum.
 */
export type StorybookScene = "meadow" | "pond" | "garden";

/** Workbook pages: the shared meadow world; `camera` pans it between pages. */
export const STORYBOOK_WORKBOOK_PAGES: Readonly<
  Record<number, { scene: StorybookScene; camera: number }>
> = {
  4: { scene: "meadow", camera: 0.18 },
  5: { scene: "meadow", camera: 0.62 },
};

/** Flip Chart plates (teacher presentation). */
export const STORYBOOK_FLIPCHART_PLATES: Readonly<Record<number, { scene: StorybookScene }>> = {
  16: { scene: "garden" },
  17: { scene: "pond" },
};

export const isStorybookPage = (pageNumber?: number | null): boolean =>
  typeof pageNumber === "number" && pageNumber in STORYBOOK_WORKBOOK_PAGES;

export const isStorybookPlate = (plate?: number | null): boolean =>
  typeof plate === "number" && plate in STORYBOOK_FLIPCHART_PLATES;

const NUMBER_WORDS = [
  "cero",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
];

const cap = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
const initialOf = (word: string) =>
  word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toLowerCase();

export function remainingPhrase(left: number): string {
  if (left <= 0) return "";
  return left === 1 ? "Te falta uno." : `Te faltan ${NUMBER_WORDS[left] ?? left}.`;
}

/** Gretel's spoken lines for the two proof workbook pages. The existing
 * learning ladder decides WHEN each one is used; this only supplies WHAT. */
export type StorybookLines = Partial<
  Record<"cue" | "hint" | "demonstration" | "independent-retry" | "success" | "mastery", string>
>;

export const STORYBOOK_INTRO: Readonly<Record<number, string>> = {
  4: "Marca con una x los dibujos que comienzan con o. Toca un dibujo y escucha su nombre.",
  5: "Traza una línea desde la vocal o hasta el dibujo que comienza con o. Mira, la primera ya está: ola.",
};

export function storybookLines({
  pageNumber,
  word,
  correct,
  left,
  nextWord,
}: {
  pageNumber: number;
  word?: string;
  correct?: boolean;
  left: number;
  nextWord?: string;
}): StorybookLines {
  const lines: StorybookLines = {
    hint: nextWord
      ? "Mira el dibujo que brilla. Dilo despacio: ¿empieza con o?"
      : "Mira otra vez los dibujos y escucha el primer sonido.",
    demonstration: nextWord
      ? `Mira: ${nextWord} empieza con o. ${pageNumber === 5 ? "Traza la línea tú." : "Márcalo tú."}`
      : "Escucha el primer sonido de cada dibujo.",
    mastery:
      pageNumber === 5
        ? "¡Muy bien! Trazaste todas las líneas hasta los dibujos que empiezan con o."
        : "¡Muy bien! Encontraste los ocho dibujos que empiezan con o.",
  };
  if (word && correct) {
    lines.success = `¡${cap(word)}! Sí, ${word} empieza con o. ${remainingPhrase(left)}`.trim();
    lines["independent-retry"] =
      left > 0
        ? `¡${cap(word)}! Sí, empieza con o. Ahora busca otro tú solo.`
        : `¡${cap(word)}! Sí, empieza con o.`;
  }
  if (word && correct === false) {
    lines.cue = `${cap(word)}. ${cap(word)} empieza con ${initialOf(word)}. Busca un dibujo que empiece con o.`;
  }
  return lines;
}
