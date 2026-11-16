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
    id: "whole-pencil-pose",
    title: "Whole-pencil cursor — exploratory poses on Lesson 3",
    summary:
      "The owner rejected the cropped pencil. These two exploratory poses use the same existing wooden pencil with the whole shape visible; this is not a complete workbook, eraser, or page-turn comparison. The eraser still needs correction and testing. Near an edge the pencil turns inward; the fixed-angle requirement remains unresolved.",
    a: {
      name: "A — pencil rises to the right",
      description: "The whole pencil extends above the graphite point in the center of the screen.",
      links: [
        { label: "Try A in Lesson 3", href: "/cartilla/leccion/3?cursor=contract&pencil=up" },
      ],
    },
    b: {
      name: "B — pencil falls to the right",
      description: "The whole pencil extends below the graphite point in the center of the screen.",
      links: [
        { label: "Try B in Lesson 3", href: "/cartilla/leccion/3?cursor=contract&pencil=down" },
      ],
    },
    evidence: [],
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
    evidence: [],
  },
  {
    id: "pencil-tool-identity",
    title: "Pencil and eraser look (recovered approved look)",
    summary:
      "The rejected November 14 photo-tip prototypes are not offered. The whole-pencil pose experiments reuse the existing wooden pencil. The separate eraser is not complete.",
    a: {
      name: "Recovered look — existing wooden pencil",
      description:
        "The existing pencil is shown in two poses above; these are not two separate pencil artworks.",
      links: [
        { label: "See it on page 7", href: "/cartilla/leccion/3?cursor=contract&pencil=down" },
      ],
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
      {
        label: "Lesson 3 — whole-pencil pose A",
        href: "/cartilla/leccion/3?cursor=contract&pencil=up",
      },
      {
        label: "Lesson 3 — whole-pencil pose B",
        href: "/cartilla/leccion/3?cursor=contract&pencil=down",
      },
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
