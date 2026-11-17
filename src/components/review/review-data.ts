/**
 * Owner review hub content. Every status here must be backed by evidence in
 * docs/review-2026-11-16/ — never by code existing or a build passing.
 * Labels: DONE and live / DONE but not live / WAITING / NOT TESTED.
 */
export type OwnerStatus = "DONE and live" | "DONE but not live" | "WAITING" | "NOT TESTED";

export interface ReviewLink {
  label: string;
  href: string;
}
export interface Comparison {
  id: string;
  title: string;
  summary: string;
  a: { name: string; description: string; links: ReviewLink[] };
  b?: { name: string; description: string; links: ReviewLink[] };
  /** Why there is no genuine second option, when that is the case. */
  singleOptionReason?: string;
  evidence: ReviewLink[];
  artwork?: boolean;
}

export const REVIEW_REVISION = import.meta.env.VITE_REVIEW_REVISION ?? "work/lessons (local build)";

export const COMPARISONS: Comparison[] = [
  {
    id: "flipchart-lesson-3",
    title: "Teacher Flip Chart — Lesson 3 (sheet 5, “La niña enfermita”)",
    summary:
      "Both use the authentic sheet 5 and the same top-bound 2.0 s flip. They are the two existing ways a teacher can present it.",
    a: {
      name: "A — Projector presenter",
      description:
        "Full-screen classroom view with Puntero, Mano izquierda, Enfoque and Pantalla completa controls; keyboard arrows turn sheets.",
      links: [{ label: "Open A — sheet 5", href: "/cartilla/presentar/3" }],
    },
    b: {
      name: "B — Teacher panel presenter",
      description:
        "The same sheet inside the teacher panel, with the lesson picker, class navigation and a ‘Proyectar pantalla completa’ button.",
      links: [{ label: "Open B — sheet 5", href: "/cartilla/teacher/flipchart?leccion=3" }],
    },
    evidence: [],
  },
];

export interface AreaStatus {
  area: string;
  items: { what: string; status: OwnerStatus; note: string }[];
}

/** Filled from docs/review-2026-11-16/VERIFICATION.md. */
export const AREA_STATUS: AreaStatus[] = [];

export const QUICK_LINKS: { group: string; links: ReviewLink[] }[] = [
  {
    group: "Cover and opening",
    links: [
      { label: "Book cover (student entry)", href: "/" },
      { label: "Opening", href: "/intro" },
      { label: "Lessons list", href: "/cartilla/lecciones" },
    ],
  },
  {
    group: "Student Workbook",
    links: [
      { label: "Lesson 3 — existing draft (pencil not approved)", href: "/cartilla/leccion/3" },
      { label: "Complete book", href: "/cartilla/cuaderno" },
      { label: "Practice", href: "/cartilla/practica" },
    ],
  },
  {
    group: "Teacher",
    links: [
      { label: "Teacher home", href: "/cartilla/teacher" },
      { label: "Flip Chart picker", href: "/cartilla/teacher/flipchart?leccion=3" },
      { label: "Class & students (demo)", href: "/cartilla/teacher/crm" },
      { label: "Reports", href: "/cartilla/teacher/reportes" },
      { label: "Progress", href: "/cartilla/teacher/progreso" },
      { label: "Artwork board", href: "/cartilla/teacher/crm/artwork" },
    ],
  },
  {
    group: "Voice",
    links: [{ label: "Gretel voice policy page", href: "/cartilla/voces" }],
  },
];

// Coverage files have not yet been produced. Do not show broken download links.
export const DOWNLOADS: ReviewLink[] = [];
