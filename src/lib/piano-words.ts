/**
 * Piano Hablador word list — verified Student Workbook words only.
 *
 * Every word below is copied from the verbatim book transcription
 * (`src/data/book-transcription/lessons-08-24.json`: the lesson's "Completa"
 * word boxes first, then its vocabulary list). Only lowercase words built from
 * simple open syllables (optional first vowel + consonant-vowel pairs) are
 * included, so the syllable split is unambiguous; where the book prints a
 * fill-in split ("___ po" → "sa") the split matches it. The test
 * `src/lib/__tests__/piano-words.test.ts` re-derives and checks all of this.
 *
 * Lessons without such words (for example Rr-doble) keep the original
 * syllable-by-syllable piano.
 */
export interface PianoWord {
  word: string;
  syllables: string[];
}

export const PIANO_WORDS: Readonly<Record<number, readonly PianoWord[]>> = {
  8: [
    { word: "papá", syllables: ["pa", "pá"] },
    { word: "mapa", syllables: ["ma", "pa"] },
    { word: "puma", syllables: ["pu", "ma"] },
    { word: "mapo", syllables: ["ma", "po"] },
    { word: "papi", syllables: ["pa", "pi"] },
  ],
  9: [
    { word: "sapo", syllables: ["sa", "po"] },
    { word: "puso", syllables: ["pu", "so"] },
    { word: "masa", syllables: ["ma", "sa"] },
    { word: "así", syllables: ["a", "sí"] },
    { word: "supo", syllables: ["su", "po"] },
  ],
  10: [
    { word: "toma", syllables: ["to", "ma"] },
    { word: "mata", syllables: ["ma", "ta"] },
    { word: "topo", syllables: ["to", "po"] },
    { word: "tomate", syllables: ["to", "ma", "te"] },
    { word: "tupe", syllables: ["tu", "pe"] },
  ],
  11: [
    { word: "dedo", syllables: ["de", "do"] },
    { word: "mide", syllables: ["mi", "de"] },
    { word: "mudo", syllables: ["mu", "do"] },
    { word: "pide", syllables: ["pi", "de"] },
    { word: "deme", syllables: ["de", "me"] },
  ],
  12: [
    { word: "paleta", syllables: ["pa", "le", "ta"] },
    { word: "solo", syllables: ["so", "lo"] },
    { word: "pala", syllables: ["pa", "la"] },
    { word: "lata", syllables: ["la", "ta"] },
    { word: "maleta", syllables: ["ma", "le", "ta"] },
  ],
  13: [
    { word: "nido", syllables: ["ni", "do"] },
    { word: "tina", syllables: ["ti", "na"] },
    { word: "mono", syllables: ["mo", "no"] },
    { word: "sano", syllables: ["sa", "no"] },
    { word: "pone", syllables: ["po", "ne"] },
  ],
  14: [
    { word: "maña", syllables: ["ma", "ña"] },
    { word: "pañito", syllables: ["pa", "ñi", "to"] },
    { word: "niño", syllables: ["ni", "ño"] },
    { word: "moño", syllables: ["mo", "ño"] },
    { word: "año", syllables: ["a", "ño"] },
  ],
  15: [
    { word: "cubo", syllables: ["cu", "bo"] },
    { word: "bolo", syllables: ["bo", "lo"] },
    { word: "cubito", syllables: ["cu", "bi", "to"] },
    { word: "batido", syllables: ["ba", "ti", "do"] },
    { word: "nube", syllables: ["nu", "be"] },
  ],
  16: [
    { word: "nave", syllables: ["na", "ve"] },
    { word: "vaso", syllables: ["va", "so"] },
    { word: "vela", syllables: ["ve", "la"] },
    { word: "pavo", syllables: ["pa", "vo"] },
    { word: "vine", syllables: ["vi", "ne"] },
  ],
  17: [
    { word: "rana", syllables: ["ra", "na"] },
    { word: "ruta", syllables: ["ru", "ta"] },
    { word: "remo", syllables: ["re", "mo"] },
    { word: "rosa", syllables: ["ro", "sa"] },
    { word: "ramo", syllables: ["ra", "mo"] },
  ],
  19: [
    { word: "aguja", syllables: ["a", "gu", "ja"] },
    { word: "mago", syllables: ["ma", "go"] },
    { word: "gato", syllables: ["ga", "to"] },
    { word: "goma", syllables: ["go", "ma"] },
    { word: "lago", syllables: ["la", "go"] },
  ],
  20: [
    { word: "fama", syllables: ["fa", "ma"] },
    { word: "fila", syllables: ["fi", "la"] },
    { word: "teléfono", syllables: ["te", "lé", "fo", "no"] },
    { word: "foca", syllables: ["fo", "ca"] },
    { word: "foto", syllables: ["fo", "to"] },
  ],
  21: [
    { word: "jaba", syllables: ["ja", "ba"] },
    { word: "jugo", syllables: ["ju", "go"] },
    { word: "jefe", syllables: ["je", "fe"] },
    { word: "ají", syllables: ["a", "jí"] },
    { word: "baja", syllables: ["ba", "ja"] },
  ],
  22: [
    { word: "coma", syllables: ["co", "ma"] },
    { word: "cosa", syllables: ["co", "sa"] },
    { word: "saca", syllables: ["sa", "ca"] },
    { word: "cola", syllables: ["co", "la"] },
    { word: "loca", syllables: ["lo", "ca"] },
  ],
  23: [
    { word: "yuca", syllables: ["yu", "ca"] },
    { word: "cayo", syllables: ["ca", "yo"] },
    { word: "yema", syllables: ["ye", "ma"] },
    { word: "payaso", syllables: ["pa", "ya", "so"] },
    { word: "yate", syllables: ["ya", "te"] },
  ],
  24: [
    { word: "zapato", syllables: ["za", "pa", "to"] },
    { word: "zeta", syllables: ["ze", "ta"] },
    { word: "zumo", syllables: ["zu", "mo"] },
    { word: "lazo", syllables: ["la", "zo"] },
    { word: "calabaza", syllables: ["ca", "la", "ba", "za"] },
  ],
};

export function getPianoWords(lessonNumber: number): PianoWord[] {
  return (PIANO_WORDS[lessonNumber] ?? []).map((entry) => ({
    word: entry.word,
    syllables: [...entry.syllables],
  }));
}
