/**
 * Shared final-release route list (file-based SPA routes).
 * Import from final-release-qa.mjs or run: node scripts/validation/routes.mjs
 *
 * Note: aspirational builders in src/lib/cartilla-routes.ts under
 * /cartilla/maestro and /cartilla/familia are intentionally omitted.
 */

/** @typedef {{ id: string, path: string, group: string, auth?: boolean, paramHint?: string }} QaRoute */

/** @type {QaRoute[]} */
export const FINAL_QA_ROUTES = [
  // Public entry
  { id: "home", path: "/", group: "entry" },
  { id: "splash", path: "/cartilla", group: "entry" },
  { id: "login", path: "/login", group: "entry" },
  { id: "ayuda", path: "/cartilla/ayuda", group: "entry" },
  { id: "unirse", path: "/cartilla/unirse", group: "entry" },

  // Student book / lessons
  { id: "lecciones", path: "/cartilla/lecciones", group: "student-book" },
  { id: "leccion-1", path: "/cartilla/leccion/1", group: "student-book" },
  { id: "leccion-7", path: "/cartilla/leccion/7", group: "student-book" },
  { id: "student-libro", path: "/cartilla/student/libro", group: "student-book" },
  { id: "student-libro-vivo", path: "/cartilla/student/libro-vivo", group: "student-book" },
  { id: "student-lecciones", path: "/cartilla/student/lecciones", group: "student-book" },

  // Activities / practice
  { id: "activities", path: "/activities", group: "activity" },
  { id: "practica", path: "/cartilla/practica", group: "activity" },
  { id: "student-practica", path: "/cartilla/student/practica", group: "activity" },
  { id: "repaso", path: "/cartilla/repaso", group: "activity" },

  // Progress
  { id: "mi-progreso", path: "/cartilla/mi-progreso", group: "progress" },
  { id: "student-mi-progreso", path: "/cartilla/student/mi-progreso", group: "progress" },

  // Teacher CRM (auth may redirect)
  { id: "teacher", path: "/cartilla/teacher", group: "teacher-crm", auth: true },
  { id: "teacher-crm", path: "/cartilla/teacher/crm", group: "teacher-crm", auth: true },
  { id: "teacher-reportes", path: "/cartilla/teacher/reportes", group: "teacher-crm", auth: true },
  { id: "teacher-roster", path: "/cartilla/teacher/roster", group: "teacher-crm", auth: true },
  { id: "teacher-progreso", path: "/cartilla/teacher/progreso", group: "teacher-crm", auth: true },
  { id: "teacher-lecciones", path: "/cartilla/teacher/lecciones", group: "teacher-crm", auth: true },
  // Family report — requires real class/student ids after login/seed
  {
    id: "family-reporte",
    path: "/cartilla/teacher/crm/$classId/$studentId/reporte",
    group: "family-report",
    auth: true,
    paramHint: "Replace $classId and $studentId from CRM seed or live class",
  },

  // Flipchart
  { id: "flipchart-1", path: "/cartilla/presentar/1", group: "flipchart" },
  { id: "flipchart-7", path: "/cartilla/presentar/7", group: "flipchart" },

  // Secondary / print
  { id: "binder", path: "/cartilla/binder", group: "print" },
  { id: "teacher-print", path: "/cartilla/teacher/print", group: "print", auth: true },

  // Dev exposure check (record if reachable on prod)
  { id: "dev-workbook-manifest", path: "/dev-workbook-manifest", group: "dev" },
];

export const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

/** Routes safe for unauthenticated automated smoke (no $params). */
export function smokeRoutes() {
  return FINAL_QA_ROUTES.filter((r) => !r.path.includes("$"));
}

const isDirectRun = process.argv[1] && /routes\.mjs$/i.test(process.argv[1].replace(/\\/g, "/"));
if (isDirectRun) {
  console.log(JSON.stringify({ count: FINAL_QA_ROUTES.length, routes: FINAL_QA_ROUTES }, null, 2));
}
