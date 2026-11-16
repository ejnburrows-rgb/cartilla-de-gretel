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
const media = (f: string) => `/review/media/${f}`;

export const COMPARISONS: Comparison[] = [
  {
    id: "workbook-lesson-3",
    title: "Student Workbook — Lesson 3 (printed pages 7, 8, 9)",
    summary:
      "Same real lesson, same pages, same artwork, same saving and page curl. Only the pencil and eraser presentation differs.",
    a: {
      name: "A — Current book pencil",
      description:
        "What main shows today: normal arrow pointer; the full wooden pencil flies in from the right edge, draws the X in green or red from the first line, and the pencil’s eraser end flies in to rub out wrong marks (4 s).",
      links: [{ label: "Open A — page 7", href: "/cartilla/leccion/3?cursor=normal" }],
    },
    b: {
      name: "B — November 1 pencil rules",
      description:
        "The same wooden pencil, shown as one large close-up tip that is the pointer (graphite point = hotspot, pointing up-left). Mark draws in charcoal, holds 0.4 s, then turns forest green (stays) or crimson red. Close-up eraser end rubs for 3.5 s with 12 pink crumbs; the pencil hides while it erases.",
      links: [{ label: "Open B — page 7", href: "/cartilla/leccion/3?cursor=contract" }],
    },
    evidence: [
      { label: "A vs B side by side (desktop)", href: media("ab-lesson3-1366.svg") },
    ],
  },
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
    evidence: [
    ],
  },
  {
    id: "pencil-tool-identity",
    title: "Pencil and eraser look (recovered approved look)",
    summary:
      "The rejected November 14 photo-tip prototypes are NOT offered. Both A and B above reuse the wooden pencil already approved in the book (October 11 look). No new pencil or eraser artwork was drawn.",
    a: {
      name: "Recovered look — existing wooden pencil",
      description: "One source exists in the repository. A second look would have to be invented, so none is offered.",
      links: [{ label: "See it on page 7 (B)", href: "/cartilla/leccion/3?cursor=contract" }],
    },
    singleOptionReason:
      "Only one owner-approved pencil drawing exists in the repository; a separate block-shaped school eraser drawing does not exist. Asking for one is listed under ‘What is missing’.",
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
      { label: "Lesson 3 (A)", href: "/cartilla/leccion/3?cursor=normal" },
      { label: "Lesson 3 (B)", href: "/cartilla/leccion/3?cursor=contract" },
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
