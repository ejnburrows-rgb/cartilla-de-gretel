// Single loader for src/content/guia/lesson-N.json — the schema'd (see
// SCHEMA.md), per-lesson Teacher's Guide data. Anything that needs a
// lesson's objectives/motivation/script/evaluation/rhyme should read it
// through here rather than re-importing the JSON or re-hardcoding values
// elsewhere — that duplication is exactly what let teacher-folder-data.ts
// and the guides/lesson-N.tsx components drift out of sync with real,
// already-transcribed content (e.g. Lecciones 17-24's rhymes existed in the
// JSON but were never surfaced anywhere else).
import manifest from "./manifest.json";

export interface GuiaLessonData {
  lessonId: number;
  objectives: string[];
  motivation: string;
  script: string;
  evaluationRef: { page: number | null; note: string };
  rhyme: { title: string | null; text: string | null };
  provenance: { source: string; verified: boolean };
}

export type GuiaManifestStatus =
  | "transcribed"
  | "rhyme_only_no_teacher_guide_source"
  | "missing_content";

const lessonModules = import.meta.glob("./lesson-*.json", { eager: true }) as Record<
  string,
  { default: GuiaLessonData }
>;

const BY_ID = new Map<number, GuiaLessonData>();
for (const [path, mod] of Object.entries(lessonModules)) {
  const match = path.match(/lesson-(\d+)\.json$/);
  if (match) BY_ID.set(Number(match[1]), mod.default);
}

/** AWAITING-SOURCE-SCAN is the on-disk placeholder marker (sometimes a bare
 * string, sometimes prefixed to a longer explanatory note — e.g. "AWAITING-
 * SOURCE-SCAN — no Teacher's Guide book scan exists..."), and "missing-from-
 * source" is the variant used by a couple of hand-entered lessons. Both mean
 * "nothing real here", never real content — checked with startsWith rather
 * than exact equality since the explanatory suffix is real, present text. */
function isRealText(value: string | null | undefined): value is string {
  if (!value) return false;
  return !value.startsWith("AWAITING-SOURCE-SCAN") && value !== "missing-from-source";
}

export function getGuiaLesson(lessonId: number): GuiaLessonData | null {
  return BY_ID.get(lessonId) ?? null;
}

export function getGuiaManifestStatus(lessonId: number): GuiaManifestStatus {
  const entry = (manifest as { lessons: Record<string, { status: GuiaManifestStatus }> }).lessons[
    String(lessonId)
  ];
  return entry?.status ?? "missing_content";
}

/** Real rhyme title, or null if this lesson's rhyme was never transcribed. */
export function getRhymeTitle(lessonId: number): string | null {
  const lesson = getGuiaLesson(lessonId);
  return lesson && isRealText(lesson.rhyme.title) ? lesson.rhyme.title : null;
}

/** Real rhyme text, or null if this lesson's rhyme text isn't transcribed
 * (some early lessons have a real title but the body was never captured). */
export function getRhymeText(lessonId: number): string | null {
  const lesson = getGuiaLesson(lessonId);
  return lesson && isRealText(lesson.rhyme.text) ? lesson.rhyme.text : null;
}

export function getEvaluationPage(lessonId: number): number | null {
  return getGuiaLesson(lessonId)?.evaluationRef.page ?? null;
}

export function hasRealObjectives(lessonId: number): boolean {
  const lesson = getGuiaLesson(lessonId);
  return !!lesson && lesson.objectives.some(isRealText) && isRealText(lesson.objectives[0]);
}

export { isRealText };
