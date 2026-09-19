// word-bank.ts — curated Spanish words per lesson, beyond the 5 lesson-meta
// keywords. Words are workbook-aligned, child-level, common, and use ONLY
// syllables introduced up to that lesson when possible.
//
// Used by: drag-build expansion, word-match additional rounds, reading bank.

import { LESSONS } from "./lesson-meta";

export const WORD_BANK_BY_LESSON: Record<number, string[]> = {
  2: ["oso", "ojo", "oro", "olla", "ola"],
  3: ["ala", "ave", "agua", "asa", "aro"],
  4: ["elefante", "escoba", "erre", "ema", "eco"],
  5: ["iguana", "isla", "iglesia", "imn\u00e1n", "ido"],
  6: ["uva", "uno", "u\u00f1a", "\u00fanico", "usado"],
  7: ["mam\u00e1", "mesa", "mi", "mono", "mula", "mapa", "mimo", "miel"],
  8: ["pap\u00e1", "pelo", "pino", "pollo", "puma", "pera", "piso", "pomo"],
  9: ["sapo", "sed", "silla", "sol", "susto", "sopa", "seda", "suma"],
  10: ["taza", "techo", "t\u00edo", "tomate", "tuna", "tela", "toro", "tos"],
  11: ["dado", "dedo", "d\u00eda", "dorado", "dulce", "data", "diente", "domo"],
  12: ["lata", "leche", "lila", "lobo", "luna", "lana", "loma", "loco"],
  13: ["nada", "nene", "nido", "nota", "nube", "nene", "nudo", "nene"],
  14: ["\u00f1ame", "ni\u00f1o", "ca\u00f1a", "mu\u00f1eca", "pi\u00f1a", "a\u00f1o", "da\u00f1o"],
  15: ["bala", "bebe", "bici", "bota", "buho", "boca", "banco", "besos"],
  16: ["vaca", "vela", "vino", "voto", "v\u00fado", "vivo", "vena", "viaje"],
  17: ["rana", "remos", "Rita", "rosa", "rueda", "rama", "rito", "rojo"],
  18: ["burro", "carrusel", "torre", "barril", "Tierra", "carro", "perro", "barro"],
  19: ["gaveta", "gusano", "Goloso", "gorra", "mago", "gato", "gota", "gusto"],
  20: ["foto", "fideos", "familia", "Felo", "funda", "fama", "fino", "fila"],
  21: ["jicotea", "jugo", "Jesús", "ajo", "jarra", "jefe", "joven", "jueves"],
  22: ["cuna", "conejo", "casa", "cubo", "Catalina", "cama", "copa", "cola"],
  23: ["yate", "yema", "Yayita", "mayúscula", "yoyo", "ya", "yendo"],
  24: ["zapato", "zig-zag", "zorro", "zepelín", "Zulema", "zona", "zumo"],
};

export function wordsForLesson(n: number): string[] {
  return WORD_BANK_BY_LESSON[n] ?? [];
}

export function wordsForLetter(letter: string): string[] {
  const lesson = LESSONS.find(
    (l) => l.letter.toLowerCase().replace(/[^a-z\u00f1]/g, "")[0] === letter.toLowerCase()[0],
  );
  if (!lesson) return [];
  return wordsForLesson(lesson.n);
}

export function pickWords(lessonN: number, count: number, seed?: number): string[] {
  const pool = wordsForLesson(lessonN);
  if (pool.length === 0) return [];
  if (count >= pool.length) return pool.slice();
  const out: string[] = [];
  let idx =
    typeof seed === "number"
      ? Math.abs(seed) % pool.length
      : Math.floor(Math.random() * pool.length);
  const used = new Set<number>();
  while (out.length < count && used.size < pool.length) {
    if (!used.has(idx)) {
      out.push(pool[idx]);
      used.add(idx);
    }
    idx = (idx + 1) % pool.length;
  }
  return out;
}
