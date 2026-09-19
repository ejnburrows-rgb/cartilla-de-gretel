// iep-goal-bank.ts — prewritten bilingual IEP / 504 goals teachers can paste.
// Goals follow SMART format: Specific, Measurable, Achievable, Relevant,
// Time-bound. Every goal references a concrete measurement from the rubric.

export type IepGoal = {
  id: string;
  domain: "phonemic-awareness" | "phonics" | "fluency" | "vocabulary" | "engagement";
  textEs: string;
  textEn: string;
  measurementEs: string;
  measurementEn: string;
  targetWeeks: number;
};

export const IEP_GOALS: IepGoal[] = [
  {
    id: "pa-vowel-iso",
    domain: "phonemic-awareness",
    textEs:
      "El alumno identificar\u00e1 el sonido aislado de las 5 vocales del espa\u00f1ol con 80% de precisi\u00f3n en 4 de 5 oportunidades.",
    textEn:
      "The student will identify the isolated sound of the 5 Spanish vowels with 80% accuracy in 4 out of 5 opportunities.",
    measurementEs: "Tocar la s\u00edlaba correcta en p\u00e1gina +1 de lecciones 2\u20136.",
    measurementEn: "Tap the correct syllable on +1 pages of lessons 2\u20136.",
    targetWeeks: 8,
  },
  {
    id: "ph-cv-blend",
    domain: "phonics",
    textEs:
      "El alumno combinar\u00e1 una consonante con cada vocal para formar s\u00edlabas CV con 80% de precisi\u00f3n en 4 de 5 oportunidades.",
    textEn:
      "The student will blend a consonant with each vowel to form CV syllables with 80% accuracy in 4 out of 5 opportunities.",
    measurementEs: "Construir palabras CV en p\u00e1gina +2 de lecciones 7\u201316.",
    measurementEn: "Build CV words on +2 pages of lessons 7\u201316.",
    targetWeeks: 12,
  },
  {
    id: "ph-rr-tap",
    domain: "phonics",
    textEs:
      "El alumno distinguir\u00e1 entre R suave y RR fuerte en palabras orales con 80% de precisi\u00f3n.",
    textEn: "The student will distinguish soft R from strong RR in spoken words with 80% accuracy.",
    measurementEs: "Tocar la s\u00edlaba correcta en lecciones 17 y 18.",
    measurementEn: "Tap the correct syllable in lessons 17 and 18.",
    targetWeeks: 6,
  },
  {
    id: "fl-sentence-3w",
    domain: "fluency",
    textEs:
      "El alumno leer\u00e1 oraciones de 3\u20135 palabras de la cartilla con precisi\u00f3n del 90% en 3 sesiones consecutivas.",
    textEn:
      "The student will read 3\u20135 word cartilla sentences with 90% accuracy across 3 consecutive sessions.",
    measurementEs: "P\u00e1gina +3 de lecciones 7\u201324.",
    measurementEn: "+3 page of lessons 7\u201324.",
    targetWeeks: 16,
  },
  {
    id: "vocab-keyword",
    domain: "vocabulary",
    textEs:
      "El alumno asociar\u00e1 cada palabra clave de la lecci\u00f3n con su dibujo con 90% de precisi\u00f3n.",
    textEn: "The student will match each lesson keyword to its picture with 90% accuracy.",
    measurementEs: "P\u00e1gina +1 de cualquier lecci\u00f3n de consonante.",
    measurementEn: "+1 page of any consonant lesson.",
    targetWeeks: 10,
  },
  {
    id: "engage-daily",
    domain: "engagement",
    textEs:
      "El alumno completar\u00e1 al menos una p\u00e1gina de la cartilla cinco d\u00edas a la semana durante cuatro semanas consecutivas.",
    textEn:
      "The student will complete at least one cartilla page five days per week for four consecutive weeks.",
    measurementEs: "Registro de racha en el panel del alumno.",
    measurementEn: "Streak record on the student dashboard.",
    targetWeeks: 4,
  },
  {
    id: "engage-help-seek",
    domain: "engagement",
    textEs:
      "El alumno solicitar\u00e1 ayuda apropiada (palabra, gesto o bot\u00f3n) cuando una p\u00e1gina sea dif\u00edcil, en 4 de 5 oportunidades.",
    textEn:
      "The student will request appropriate help (word, gesture, or button) when a page is difficult, in 4 of 5 opportunities.",
    measurementEs: "Observaci\u00f3n docente registrada en notas.",
    measurementEn: "Teacher observation recorded in notes.",
    targetWeeks: 8,
  },
];

export function goalsByDomain(domain: IepGoal["domain"]): IepGoal[] {
  return IEP_GOALS.filter((g) => g.domain === domain);
}

export function goalById(id: string): IepGoal | null {
  return IEP_GOALS.find((g) => g.id === id) ?? null;
}
