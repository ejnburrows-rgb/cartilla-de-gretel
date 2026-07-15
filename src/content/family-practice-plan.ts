// family-practice-plan.ts — bilingual home practice routine per lesson.
// 5-day plan, ~10 min/day, designed for parents who may not read at grade
// level themselves. Plain language, action verbs, no jargon.

export type DailyActivity = {
  day: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  titleEs: string;
  titleEn: string;
  stepsEs: string[];
  stepsEn: string[];
};

export type FamilyPlan = {
  lessonN: number;
  letterEs: string;
  activities: DailyActivity[];
  parentNoteEs: string;
  parentNoteEn: string;
};

function makePlan(lessonN: number, letterEs: string): FamilyPlan {
  return {
    lessonN,
    letterEs,
    activities: [
      {
        day: 1,
        minutes: 10,
        titleEs: `Conoce la letra ${letterEs}`,
        titleEn: `Meet the letter ${letterEs}`,
        stepsEs: [
          "Abran la aplicaci\u00f3n y entren a la lecci\u00f3n del d\u00eda.",
          "Escuchen el sonido de la letra juntos.",
          "Pidan a su hijo o hija que repita el sonido 5 veces.",
        ],
        stepsEn: [
          "Open the app and go to today's lesson.",
          "Listen to the letter sound together.",
          "Have your child repeat the sound 5 times.",
        ],
      },
      {
        day: 2,
        minutes: 10,
        titleEs: "Toca la s\u00edlaba",
        titleEn: "Tap the syllable",
        stepsEs: [
          "Hagan la p\u00e1gina de tocar s\u00edlabas.",
          "Si comete un error, no diga la respuesta. Repita el sonido.",
          "Celebren cada acierto.",
        ],
        stepsEn: [
          "Do the tap-the-syllable page.",
          "If they make a mistake, don't give the answer. Repeat the sound.",
          "Celebrate every right answer.",
        ],
      },
      {
        day: 3,
        minutes: 10,
        titleEs: "Une palabra y dibujo",
        titleEn: "Match word and picture",
        stepsEs: [
          "Hagan la p\u00e1gina de unir palabra y dibujo.",
          "Pidan que digan la palabra completa en voz alta.",
          "Pregunten: \u00bfQu\u00e9 m\u00e1s empieza con esta s\u00edlaba?",
        ],
        stepsEn: [
          "Do the match word-and-picture page.",
          "Ask them to say the full word aloud.",
          "Ask: What else starts with this syllable?",
        ],
      },
      {
        day: 4,
        minutes: 10,
        titleEs: "Forma palabras",
        titleEn: "Build words",
        stepsEs: [
          "Hagan la p\u00e1gina de arrastrar s\u00edlabas.",
          "Si una palabra es dif\u00edcil, di\u00e1ganla en s\u00edlabas.",
          "Despu\u00e9s pidan que la digan completa.",
        ],
        stepsEn: [
          "Do the drag-the-syllables page.",
          "If a word is hard, say it in syllables.",
          "Then ask them to say it whole.",
        ],
      },
      {
        day: 5,
        minutes: 10,
        titleEs: "Lee en voz alta",
        titleEn: "Read aloud",
        stepsEs: [
          "Hagan la p\u00e1gina de lectura.",
          "Sigan cada palabra con el dedo.",
          "Lean la misma oraci\u00f3n 3 veces juntos.",
        ],
        stepsEn: [
          "Do the reading page.",
          "Follow each word with a finger.",
          "Read the same sentence 3 times together.",
        ],
      },
    ],
    parentNoteEs:
      "10 minutos al d\u00eda son m\u00e1s efectivos que una hora un d\u00eda a la semana. La constancia gana.",
    parentNoteEn: "10 minutes a day works better than one hour once a week. Consistency wins.",
  };
}

export const FAMILY_PLANS: FamilyPlan[] = [
  makePlan(1, "intro"),
  makePlan(2, "Oo"),
  makePlan(3, "Aa"),
  makePlan(4, "Ee"),
  makePlan(5, "Ii"),
  makePlan(6, "Uu"),
  makePlan(7, "Mm"),
  makePlan(8, "Pp"),
  makePlan(9, "Ss"),
  makePlan(10, "Tt"),
  makePlan(11, "Dd"),
  makePlan(12, "Ll"),
  makePlan(13, "Nn"),
  makePlan(14, "\u00d1\u00f1"),
  makePlan(15, "Bb"),
  makePlan(16, "Vv"),
  makePlan(17, "Rr"),
  makePlan(18, "rr"),
  makePlan(19, "Gg"),
  makePlan(20, "Ff"),
  makePlan(21, "Jj"),
  makePlan(22, "Cc"),
  makePlan(23, "Yy"),
  makePlan(24, "Zz"),
];

export function planForLesson(n: number): FamilyPlan | null {
  return FAMILY_PLANS.find((p) => p.lessonN === n) ?? null;
}
