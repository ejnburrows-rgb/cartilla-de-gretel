// word-bank-extended.ts — extra vocabulary beyond core keywords.
// 6+ words per consonant; used by authoring (PicturePicker), warm-ups, and
// the home practice planner when the family wants more practice words.
// All words contain only syllables already taught up through that lesson.

import type { LetterId } from "./lesson-meta";

export type ExtraWord = {
	word: string;
	translationEn: string;
	letter: LetterId;
};

export const EXTENDED_WORDS: ExtraWord[] = [
	// Lesson 7 — M
	{ word: "mama",       translationEn: "mom",            letter: "m" },
	{ word: "mima",       translationEn: "pampers",        letter: "m" },
	{ word: "momo",       translationEn: "silly face",     letter: "m" },
	{ word: "mum\u00fa",  translationEn: "calf (baby)",    letter: "m" },

	// Lesson 8 — P
	{ word: "papa",       translationEn: "potato/dad",     letter: "p" },
	{ word: "pipa",       translationEn: "pipe/seed",      letter: "p" },
	{ word: "pomo",       translationEn: "knob",           letter: "p" },
	{ word: "puma",       translationEn: "puma",           letter: "p" },
	{ word: "mapa",       translationEn: "map",            letter: "p" },

	// Lesson 9 — S
	{ word: "sapo",       translationEn: "toad",           letter: "s" },
	{ word: "oso",        translationEn: "bear",           letter: "s" },
	{ word: "saco",       translationEn: "sack",           letter: "s" },
	{ word: "masa",       translationEn: "dough",          letter: "s" },
	{ word: "piso",       translationEn: "floor",          letter: "s" },
	{ word: "peso",       translationEn: "weight",         letter: "s" },

	// Lesson 10 — T
	{ word: "taza",       translationEn: "cup",            letter: "t" },
	{ word: "tomate",     translationEn: "tomato",         letter: "t" },
	{ word: "tema",       translationEn: "topic",          letter: "t" },
	{ word: "pato",       translationEn: "duck",           letter: "t" },
	{ word: "mota",       translationEn: "speck",          letter: "t" },
	{ word: "tos",        translationEn: "cough",          letter: "t" },

	// Lesson 11 — D
	{ word: "dedo",       translationEn: "finger",         letter: "d" },
	{ word: "dado",       translationEn: "die",            letter: "d" },
	{ word: "duda",       translationEn: "doubt",          letter: "d" },
	{ word: "d\u00eda",   translationEn: "day",            letter: "d" },
	{ word: "sed",        translationEn: "thirst",         letter: "d" },
	{ word: "mido",       translationEn: "I measure",      letter: "d" },

	// Lesson 12 — L
	{ word: "luna",       translationEn: "moon",           letter: "l" },
	{ word: "lata",       translationEn: "can",            letter: "l" },
	{ word: "lima",       translationEn: "lime",           letter: "l" },
	{ word: "pelo",       translationEn: "hair",           letter: "l" },
	{ word: "sal",        translationEn: "salt",           letter: "l" },
	{ word: "sol",        translationEn: "sun",            letter: "l" },

	// Lesson 13 — N
	{ word: "nube",       translationEn: "cloud",          letter: "n" },
	{ word: "nido",       translationEn: "nest",           letter: "n" },
	{ word: "nene",       translationEn: "baby",           letter: "n" },
	{ word: "nota",       translationEn: "note",           letter: "n" },
	{ word: "pan",        translationEn: "bread",          letter: "n" },

	// Lesson 14 — \u00d1
	{ word: "ni\u00f1o",      translationEn: "boy",        letter: "n-tilde" },
	{ word: "ni\u00f1a",      translationEn: "girl",       letter: "n-tilde" },
	{ word: "u\u00f1a",       translationEn: "fingernail", letter: "n-tilde" },
	{ word: "pi\u00f1a",      translationEn: "pineapple",  letter: "n-tilde" },
	{ word: "a\u00f1o",       translationEn: "year",       letter: "n-tilde" },
	{ word: "mu\u00f1eca",    translationEn: "doll/wrist", letter: "n-tilde" },

	// Lesson 15 — B
	{ word: "bote",       translationEn: "boat",           letter: "b" },
	{ word: "beso",       translationEn: "kiss",           letter: "b" },
	{ word: "baba",       translationEn: "drool",          letter: "b" },
	{ word: "bola",       translationEn: "ball",           letter: "b" },
	{ word: "bata",       translationEn: "robe",           letter: "b" },
	{ word: "bobo",       translationEn: "silly",          letter: "b" },

	// Lesson 16 — V
	{ word: "vaca",       translationEn: "cow",            letter: "v" },
	{ word: "vela",       translationEn: "candle",         letter: "v" },
	{ word: "vino",       translationEn: "wine",           letter: "v" },
	{ word: "uva",        translationEn: "grape",          letter: "v" },
	{ word: "vaso",       translationEn: "glass",          letter: "v" },
	{ word: "viva",       translationEn: "alive",          letter: "v" },

	// Lesson 17 — R (soft)
	{ word: "pera",       translationEn: "pear",           letter: "r" },
	{ word: "oro",        translationEn: "gold",           letter: "r" },
	{ word: "toro",       translationEn: "bull",           letter: "r" },
	{ word: "mar",        translationEn: "sea",            letter: "r" },
	{ word: "loro",       translationEn: "parrot",         letter: "r" },
	{ word: "caro",       translationEn: "expensive",      letter: "r" },

	// Lesson 18 — RR (strong)
	{ word: "perro",      translationEn: "dog",            letter: "rr" },
	{ word: "carro",      translationEn: "car",            letter: "rr" },
	{ word: "torre",      translationEn: "tower",          letter: "rr" },
	{ word: "barro",      translationEn: "mud",            letter: "rr" },
	{ word: "arroz",      translationEn: "rice",           letter: "rr" },
	{ word: "burro",      translationEn: "donkey",         letter: "rr" },

	// Lesson 19 — G (ga/go/gu only)
	{ word: "gato",       translationEn: "cat",            letter: "g" },
	{ word: "gota",       translationEn: "drop",           letter: "g" },
	{ word: "goma",       translationEn: "rubber",         letter: "g" },
	{ word: "gusano",     translationEn: "worm",           letter: "g" },
	{ word: "agua",       translationEn: "water",          letter: "g" },
	{ word: "lago",       translationEn: "lake",           letter: "g" },

	// Lesson 20 — F
	{ word: "foca",       translationEn: "seal",           letter: "f" },
	{ word: "fama",       translationEn: "fame",           letter: "f" },
	{ word: "foto",       translationEn: "photo",          letter: "f" },
	{ word: "fila",       translationEn: "row/line",       letter: "f" },
	{ word: "caf\u00e9",  translationEn: "coffee",         letter: "f" },
	{ word: "sof\u00e1",  translationEn: "sofa",           letter: "f" },

	// Lesson 21 — J
	{ word: "jugo",       translationEn: "juice",          letter: "j" },
	{ word: "jefe",       translationEn: "boss",           letter: "j" },
	{ word: "jirafa",     translationEn: "giraffe",        letter: "j" },
	{ word: "caja",       translationEn: "box",            letter: "j" },
	{ word: "hoja",       translationEn: "leaf",           letter: "j" },
	{ word: "ojo",        translationEn: "eye",            letter: "j" },

	// Lesson 22 — C (ca/co/cu only)
	{ word: "casa",       translationEn: "house",          letter: "c" },
	{ word: "copa",       translationEn: "cup/goblet",     letter: "c" },
	{ word: "cuna",       translationEn: "crib",           letter: "c" },
	{ word: "coco",       translationEn: "coconut",        letter: "c" },
	{ word: "cuco",       translationEn: "cuckoo",         letter: "c" },
	{ word: "cama",       translationEn: "bed",            letter: "c" },

	// Lesson 23 — Y
	{ word: "yema",       translationEn: "egg yolk",       letter: "y" },
	{ word: "yate",       translationEn: "yacht",          letter: "y" },
	{ word: "yo",         translationEn: "I",              letter: "y" },
	{ word: "playa",      translationEn: "beach",          letter: "y" },
	{ word: "rayo",       translationEn: "lightning",      letter: "y" },
	{ word: "yegua",      translationEn: "mare",           letter: "y" },

	// Lesson 24 — Z
	{ word: "zapato",     translationEn: "shoe",           letter: "z" },
	{ word: "zorro",      translationEn: "fox",            letter: "z" },
	{ word: "taza",       translationEn: "cup",            letter: "z" },
	{ word: "pozo",       translationEn: "well",           letter: "z" },
	{ word: "paz",        translationEn: "peace",          letter: "z" },
	{ word: "luz",        translationEn: "light",          letter: "z" },
];

export function extendedWordsForLetter(letter: LetterId): ExtraWord[] {
	return EXTENDED_WORDS.filter((w) => w.letter === letter);
}

export function totalExtendedWords(): number {
	return EXTENDED_WORDS.length;
}
