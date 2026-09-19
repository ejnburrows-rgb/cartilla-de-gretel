import { describe, expect, it } from "vitest";
import { buildStudentLearningInsight, type LearningEvent } from "../literacy-insights";

function exercise(
  lessonId: string,
  score: number,
  total: number,
  day: number,
  exerciseName = "syllable_match",
): LearningEvent {
  return {
    lesson_id: lessonId,
    event_kind: "exercise",
    score,
    total,
    created_at: `2026-09-${String(day).padStart(2, "0")}T12:00:00.000Z`,
    meta: { exercise: exerciseName },
  };
}

function completed(lessonId: string, day: number): LearningEvent {
  return {
    lesson_id: lessonId,
    event_kind: "lesson_completed",
    score: null,
    total: null,
    created_at: `2026-09-${String(day).padStart(2, "0")}T13:00:00.000Z`,
  };
}

describe("buildStudentLearningInsight", () => {
  it("marks repeated low performance as needs review with supporting counts", () => {
    const events = [
      exercise("7", 2, 5, 12),
      exercise("7", 1, 5, 11),
      exercise("7", 2, 5, 10),
    ];
    const insight = buildStudentLearningInsight(events, new Set());
    const skill = insight.skills.find((item) => item.lessonId === "7");

    expect(skill?.status).toBe("needs_review");
    expect(skill?.reason).toContain("errores");
    expect(insight.attention.some((flag) => flag.key === "skill-7")).toBe(true);
    expect(insight.recommendation?.lessonId).toBe("7");
  });

  it("marks a completed lesson with strong repeated accuracy as mastered", () => {
    const events = [
      completed("7", 13),
      exercise("7", 9, 10, 12),
      exercise("7", 8, 10, 11),
    ];
    const insight = buildStudentLearningInsight(events, new Set(["7"]));
    const skill = insight.skills.find((item) => item.lessonId === "7");

    expect(skill?.status).toBe("mastered");
    expect(skill?.recentAccuracy).toBeCloseTo(0.85);
  });

  it("detects a material decline across the newest three vs prior three rounds", () => {
    const events = [
      exercise("7", 4, 10, 14),
      exercise("7", 5, 10, 13),
      exercise("7", 4, 10, 12),
      exercise("7", 9, 10, 11),
      exercise("7", 9, 10, 10),
      exercise("7", 8, 10, 9),
    ];
    const insight = buildStudentLearningInsight(events, new Set());

    expect(insight.attention.some((flag) => flag.key === "decline")).toBe(true);
    expect(insight.attention.find((flag) => flag.key === "decline")?.supportingData).toContain("3 rondas");
  });

  it("flags a started unfinished assignment with the exact lesson skill", () => {
    const events = [exercise("8", 4, 5, 14)];
    const insight = buildStudentLearningInsight(
      events,
      new Set(),
      [{ lesson_id: "8", due_at: null }],
    );

    const flag = insight.attention.find((item) => item.key === "assignment-8");
    expect(flag?.reason).toContain("iniciada");
    expect(flag?.lessonNumber).toBe(8);
  });

  it("maps recorded trace difficulty to the trace review activity", () => {
    const events = [
      exercise("7", 1, 5, 14, "workbook_letter_trace"),
      exercise("7", 2, 5, 13, "workbook_letter_trace"),
      exercise("7", 2, 5, 12, "workbook_letter_trace"),
    ];
    const insight = buildStudentLearningInsight(events, new Set());

    expect(insight.recommendation?.activity).toBe("trazar");
  });

  it("maps sound-search difficulty to the sound-search review activity", () => {
    const events = [
      exercise("7", 1, 5, 14, "sound_search"),
      exercise("7", 2, 5, 13, "sound_search"),
      exercise("7", 2, 5, 12, "sound_search"),
    ];
    const insight = buildStudentLearningInsight(events, new Set());

    expect(insight.recommendation?.activity).toBe("sonido");
  });

  it("maps Gretel mirror difficulty to pronunciation review", () => {
    const events = [
      exercise("7", 1, 5, 14, "gretel_mirror"),
      exercise("7", 2, 5, 13, "gretel_mirror"),
      exercise("7", 2, 5, 12, "gretel_mirror"),
    ];
    const insight = buildStudentLearningInsight(events, new Set());

    expect(insight.recommendation?.activity).toBe("espejo");
  });

  it("keeps a brand-new student factual: no activity and curriculum starts at lesson 1", () => {
    const insight = buildStudentLearningInsight([], new Set());

    expect(insight.skills).toHaveLength(1);
    expect(insight.skills[0].status).toBe("introduced");
    expect(insight.attention[0].reason).toBe("Sin actividad registrada");
    expect(insight.recommendation?.lessonNumber).toBe(1);
  });
});
