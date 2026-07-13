// teacher-folder-data.ts — per-lesson references for the teacher's 5 guide
// folders (Evaluaciones, Poemas y audio). Derived directly from
// src/content/guia/lesson-N.json (via the shared loader) instead of a
// separately hardcoded table — the old hardcoded table drifted out of sync
// with real content (Lecciones 17-24's rhymes were transcribed into the
// guia JSON but this file still said null for all of them). Deriving from
// the same source of truth the guide pages use means this can't happen
// again.
import { getEvaluationPage, getRhymeTitle } from "@/content/guia/loader";

export interface TeacherFolderLessonData {
  evaluationPage: number | null;
  rhymeTitle: string | null;
}

export function getTeacherFolderData(lessonN: number): TeacherFolderLessonData {
  return {
    evaluationPage: getEvaluationPage(lessonN),
    rhymeTitle: getRhymeTitle(lessonN),
  };
}
