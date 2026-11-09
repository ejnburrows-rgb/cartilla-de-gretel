import { describe, it, expect } from "vitest";
import {
  TEACHER_TOPICS,
  searchTeacherKB,
  getTeacherTopicById,
} from "../gretel-teacher-kb";

describe("Teacher Gretel Knowledge Base", () => {
  it("has comprehensive teacher pedagogical topics", () => {
    expect(TEACHER_TOPICS.length).toBeGreaterThanOrEqual(10);
    const ids = TEACHER_TOPICS.map((t) => t.id);
    expect(ids).toContain("metodologia");
    expect(ids).toContain("estructura-clase");
    expect(ids).toContain("rotafolio");
    expect(ids).toContain("cuaderno-estudiante");
    expect(ids).toContain("crm-seguimiento");
    expect(ids).toContain("evaluacion");
    expect(ids).toContain("tablas-silabicas");
    expect(ids).toContain("alumnos-rezago");
    expect(ids).toContain("codigos-familia");
    expect(ids).toContain("poemas-audio");
    expect(ids).toContain("imprimir");
  });

  it("all topics have actionable steps and verified teacher links", () => {
    for (const topic of TEACHER_TOPICS) {
      expect(topic.actionableSteps.es.length).toBeGreaterThanOrEqual(3);
      expect(topic.actionableSteps.en.length).toBeGreaterThanOrEqual(3);
      expect(topic.links.length).toBeGreaterThan(0);
      for (const link of topic.links) {
        expect(link.to.startsWith("/cartilla/")).toBe(true);
      }
    }
  });

  it("searches topics by keyword accurately in Spanish", () => {
    const resultsMetodo = searchTeacherKB("metodologia");
    expect(resultsMetodo.length).toBeGreaterThan(0);
    expect(resultsMetodo[0].id).toBe("metodologia");

    const resultsPacing = searchTeacherKB("minutos clase");
    expect(resultsPacing.length).toBeGreaterThan(0);
    expect(resultsPacing[0].id).toBe("estructura-clase");

    const resultsFlipchart = searchTeacherKB("proyector laser");
    expect(resultsFlipchart.length).toBeGreaterThan(0);
    expect(resultsFlipchart[0].id).toBe("rotafolio");

    const resultsRezago = searchTeacherKB("dificultad rezago");
    expect(resultsRezago.length).toBeGreaterThan(0);
    expect(resultsRezago[0].id).toBe("alumnos-rezago");
  });

  it("searches topics in English", () => {
    const results = searchTeacherKB("workbook", "en");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.id === "cuaderno-estudiante")).toBe(true);
  });

  it("retrieves a topic by exact id", () => {
    const topic = getTeacherTopicById("evaluacion");
    expect(topic).toBeDefined();
    expect(topic?.category).toBe("evaluacion");
    expect(topic?.title.es).toContain("Evaluación");
  });
});
