import { describe, expect, it } from "vitest";
import {
  buildLocalSubstituteReport,
  createSubstituteSession,
  getSubstituteLesson,
  parseStoredSubstituteSession,
  recordSubstituteAnswer,
  startSubstitutePractice,
  verifyWorkbookCompletion,
} from "../offline-substitute-teacher";

describe("offline substitute teacher", () => {
  it("uses the real 24-lesson catalog instead of invented ZIP lessons", () => {
    expect(getSubstituteLesson(1)?.title).toContain("vocales");
    expect(getSubstituteLesson(2)?.title).toBe("La vocal O");
    expect(getSubstituteLesson(7)?.title).toBe("La consonante Mm");
    expect(getSubstituteLesson(24)?.title).toContain("consonante");
    expect(getSubstituteLesson(25)).toBeNull();
  });

  it("creates visual activities only from the matching lesson's real material", () => {
    const lesson2 = getSubstituteLesson(2)!;
    expect(lesson2.questions.length).toBeGreaterThan(0);
    expect(lesson2.questions.every((q) => q.answer === "o")).toBe(true);
    expect(lesson2.questions.every((q) => q.options.includes(q.answer))).toBe(true);

    const lesson7 = getSubstituteLesson(7)!;
    expect(lesson7.questions.map((q) => q.answer)).toEqual(["ma", "me", "mi", "mo", "mu"]);
    expect(lesson7.questions.every((q) => q.options.includes(q.answer))).toBe(true);
    expect(lesson7.workbookPath).toBe("/cartilla/leccion/7");
  });

  it("retains the current question after a wrong answer and advances on correct touch", () => {
    const lesson = getSubstituteLesson(7)!;
    let session = startSubstitutePractice(createSubstituteSession(7));
    const question = lesson.questions[0]!;
    const wrong = question.options.find((option) => option !== question.answer)!;
    session = recordSubstituteAnswer(session, wrong);
    expect(session.questionIndex).toBe(0);
    expect(session.retries).toBe(1);
    expect(session.correct).toBe(0);
    session = recordSubstituteAnswer(session, question.answer);
    expect(session.questionIndex).toBe(1);
    expect(session.correct).toBe(1);
    expect(session.stage).toBe("practica");
  });

  it("does not certify workbook completion just because guided questions ended", () => {
    const lesson = getSubstituteLesson(2)!;
    let session = startSubstitutePractice(createSubstituteSession(2));
    for (const question of lesson.questions) {
      session = recordSubstituteAnswer(session, question.answer);
    }
    expect(session.stage).toBe("cuaderno");
    expect(verifyWorkbookCompletion(session, false).stage).toBe("cuaderno");
    expect(verifyWorkbookCompletion(session, true).stage).toBe("cierre");
    expect(buildLocalSubstituteReport(session, false).workbookVerified).toBe(false);
  });

  it("does not fabricate remote sync, speech recognition or a student identity", () => {
    const report = buildLocalSubstituteReport(createSubstituteSession(1), false);
    expect(report.exportStatus).toBe("LOCAL_ONLY");
    expect(report.audioRecognition).toBe("NOT_CONFIGURED");
    expect(JSON.stringify(report)).not.toMatch(/studentName|transcript|syncedAt|teacherBadgeId/);
  });

  it("restores only valid sessions, never accepts corrupt or mismatched state", () => {
    const saved = createSubstituteSession(3);
    expect(parseStoredSubstituteSession(JSON.stringify(saved))?.lesson).toBe(3);
    expect(parseStoredSubstituteSession('{"lesson":99,"stage":"cierre"}')).toBeNull();
    expect(parseStoredSubstituteSession("broken")).toBeNull();
  });
});
