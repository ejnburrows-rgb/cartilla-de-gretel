// SUMMARY: Teacher-facing metadata for lessons and games is stored here in TEACHER_RESOURCES.
// It is consumed by the TeacherResourcePanel component which renders a "Game info" drawer in the teacher UI.
export type TeacherResourceMeta = {
  id: string;
  kind: "lesson" | "activity" | "game" | "guide";
  route?: string;
  title: { es: string; en: string };
  summary: { es: string; en: string };
  objective: { es: string; en: string };
  lessonRange?: string;
  skills: string[];
  whenToUse: { es: string[]; en: string[] };
  howItWorks: { es: string[]; en: string[] };
  teacherTips: { es: string[]; en: string[] };
};

export const TEACHER_RESOURCES: TeacherResourceMeta[] = [];
export function getTeacherResource(id: string): TeacherResourceMeta | null {
  return TEACHER_RESOURCES.find(r => r.id === id) ?? null;
}

// Seed data
TEACHER_RESOURCES.push({
  id: "lesson-1",
  kind: "lesson",
  route: "/cartilla/leccion/1",
  title: {
    es: "Lección 1 – Vocales",
    en: "Lesson 1 – Vowels",
  },
  summary: {
    es: "Presenta las vocales con apoyo visual y auditivo, usando las páginas iniciales del libro del alumno.",
    en: "Introduces the Spanish vowels with visual and audio support, using the opening pages of the student workbook.",
  },
  objective: {
    es: "Que el estudiante reconozca y pronuncie las vocales en español en contextos sencillos.",
    en: "Students recognize and pronounce Spanish vowels in simple contexts.",
  },
  lessonRange: "Lección 1",
  skills: ["vowels", "phonological awareness"],
  whenToUse: {
    es: [
      "Al iniciar la unidad de vocales.",
      "Para una presentación inicial antes de los juegos de práctica.",
      "Como repaso rápido al inicio de la clase.",
    ],
    en: [
      "When beginning the vowels unit.",
      "As an initial presentation before practice games.",
      "As a quick warm‑up at the start of class.",
    ],
  },
  howItWorks: {
    es: [
      "El docente guía la lectura de las páginas iniciales de la Cartilla.",
      "Se modela la pronunciación de cada vocal con imágenes de apoyo.",
      "El grupo repite las vocales y palabras clave en voz alta.",
    ],
    en: [
      "The teacher guides students through the opening pages of the Cartilla.",
      "Each vowel is modeled with supporting images.",
      "The group repeats vowels and key words aloud.",
    ],
  },
  teacherTips: {
    es: [
      "Use gestos o movimientos para asociar cada vocal con su sonido.",
      "Invite a los estudiantes a señalar las vocales en el entorno del salón.",
    ],
    en: [
      "Use gestures or movements to associate each vowel with its sound.",
      "Invite students to find vowels in the classroom environment.",
    ],
  },
});

for (let i = 2; i <= 24; i++) {
  TEACHER_RESOURCES.push({
    id: `lesson-${i}`,
    kind: "lesson",
    route: `/cartilla/leccion/${i}`,
    title: {
      es: `Lección ${i}`,
      en: `Lesson ${i}`,
    },
    summary: {
      es: `Lección ${i} del libro.`,
      en: `Lesson ${i} of the workbook.`,
    },
    objective: {
      es: `Completar los objetivos de la lección ${i}.`,
      en: `Complete the objectives for lesson ${i}.`,
    },
    lessonRange: `Lección ${i}`,
    skills: ["reading", "phonics"],
    whenToUse: {
      es: ["Durante la instrucción de toda la clase."],
      en: ["During whole-class instruction."],
    },
    howItWorks: {
      es: ["El estudiante avanza por las actividades interactivas."],
      en: ["Students progress through the interactive activities."],
    },
    teacherTips: {
      es: ["Revise la comprensión de los estudiantes frecuentemente."],
      en: ["Check student comprehension frequently."],
    },
  });
}

TEACHER_RESOURCES.push({
  id: "payaso-chano-ss",
  kind: "game",
  route: "/cartilla/juego/payaso-chano-ss",
  title: {
    es: "Juego Payaso Chano",
    en: "Payaso Chano Game",
  },
  summary: {
    es: "Juego Payaso Chano es un juego interactivo que ayuda a los estudiantes a formar y combinar sílabas en español usando el mismo arte y diseño de La Cartilla de Gretel, pero con una experiencia digital moderna.",
    en: "Payaso Chano is an interactive game that helps students build and combine Spanish syllables using the same art and layout from La Cartilla de Gretel, presented in a modern digital experience.",
  },
  objective: {
    es: "Que el estudiante practique la combinación de sílabas para formar palabras completas, reforzando la conciencia silábica y la lectura de palabras sencillas en español.",
    en: "Students practice combining syllables to form complete words, strengthening syllable awareness and early Spanish word reading.",
  },
  lessonRange: "Lecciones iniciales de sílabas con s, m, p",
  skills: ["sílabas", "phonological awareness", "decoding"],
  whenToUse: {
    es: [
      "Después de presentar explícitamente las sílabas objetivo en la lección de la Cartilla.",
      "Como actividad de centro de 5–7 minutos en pequeños grupos.",
      "Como práctica adicional para estudiantes que necesitan más apoyo con la unión de sílabas.",
    ],
    en: [
      "After explicitly teaching the target syllables in the Cartilla lesson.",
      "As a 5–7 minute small‑group or center activity.",
      "As extra practice for students who need support blending syllables.",
    ],
  },
  howItWorks: {
    es: [
      "El estudiante ve a Payaso Chano, su pizarra y las mismas fichas de sílabas que aparecen en el libro.",
      "Escucha o ve una palabra meta y arrastra las fichas de sílabas a la pizarra para formar la palabra.",
      "Toca el botón de revisar para recibir retroalimentación inmediata y, si es necesario, corregir la respuesta.",
      "Usa el botón de ayuda para volver a escuchar la palabra o recibir una pequeña pista visual antes de intentar de nuevo.",
    ],
    en: [
      "Students see Payaso Chano, his board, and the same syllable tiles that appear in the book.",
      "They hear or see a target word and drag syllable tiles onto the board to form the word.",
      "They tap the check button to get immediate feedback and correct if needed.",
      "They can use the help button to hear the word again or get a small visual cue before trying again.",
    ],
  },
  teacherTips: {
    es: [
      "Pida al estudiante decir en voz alta cada sílaba mientras la arrastra a la pizarra.",
      "Después de formar la palabra, invítelo a leerla completa y relacionarla con la imagen o contexto del cuento.",
      "Use los datos de aciertos y errores para identificar qué sílabas necesitan más práctica en pequeño grupo.",
    ],
    en: [
      "Ask students to say each syllable aloud as they drag it onto the board.",
      "After forming the word, invite them to read it and connect it to the picture or story context.",
      "Use the accuracy data to see which syllables need more small‑group practice.",
    ],
  },
});
