/**
 * Offline substitute teacher — deterministic guidance based on the *existing*
 * Cartilla catalog. No AI, voice synthesis, invented worksheets or cloud sync.
 * The workbook and Flip Chart remain their original interactive experiences.
 */
import { CATALOG } from "@/lib/lesson-catalog";

export type SubstituteStage = "presentacion" | "practica" | "cuaderno" | "cierre";

export interface SubstituteQuestion {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
  hint: string;
}

export interface SubstituteLesson {
  number: number;
  title: string;
  subtitle: string;
  questions: SubstituteQuestion[];
  workbookPath: string;
  flipchartPath: string;
  practicePath: string;
}

export interface SubstituteSession {
  version: 1;
  lesson: number;
  stage: SubstituteStage;
  questionIndex: number;
  correct: number;
  retries: number;
  updatedAt: number;
}

export interface LocalSubstituteReport {
  schemaVersion: 1;
  lessonNumber: number;
  lessonTitle: string;
  guidedQuestionsCorrect: number;
  guidedRetries: number;
  workbookVerified: boolean;
  stageReached: SubstituteStage;
  exportStatus: "LOCAL_ONLY";
  audioRecognition: "NOT_CONFIGURED";
}

export const SUBSTITUTE_STORAGE_KEY = "cartilla.substitute-teacher.v1";
export const SUBSTITUTE_INACTIVITY_MS = 9000;

const VOWELS = ["a", "e", "i", "o", "u"];
const STAGES: SubstituteStage[] = ["presentacion", "practica", "cuaderno", "cierre"];
const normalized = (s: string) => s.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function makeQuestion(id: string, prompt: string, answer: string, options: string[]): SubstituteQuestion {
  return {
    id,
    prompt,
    answer,
    options,
    hint: "Observa el comienzo de la palabra. Puedes intentarlo otra vez.",
  };
}

/** Words/syllables originate ONLY from the canonical app catalog. */
export function getSubstituteLesson(n: number): SubstituteLesson | null {
  const entry = CATALOG.find((item) => item.n === n);
  if (!entry) return null;
  let questions: SubstituteQuestion[];
  if (entry.kind === "intro") {
    questions = VOWELS.map((v, i) =>
      makeQuestion(`intro-${i}`, `Toca la vocal «${v}».`, v, [...VOWELS]),
    );
  } else if (entry.kind === "vowel") {
    const focus = entry.vowel.toLowerCase();
    const words = entry.lesson.vocab
      .map((item) => item.word.trim())
      .filter((word) => normalized(word).startsWith(focus))
      .slice(0, 5);
    questions = (words.length ? words : [focus]).map((word, i) =>
      makeQuestion(
        `vowel-${n}-${i}`,
        words.length ? `¿Con qué vocal comienza «${word}»?` : `Selecciona la vocal «${focus}».`,
        focus,
        [...VOWELS],
      ),
    );
  } else {
    const syllables = entry.data.syllables;
    questions = syllables.map((syllable, i) => {
      const word = (entry.data.examples[syllable] ?? [])
        .find((sample) => normalized(sample).startsWith(normalized(syllable)));
      return makeQuestion(
        `syllable-${n}-${i}`,
        word ? `¿Con qué sílaba comienza «${word}»?` : `Selecciona la sílaba «${syllable}».`,
        syllable,
        [...syllables],
      );
    });
  }
  return {
    number: entry.n,
    title: entry.title,
    subtitle: entry.subtitle,
    questions,
    workbookPath: `/cartilla/leccion/${n}`,
    flipchartPath: `/cartilla/presentar/${n}`,
    practicePath: `/cartilla/practica?lesson=${n}`,
  };
}

export function createSubstituteSession(lesson: number): SubstituteSession {
  if (!getSubstituteLesson(lesson)) throw new Error("Lección no disponible");
  return { version: 1, lesson, stage: "presentacion", questionIndex: 0, correct: 0, retries: 0, updatedAt: Date.now() };
}

export function startSubstitutePractice(session: SubstituteSession): SubstituteSession {
  if (session.stage !== "presentacion") return session;
  return { ...session, stage: "practica", updatedAt: Date.now() };
}

export function recordSubstituteAnswer(session: SubstituteSession, choice: string): SubstituteSession {
  if (session.stage !== "practica") return session;
  const lesson = getSubstituteLesson(session.lesson);
  const question = lesson?.questions[session.questionIndex];
  if (!question || !question.options.includes(choice)) return session;
  if (normalized(choice) !== normalized(question.answer)) {
    return { ...session, retries: session.retries + 1, updatedAt: Date.now() };
  }
  const next = session.questionIndex + 1;
  return {
    ...session,
    questionIndex: next,
    correct: session.correct + 1,
    stage: next >= lesson!.questions.length ? "cuaderno" : "practica",
    updatedAt: Date.now(),
  };
}

/** Completion is read from the real workbook progress system, never guessed. */
export function verifyWorkbookCompletion(session: SubstituteSession, completedInWorkbook: boolean): SubstituteSession {
  if (session.stage !== "cuaderno" || !completedInWorkbook) return session;
  return { ...session, stage: "cierre", updatedAt: Date.now() };
}

export function parseStoredSubstituteSession(raw: string | null): SubstituteSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SubstituteSession>;
    if (value.version !== 1 || !Number.isInteger(value.lesson) || !STAGES.includes(value.stage as SubstituteStage)) return null;
    const lesson = getSubstituteLesson(value.lesson!);
    if (!lesson || !Number.isInteger(value.questionIndex) || value.questionIndex! < 0 || value.questionIndex! > lesson.questions.length) return null;
    if (!Number.isInteger(value.correct) || value.correct! < 0 || value.correct! > value.questionIndex!) return null;
    if (!Number.isInteger(value.retries) || value.retries! < 0 || value.retries! > 100000) return null;
    return {
      version: 1,
      lesson: value.lesson!,
      stage: value.stage!,
      questionIndex: value.questionIndex!,
      correct: value.correct!,
      retries: value.retries!,
      updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt! : Date.now(),
    };
  } catch {
    return null;
  }
}

export function readSubstituteSession(): SubstituteSession | null {
  if (typeof window === "undefined") return null;
  try { return parseStoredSubstituteSession(localStorage.getItem(SUBSTITUTE_STORAGE_KEY)); }
  catch { return null; }
}

/** Returns false if storage is blocked; UI must not claim saved in that case. */
export function saveSubstituteSession(session: SubstituteSession): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(SUBSTITUTE_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch { return false; }
}

export function buildLocalSubstituteReport(session: SubstituteSession, workbookVerified: boolean): LocalSubstituteReport {
  const lesson = getSubstituteLesson(session.lesson);
  if (!lesson) throw new Error("Lección no disponible");
  return {
    schemaVersion: 1,
    lessonNumber: session.lesson,
    lessonTitle: lesson.title,
    guidedQuestionsCorrect: session.correct,
    guidedRetries: session.retries,
    workbookVerified: session.stage === "cierre" && workbookVerified,
    stageReached: session.stage,
    exportStatus: "LOCAL_ONLY",
    audioRecognition: "NOT_CONFIGURED",
  };
}
