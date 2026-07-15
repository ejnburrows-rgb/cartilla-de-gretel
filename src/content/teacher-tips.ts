// teacher-tips.ts — pedagogical tip per lesson surfaced as hover-help in the
// teacher CRM. Concise. Spanish-first, English fallback.

export type TeacherTip = {
  lessonN: number;
  tipEs: string;
  tipEn: string;
  commonError: { es: string; en: string };
  suggestion: { es: string; en: string };
};

export const TEACHER_TIPS: TeacherTip[] = [
  {
    lessonN: 1,
    tipEs: "Presenta a Gretel y la rutina del libro.",
    tipEn: "Introduce Gretel and the book routine.",
    commonError: {
      es: "Los ni\u00f1os no esperan el turno.",
      en: "Students don't wait their turn.",
    },
    suggestion: { es: "Modelar el turno con 2 alumnos.", en: "Model turn-taking with 2 students." },
  },
  {
    lessonN: 2,
    tipEs: "Refuerza el sonido /o/ aislado antes de mezclar.",
    tipEn: "Reinforce isolated /o/ before blending.",
    commonError: { es: "Confunden /o/ con /u/.", en: "Confuse /o/ with /u/." },
    suggestion: {
      es: "Usar espejo para ver la forma de la boca.",
      en: "Use a mirror to see mouth shape.",
    },
  },
  {
    lessonN: 3,
    tipEs: "Conecta /a/ con palabras familiares (ama, ala).",
    tipEn: "Connect /a/ to familiar words (ama, ala).",
    commonError: { es: "Pronuncian /a/ d\u00e9bil.", en: "Weak /a/ pronunciation." },
    suggestion: { es: "Cantar la vocal con palmas.", en: "Sing the vowel with claps." },
  },
  {
    lessonN: 4,
    tipEs: "Trabaja /e/ con duraci\u00f3n larga primero.",
    tipEn: "Work /e/ with long duration first.",
    commonError: { es: "Confunden /e/ con /i/.", en: "Confuse /e/ with /i/." },
    suggestion: {
      es: "Contrastar pares m\u00ednimos (mesa/misa).",
      en: "Contrast minimal pairs (mesa/misa).",
    },
  },
  {
    lessonN: 5,
    tipEs: "Asocia /i/ con sonrisa amplia.",
    tipEn: "Associate /i/ with a wide smile.",
    commonError: { es: "Bajan el volumen.", en: "Lower their volume." },
    suggestion: {
      es: "Usar gesto de sonrisa al pronunciar.",
      en: "Use a smile gesture when pronouncing.",
    },
  },
  {
    lessonN: 6,
    tipEs: "Refuerza /u/ con labios redondos.",
    tipEn: "Reinforce /u/ with rounded lips.",
    commonError: { es: "No redondean los labios.", en: "Don't round their lips." },
    suggestion: { es: "Soplar como apagando una vela.", en: "Blow as if blowing out a candle." },
  },
  {
    lessonN: 7,
    tipEs: "La consonante M es nasal y se siente en la nariz.",
    tipEn: "M is nasal \u2014 students feel it in the nose.",
    commonError: { es: "Olvidan la nasalidad.", en: "Forget the nasal quality." },
    suggestion: {
      es: "Tocarse la nariz al pronunciar 'mmm'.",
      en: "Touch the nose when saying 'mmm'.",
    },
  },
  {
    lessonN: 8,
    tipEs: "P es oclusiva: sentir la explosi\u00f3n en los labios.",
    tipEn: "P is plosive \u2014 feel the burst on the lips.",
    commonError: { es: "Confunden /p/ con /b/.", en: "Confuse /p/ with /b/." },
    suggestion: { es: "Soplar un papel al pronunciar /p/.", en: "Blow a paper when saying /p/." },
  },
  {
    lessonN: 9,
    tipEs: "S es fricativa: aire continuo entre los dientes.",
    tipEn: "S is fricative \u2014 continuous air between teeth.",
    commonError: { es: "Pronuncian /s/ como /z/.", en: "Pronounce /s/ as /z/." },
    suggestion: { es: "Sostener el sonido 10 segundos.", en: "Sustain the sound 10 seconds." },
  },
  {
    lessonN: 10,
    tipEs: "T es oclusiva en la punta de la lengua.",
    tipEn: "T is plosive at the tongue tip.",
    commonError: { es: "La lengua toca el paladar.", en: "Tongue touches the palate." },
    suggestion: {
      es: "Tocarse los dientes superiores con la lengua.",
      en: "Touch upper teeth with the tongue.",
    },
  },
  {
    lessonN: 11,
    tipEs: "D y T se diferencian por sonoridad.",
    tipEn: "D and T differ by voicing.",
    commonError: { es: "Confunden /d/ con /t/.", en: "Confuse /d/ with /t/." },
    suggestion: {
      es: "Tocarse la garganta para sentir vibraci\u00f3n.",
      en: "Touch throat to feel vibration.",
    },
  },
  {
    lessonN: 12,
    tipEs: "L es lateral: aire por los costados.",
    tipEn: "L is lateral \u2014 air flows on the sides.",
    commonError: { es: "Confunden /l/ con /r/.", en: "Confuse /l/ with /r/." },
    suggestion: { es: "Sostener /l/ continua.", en: "Sustain a continuous /l/." },
  },
  {
    lessonN: 13,
    tipEs: "N es nasal alveolar.",
    tipEn: "N is alveolar nasal.",
    commonError: { es: "Confunden /n/ con /m/.", en: "Confuse /n/ with /m/." },
    suggestion: {
      es: "Comparar /m/ y /n/ con la mano en la nariz.",
      en: "Compare /m/ and /n/ with hand on nose.",
    },
  },
  {
    lessonN: 14,
    tipEs: "\u00d1 es propia del espa\u00f1ol.",
    tipEn: "\u00d1 is unique to Spanish.",
    commonError: { es: "Pronuncian \u00f1 como ny.", en: "Pronounce \u00f1 as 'ny'." },
    suggestion: {
      es: "Modelar la palabra 'ni\u00f1o' lentamente.",
      en: "Model the word 'ni\u00f1o' slowly.",
    },
  },
  {
    lessonN: 15,
    tipEs: "B es bilabial sonora.",
    tipEn: "B is voiced bilabial.",
    commonError: { es: "Confunden /b/ con /v/.", en: "Confuse /b/ with /v/." },
    suggestion: {
      es: "En espa\u00f1ol /b/ y /v/ suenan igual.",
      en: "In Spanish /b/ and /v/ sound the same.",
    },
  },
  {
    lessonN: 16,
    tipEs: "V en espa\u00f1ol suena como B.",
    tipEn: "V in Spanish sounds like B.",
    commonError: {
      es: "Quieren morder el labio (ingl\u00e9s).",
      en: "Try to bite lip (English habit).",
    },
    suggestion: { es: "Modelar palabras solo con la voz.", en: "Model words by voice only." },
  },
  {
    lessonN: 17,
    tipEs: "R suave: una sola vibraci\u00f3n.",
    tipEn: "Soft R \u2014 a single tap.",
    commonError: { es: "Vibran demasiado.", en: "Vibrate too much." },
    suggestion: { es: "Practicar 'pero' con un golpe.", en: "Practice 'pero' with one tap." },
  },
  {
    lessonN: 18,
    tipEs: "RR fuerte: vibraci\u00f3n m\u00faltiple.",
    tipEn: "Strong RR \u2014 multiple trills.",
    commonError: { es: "No logran la vibraci\u00f3n.", en: "Cannot achieve the trill." },
    suggestion: { es: "Imitar el sonido de motor.", en: "Imitate a motor sound." },
  },
  {
    lessonN: 19,
    tipEs: "G dura solo con a/o/u.",
    tipEn: "Hard G only with a/o/u.",
    commonError: { es: "Aplican G dura con e/i.", en: "Apply hard G with e/i." },
    suggestion: {
      es: "Aclarar que ge/gi se ven m\u00e1s adelante.",
      en: "Clarify ge/gi come later.",
    },
  },
  {
    lessonN: 20,
    tipEs: "F es fricativa labiodental.",
    tipEn: "F is labiodental fricative.",
    commonError: { es: "No tocan el labio inferior.", en: "Don't touch lower lip." },
    suggestion: { es: "Mostrar el contacto labio-dientes.", en: "Show lip-to-teeth contact." },
  },
  {
    lessonN: 21,
    tipEs: "J es fricativa velar fuerte.",
    tipEn: "J is strong velar fricative.",
    commonError: { es: "Pronuncian J como ingl\u00e9s.", en: "Pronounce J like English." },
    suggestion: {
      es: "Pr\u00e1ctica con 'jamón', 'jefe'.",
      en: "Practice with 'jam\u00f3n', 'jefe'.",
    },
  },
  {
    lessonN: 22,
    tipEs: "C dura solo con a/o/u.",
    tipEn: "Hard C only with a/o/u.",
    commonError: { es: "Aplican C dura con e/i.", en: "Apply hard C with e/i." },
    suggestion: {
      es: "Aclarar que ce/ci se ven m\u00e1s adelante.",
      en: "Clarify ce/ci come later.",
    },
  },
  {
    lessonN: 23,
    tipEs: "Y se comporta como vocal y consonante.",
    tipEn: "Y acts as vowel and consonant.",
    commonError: { es: "Confunden Y final con I.", en: "Confuse final Y with I." },
    suggestion: { es: "Comparar 'rey' con 'ley'.", en: "Compare 'rey' with 'ley'." },
  },
  {
    lessonN: 24,
    tipEs: "Z en Latinoam\u00e9rica suena como S.",
    tipEn: "Z in Latin America sounds like S.",
    commonError: { es: "Distinguen Z/S excesivamente.", en: "Over-distinguish Z/S." },
    suggestion: { es: "Aceptar ambas pronunciaciones.", en: "Accept both pronunciations." },
  },
];

export function tipForLesson(n: number): TeacherTip | null {
  return TEACHER_TIPS.find((t) => t.lessonN === n) ?? null;
}
