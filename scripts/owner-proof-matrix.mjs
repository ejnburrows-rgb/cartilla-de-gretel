/**
 * Immutable source-route contract for the 60 genuine owner-proof screenshots.
 * Shared by the proof launcher and integrity tests. It never labels captures approved.
 */
export const PROOF_DEVICES = ["phone", "tablet", "laptop", "projector"];
const WORKBOOK_ARCHETYPES = [
  { archetype: 1, lesson: 1, printedPage: 1, name: "archetype-1-picture-grid" },
  { archetype: 2, lesson: 1, printedPage: 2, name: "archetype-2-vowel-row-choices" },
  { archetype: 3, lesson: 1, printedPage: 3, name: "archetype-3-multi-pair-connect" },
  { archetype: 4, lesson: 6, printedPage: 17, name: "archetype-4-central-target-connect" },
  { archetype: 5, lesson: 7, printedPage: 19, name: "archetype-5-trace-and-draw" },
  { archetype: 6, lesson: 7, printedPage: 20, name: "archetype-6-syllable-circle" },
  { archetype: 7, lesson: 7, printedPage: 21, name: "archetype-7-phonics-reading" },
  { archetype: 8, lesson: 7, printedPage: 22, name: "archetype-8-word-and-sentence" },
];
const OTHER_SURFACES = [
  { filename: "teacher-home", route: "/cartilla/teacher", surface: "teacher" },
  { filename: "teacher-guide", route: "/cartilla/teacher/guia/1", surface: "teacher" },
  { filename: "teacher-flipchart-p9", route: "/cartilla/presentar/7", surface: "flipchart", lesson: 7, printedPage: 9 },
  { filename: "teacher-flipchart-turn-p10", route: "/cartilla/presentar/7", surface: "flipchart", lesson: 7, printedPage: 10 },
  { filename: "teacher-progreso", route: "/cartilla/teacher/progreso", surface: "teacher" },
  { filename: "teacher-reportes", route: "/cartilla/teacher/reportes", surface: "teacher" },
  { filename: "student-lesson1", route: "/cartilla/leccion/1", surface: "student", lesson: 1, printedPage: 1 },
];
export function expectedOwnerProofCaptures() {
  const captures = [];
  for (const device of PROOF_DEVICES) {
    for (const arch of WORKBOOK_ARCHETYPES) {
      const route = `/cartilla/leccion/${arch.lesson}`;
      captures.push({
        filename: `workbook-${arch.name}-${device}.png`,
        route, expectedRoute: route, device, surface: "workbook",
        lesson: arch.lesson, printedPage: arch.printedPage, archetype: arch.archetype,
        sourceStandards: ["WORKBOOK_ARCHETYPE_STANDARD.md", "STUDENT_INTERACTION_STANDARD.md"],
        approvalStatus: "NOT_OWNER_APPROVED",
      });
    }
    for (const entry of OTHER_SURFACES) {
      captures.push({
        filename: `${entry.filename}-${device}.png`,
        route: entry.route, expectedRoute: entry.route, device, surface: entry.surface,
        ...(entry.lesson !== undefined ? { lesson: entry.lesson } : {}),
        ...(entry.printedPage !== undefined ? { printedPage: entry.printedPage } : {}),
        sourceStandards: entry.surface === "student"
          ? ["WORKBOOK_ARCHETYPE_STANDARD.md", "STUDENT_INTERACTION_STANDARD.md"]
          : ["PROJECT_SOURCE_OF_TRUTH.md", "DESIGN.md"],
        approvalStatus: "NOT_OWNER_APPROVED",
      });
    }
  }
  return captures;
}
