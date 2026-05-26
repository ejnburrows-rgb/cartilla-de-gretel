// word-bank.ts — curated Spanish words per lesson, beyond the 5 lesson-meta
// keywords. Words are workbook-aligned, child-level, common, and use ONLY
// syllables introduced up to that lesson when possible.
//
// Used by: drag-build expansion, word-match additional rounds, reading bank.

import { LESSONS } from "./lesson-meta";

export const WORD_BANK_BY_LESSON: Record<number, string[]> = {
	2:  ["oso", "ojo", "oro", "olla", "ola"],
	3:  ["ala", "ave", "agua", "asa", "aro"],
	4:  ["elefante", "escoba", "erre", "ema", "eco"],
	5:  ["iguana", "isla", "iglesia", "imn\u00e1n", "ido"],
	6:  ["uva", "uno", "u\u00f1a", "\u00fanico", "usado"],
	7:  ["mam\u00e1", "mesa", "mi", "mono", "mula", "mapa", "mimo", "miel"],
	8:  ["pap\u00e1", "pelo", "pino", "pollo", "puma", "pera", "piso", "pomo"],
	9:  ["sapo", "sed", "silla", "sol", "susto", "sopa", "seda", "suma"],
	10: ["taza", "techo", "t\u00edo", "tomate", "tuna", "tela", "toro", "tos"],
	11: ["dado", "dedo", "d\u00eda", "dorado", "dulce", "data", "diente", "domo"],
	12: ["lata", "leche", "lila", "lobo", "luna", "lana", "loma", "loco"],
	13: ["nada", "nene", "nido", "nota", "nube", "nene", "nudo", "nene"],
	14: ["\u00f1ame", "ni\u00f1o", "ca\u00f1a", "mu\u00f1eca", "pi\u00f1a", "a\u00f1o", "da\u00f1o"],
	15: ["bala", "bebe", "bici", "bota", "buho", "boca", "banco", "besos"],
	16: ["vaca", "vela", "vino", "voto", "v\u00fado", "vivo", "vena", "viaje"],
	17: ["raro", "remo", "rito", "rosa", "ruta", "rama", "reto", "rojo"],
	18: ["carro", "perro", "torre", "burro", "jarra", "barro", "corre", "horror"],
	19: ["gato", "goma", "gusano", "gota", "gala", "gancho", "gusto", "globo"],
	20: ["faro", "feo", "fila", "foca", "fuego", "fama", "foto", "fino"],
	21: ["jarro", "jefe", "jirafa", "jota", "jugo", "jaba", "jueves", "joya"],
	22: ["casa", "cola", "cuna", "copa", "cama", "cabo", "coco", "culebra"],
	23: ["yate", "yegua", "yoyo", "yuca", "yema", "ya", "yendo"],
	24: ["zapato", "zorro", "zumo", "zona", "zeta", "zarz\u00f3n", "zueco"],
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
	let idx = typeof seed === "number" ? Math.abs(seed) % pool.length : Math.floor(Math.random() * pool.length);
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
