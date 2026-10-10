import { describe, expect, it } from "vitest";
import {
  fillTemplate,
  letterTemplate,
  PARENT_LETTERS,
  type LetterKind,
} from "../parent-letter-templates";

describe("parent-letter-templates", () => {
  const kinds: LetterKind[] = [
    "welcome",
    "weekly-progress",
    "celebration",
    "intervention",
    "absence-followup",
    "conference-request",
  ];

  const testVars = {
    name: "Sofía",
    teacher: "Maestra Elena",
    lesson: "M-1",
    level: "Básico",
  };

  it("contains all six bilingual letter templates", () => {
    expect(PARENT_LETTERS.length).toBe(6);
    for (const kind of kinds) {
      const template = letterTemplate(kind);
      expect(template).toBeDefined();
      expect(template?.subjectEs).toBeTruthy();
      expect(template?.subjectEn).toBeTruthy();
      expect(template?.bodyEs).toBeTruthy();
      expect(template?.bodyEn).toBeTruthy();
    }
  });

  it("successfully fills all placeholders in Spanish and English for all six templates", () => {
    for (const kind of kinds) {
      const template = letterTemplate(kind)!;

      const filledSubjectEs = fillTemplate(template.subjectEs, testVars);
      const filledSubjectEn = fillTemplate(template.subjectEn, testVars);
      const filledBodyEs = fillTemplate(template.bodyEs, testVars);
      const filledBodyEn = fillTemplate(template.bodyEn, testVars);

      // Verify no remaining braced placeholders leak
      expect(filledSubjectEs).not.toMatch(/\{\{\w+\}\}/);
      expect(filledSubjectEn).not.toMatch(/\{\{\w+\}\}/);
      expect(filledBodyEs).not.toMatch(/\{\{\w+\}\}/);
      expect(filledBodyEn).not.toMatch(/\{\{\w+\}\}/);

      // Verify key values were actually interpolated where expected
      if (template.subjectEs.includes("{{name}}")) {
        expect(filledSubjectEs).toContain("Sofía");
      }
      if (template.bodyEs.includes("{{name}}")) {
        expect(filledBodyEs).toContain("Sofía");
      }
      if (template.bodyEs.includes("{{teacher}}")) {
        expect(filledBodyEs).toContain("Maestra Elena");
      }
      if (template.bodyEs.includes("{{lesson}}")) {
        expect(filledBodyEs).toContain("M-1");
      }
      if (template.bodyEs.includes("{{level}}")) {
        expect(filledBodyEs).toContain("Básico");
      }

      if (template.subjectEn.includes("{{name}}")) {
        expect(filledSubjectEn).toContain("Sofía");
      }
      if (template.bodyEn.includes("{{name}}")) {
        expect(filledBodyEn).toContain("Sofía");
      }
      if (template.bodyEn.includes("{{teacher}}")) {
        expect(filledBodyEn).toContain("Maestra Elena");
      }
      if (template.bodyEn.includes("{{lesson}}")) {
        expect(filledBodyEn).toContain("M-1");
      }
      if (template.bodyEn.includes("{{level}}")) {
        expect(filledBodyEn).toContain("Básico");
      }
    }
  });

  it("handles missing variables explicitly without leaking raw {{key}} placeholders into parent preview", () => {
    const template = letterTemplate("weekly-progress")!;
    // Omit teacher, lesson, level
    const partialVars = { name: "Sofía" };

    const resultWithDefaultFallback = fillTemplate(template.bodyEn, partialVars);
    expect(resultWithDefaultFallback).not.toContain("{{teacher}}");
    expect(resultWithDefaultFallback).not.toContain("{{lesson}}");
    expect(resultWithDefaultFallback).not.toContain("{{level}}");
    expect(resultWithDefaultFallback).toContain("Sofía");

    // Test explicit fallback option
    const resultWithCustomFallback = fillTemplate(template.bodyEn, partialVars, {
      fallback: "[N/A]",
    });
    expect(resultWithCustomFallback).toContain("[N/A]");
    expect(resultWithCustomFallback).not.toContain("{{teacher}}");
  });

  it("does not blindly replace common narrative words within non-template text", () => {
    const narrativeText = "The teacher gave a great lesson today at a high level.";
    const result = fillTemplate(narrativeText, testVars);
    expect(result).toBe("The teacher gave a great lesson today at a high level.");
  });
});
