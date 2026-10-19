// completar-palabras.test.ts — pins the Mm teacher file content verbatim and
// keeps the missing blank-to-word mapping honestly null.
//
// Source: `public/teacher/2-Fon_tica_Completar_palabras_con_Mm_5_t925.docx`
// (teacher source branch teacher/metodos-lectura-20261018).
import { describe, expect, it } from "vitest";
import { COMPLETAR_PALABRAS_M } from "../completar-palabras";

describe("completar-palabras (Mm) matches the teacher file", () => {
  it("keeps the printed title and instruction lines verbatim", () => {
    expect(COMPLETAR_PALABRAS_M.title).toBe("Fonética: Sílabas con Mm");
    expect(COMPLETAR_PALABRAS_M.instructions).toEqual([
      "Presiona el símbolo de audio para escuchar las instrucciones.",
      "¡A completar las palabras!",
      "Presiona cada caja para escuchar la palabra.",
      "Arrastra la sílaba correcta para completar la palabra.",
    ]);
  });

  it("prints only the words and syllables the file prints", () => {
    expect(COMPLETAR_PALABRAS_M.words.map((w) => w.word).sort()).toEqual(
      ["Momi", "Memo", "amo", "Mumi", "mima", "mamá"].sort(),
    );
    expect(COMPLETAR_PALABRAS_M.tiles).toEqual(["ma", "me", "mi", "mo", "mu"]);
    // The file does not print syllable splits — none may be derived.
    expect(COMPLETAR_PALABRAS_M.words.every((w) => w.syllables.length === 0)).toBe(true);
  });

  it("renders the three file sections with six blank cards", () => {
    expect(COMPLETAR_PALABRAS_M.sections.map((s) => s.id)).toEqual([
      "seccion-1",
      "seccion-2",
      "seccion-3",
    ]);
    const blanks = COMPLETAR_PALABRAS_M.sections.flatMap((s) => s.blankCards);
    expect(blanks).toHaveLength(6);
    // Section 1 prints the worked "a + mo" card; everything else is open.
    expect(blanks.filter((c) => c.shownTile).map((c) => c.shownTile)).toEqual(["mo"]);
  });

  it("keeps the blank-to-word mapping explicitly missing (pendiente)", () => {
    for (const card of COMPLETAR_PALABRAS_M.sections.flatMap((s) => s.blankCards)) {
      expect(
        card.fullWord,
        `${card.id}: fullWord must stay null until the owner fills it`,
      ).toBeNull();
      expect(
        card.answerSyllable,
        `${card.id}: answerSyllable must stay null until the owner fills it`,
      ).toBeNull();
    }
  });

  it("adds no audio (voice stays pendiente)", () => {
    for (const word of COMPLETAR_PALABRAS_M.words) {
      expect(word.audioUrl).toBeUndefined();
    }
  });
});
