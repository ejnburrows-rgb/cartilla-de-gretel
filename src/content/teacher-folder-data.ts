// teacher-folder-data.ts — per-lesson references for the teacher's 5 guide
// folders (Evaluaciones, Poemas y audio). Values for lessons 1-15 are
// extracted verbatim from docs/Transcripción Integral_ La cartilla de Gretel
// - Guía del profesor.txt (Evaluation page + Reproducible Rhyme title per
// lesson). Lesson 16's rhyme title is not in that transcription (it cuts off
// mid-Lección 15) and is not in the existing lesson-16 guide file either —
// honestly left null rather than guessed. Lessons 17-24 have no teacher's
// guide source anywhere in the repo or its git history (confirmed by an
// exhaustive all-branches, all-formats search) — evaluationPage/rhymeTitle
// are null; the app must show this as pending, never invent a page number
// or a poem title.
export interface TeacherFolderLessonData {
  evaluationPage: number | null;
  rhymeTitle: string | null;
}

export const TEACHER_FOLDER_DATA: Record<number, TeacherFolderLessonData> = {
  1: { evaluationPage: 1, rhymeTitle: "Cinco hermanitas" },
  2: { evaluationPage: 2, rhymeTitle: "Arre caballito" },
  3: { evaluationPage: 3, rhymeTitle: "La niña enfermita" },
  4: { evaluationPage: 4, rhymeTitle: "La niña sordita" },
  5: { evaluationPage: 5, rhymeTitle: "La niña llorona" },
  6: { evaluationPage: 6, rhymeTitle: "La brujita" },
  7: { evaluationPage: 7, rhymeTitle: "Mi mamá" },
  8: { evaluationPage: 8, rhymeTitle: "Mi papá" },
  9: { evaluationPage: 9, rhymeTitle: "Sapo Samapo" },
  10: { evaluationPage: 10, rhymeTitle: "La sopa de pato" },
  11: { evaluationPage: 11, rhymeTitle: "Mada, papá y mamá" },
  12: { evaluationPage: 12, rhymeTitle: "Leo lee" },
  13: { evaluationPage: 13, rhymeTitle: "¡A nadar!" },
  14: { evaluationPage: 14, rhymeTitle: "La niña sueña" },
  15: { evaluationPage: 15, rhymeTitle: null },
  16: { evaluationPage: 16, rhymeTitle: null },
  17: { evaluationPage: null, rhymeTitle: null },
  18: { evaluationPage: null, rhymeTitle: null },
  19: { evaluationPage: null, rhymeTitle: null },
  20: { evaluationPage: null, rhymeTitle: null },
  21: { evaluationPage: null, rhymeTitle: null },
  22: { evaluationPage: null, rhymeTitle: null },
  23: { evaluationPage: null, rhymeTitle: null },
  24: { evaluationPage: null, rhymeTitle: null },
};

export function getTeacherFolderData(lessonN: number): TeacherFolderLessonData {
  return TEACHER_FOLDER_DATA[lessonN] ?? { evaluationPage: null, rhymeTitle: null };
}
