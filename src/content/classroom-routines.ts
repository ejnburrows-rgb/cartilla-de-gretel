// classroom-routines.ts — 5-minute classroom routine blocks teachers can
// stitch into a 25-minute lesson period. Lane: content. The maestro CRM
// reads these when generating a daily lesson plan.

export type RoutineBlock = {
  id: string;
  nameEs: string;
  nameEn: string;
  minutes: number;
  descriptionEs: string;
  descriptionEn: string;
  materials: string[];
  phase: "warmup" | "mini-lesson" | "practice" | "share" | "closure";
};

export const ROUTINE_BLOCKS: RoutineBlock[] = [
  {
    id: "warm-syllable-clap",
    nameEs: "Palmadas de s\u00edlabas",
    nameEn: "Syllable claps",
    minutes: 3,
    descriptionEs: "Decir palabras clave y dar una palmada por s\u00edlaba.",
    descriptionEn: "Say key words and clap once per syllable.",
    materials: [],
    phase: "warmup",
  },
  {
    id: "warm-mirror-mouth",
    nameEs: "Espejo de la boca",
    nameEn: "Mouth mirror",
    minutes: 3,
    descriptionEs: "Usar espejo de mano para observar la forma de la boca al pronunciar la letra.",
    descriptionEn: "Use a hand mirror to watch mouth shape while pronouncing the letter.",
    materials: ["espejo de mano / hand mirror"],
    phase: "warmup",
  },
  {
    id: "mini-letter-of-day",
    nameEs: "Letra del d\u00eda",
    nameEn: "Letter of the day",
    minutes: 7,
    descriptionEs:
      "Presentar la letra del d\u00eda con tarjeta grande. Modelar el sonido aislado y en palabra.",
    descriptionEn:
      "Introduce today's letter with a large card. Model the isolated sound and in a word.",
    materials: ["tarjeta de letra / letter card"],
    phase: "mini-lesson",
  },
  {
    id: "mini-modeled-reading",
    nameEs: "Lectura modelada",
    nameEn: "Modeled reading",
    minutes: 7,
    descriptionEs:
      "Leer la oraci\u00f3n de la p\u00e1gina mientras los alumnos siguen con el dedo.",
    descriptionEn: "Read the page sentence while students follow with a finger.",
    materials: ["cartilla / workbook"],
    phase: "mini-lesson",
  },
  {
    id: "practice-app",
    nameEs: "Pr\u00e1ctica en la aplicaci\u00f3n",
    nameEn: "App practice",
    minutes: 10,
    descriptionEs: "Trabajo independiente en el dispositivo con la p\u00e1gina del d\u00eda.",
    descriptionEn: "Independent work on the device with today's page.",
    materials: ["tableta o computadora / tablet or laptop"],
    phase: "practice",
  },
  {
    id: "practice-pair",
    nameEs: "Pr\u00e1ctica en parejas",
    nameEn: "Partner practice",
    minutes: 8,
    descriptionEs: "Parejas: uno lee, el otro escucha y verifica.",
    descriptionEn: "Pairs: one reads, the other listens and checks.",
    materials: ["cartilla / workbook"],
    phase: "practice",
  },
  {
    id: "share-favorite-word",
    nameEs: "Palabra favorita",
    nameEn: "Favorite word",
    minutes: 3,
    descriptionEs: "Cada alumno comparte una palabra que aprendi\u00f3 hoy.",
    descriptionEn: "Each student shares a word they learned today.",
    materials: [],
    phase: "share",
  },
  {
    id: "share-gretel",
    nameEs: "Reporte para Gretel",
    nameEn: "Tell Gretel",
    minutes: 2,
    descriptionEs: "Alumnos le dicen a Gretel qu\u00e9 lograron hoy.",
    descriptionEn: "Students tell Gretel what they accomplished today.",
    materials: [],
    phase: "share",
  },
  {
    id: "closure-stamp",
    nameEs: "Sello de la p\u00e1gina",
    nameEn: "Page stamp",
    minutes: 2,
    descriptionEs: "Marcar la p\u00e1gina como completa en el portafolio.",
    descriptionEn: "Mark the page complete in the portfolio.",
    materials: ["sellos / stamps"],
    phase: "closure",
  },
];

export type DailyPlan = {
  lessonN: number;
  blocks: string[]; // block ids in order
  totalMinutes: number;
};

export function suggestedDailyPlan(lessonN: number): DailyPlan {
  const blocks = [
    lessonN <= 6 ? "warm-mirror-mouth" : "warm-syllable-clap",
    "mini-letter-of-day",
    "practice-app",
    "share-favorite-word",
    "closure-stamp",
  ];
  const total = blocks.reduce((sum, id) => {
    const b = ROUTINE_BLOCKS.find((r) => r.id === id);
    return sum + (b?.minutes ?? 0);
  }, 0);
  return { lessonN, blocks, totalMinutes: total };
}

export function routineById(id: string): RoutineBlock | null {
  return ROUTINE_BLOCKS.find((r) => r.id === id) ?? null;
}
