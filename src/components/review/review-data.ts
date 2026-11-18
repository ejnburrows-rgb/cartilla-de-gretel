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

const toLinks = (pairs: [string, string][]): ReviewLink[] =>
  pairs.map(([label, href]) => ({ label, href }));

export const COMPARISONS: Comparison[] = [
  {
    id: "workbook-lesson-3",
    title: "Student Workbook — Lesson 3 (Pages 7–9, Locked @image1 Pencil)",
    summary:
      "Both candidates use the locked PENCIL-CURSOR-SPEC.md (@image1) pencil cursor. Compare Option A (corner lift without specular highlight, ?cursor=contract&curl=a) against Option B (locked default: clean canvas + warm cream roll with specular highlight and mark-in-progress guard).",
    a: {
      name: "A — Corner lift baseline curl (curl=a)",
      description:
        "Locked @image1 pencil cursor (#3a3a38 charcoal, green/red feedback, 12 pink crumbs) with corner-lift page curl without specular highlight.",
      links: toLinks([["Open A — corner curl", "/cartilla/leccion/3?cursor=contract&curl=a"]]),
    },
    b: {
      name: "B — Warm cream roll with specular highlight (Locked Default)",
      description:
        "Locked @image1 pencil cursor (#3a3a38 charcoal, 3.3–6.4 px stroke, 400 ms hold, 12 pink crumbs on red wrong marks), clean canvas (no Gretel overlay), warm cream roll with specular highlight and mark-in-progress guard.",
      links: toLinks([["Open B — default", "/cartilla/leccion/3?cursor=contract"]]),
    },
    evidence: toLinks([["A vs B side by side (desktop)", "/review/media/ab-lesson3-1366.svg"]]),
  },
  {
    id: "cow-game",
    title: "Cow game — draft comparison",
    summary:
      "Two ways to play the same existing farm game. Neither is approved; audio is silent pending verified recordings. A includes misleading repeated side scenery on wide screens.",
    a: {
      name: "A — Free selection",
      description: "Choose either a cow or a slot first. Existing farm scene and game flow.",
      links: toLinks([["Open A — free selection", "/cartilla/juego/cow-game-m?cow=free"]]),
    },
    b: {
      name: "B — Guided steps",
      description:
        "Choose a cow first, then a slot. An on-screen instruction changes at each step; repeated side scenery is removed.",
      links: toLinks([["Open B — guided steps", "/cartilla/juego/cow-game-m?cow=guided"]]),
    },
    evidence: [],
  },
  {
    id: "workbook-page-turn",
    title: "Workbook page turn — Lesson 3",
    summary:
      "Warm cream roll with specular highlight and mark-in-progress guard is default; straight-edge or fallback curl remain available via query parameter.",
    a: {
      name: "A — Corner lift / fallback curl",
      description: "The diagonal fold begins at the bottom-right corner and sweeps left.",
      links: toLinks([["Open A — corner lift", "/cartilla/leccion/3?curl=corner"]]),
    },
    b: {
      name: "B — Straight-edge roll",
      description: "An experimental straight vertical fold sweeps from right to left instead of tilting diagonally.",
      links: toLinks([["Open B — straight-edge roll", "/cartilla/leccion/3?curl=edge"]]),
    },
    evidence: [],
  },
  {
    id: "flipchart-lesson-3",
    title: "Teacher Flip Chart — Lesson 3 (sheet 5, “La niña enfermita”)",
    summary:
      "Both use the authentic crisp unstretched sheet 5 and the top-bound 2.0 s spiral flip.",
    a: {
      name: "A — Projector presenter",
      description:
        "Full-screen classroom view with Puntero, Mano izquierda, Enfoque and Pantalla completa controls; keyboard arrows turn sheets.",
      links: toLinks([["Open A — sheet 5", "/cartilla/presentar/3"]]),
    },
    b: {
      name: "B — Teacher panel presenter",
      description:
        "The same sheet inside the teacher panel, with the lesson picker, class navigation and a ‘Proyectar pantalla completa’ button.",
      links: toLinks([["Open B — sheet 5", "/cartilla/teacher/flipchart?lesson=3"]]),
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

const GAME_SLUGS: [string, string][] = [
  ["Cow game", "cow-game-m"],
  ["Butterfly garden", "mariposas-p"],
  ["Payaso Chano", "payaso-chano-ss"],
  ["Vocal A", "vocal-a"],
  ["Fonética P", "fonetica-p"],
  ["Sílabas O", "silabas-o"],
  ["Sílabas M", "silabas-m"],
  ["Sílabas P", "silabas-p"],
  ["Rima P", "rima-p"],
  ["Palabras por minuto", "palabras-minuto-p"],
  ["Dibujos O", "dibujos-o"],
  ["Completar palabras", "completar-palabras"],
];

export const QUICK_LINKS: { group: string; links: ReviewLink[] }[] = [
  {
    group: "Cover and opening",
    links: toLinks([
      ["Book cover (student entry)", "/"],
      ["Opening", "/intro"],
      ["Lessons list", "/cartilla/lecciones"],
    ]),
  },
  {
    group: "Student Workbook",
    links: toLinks([
      ["Lesson 3 — Option B default", "/cartilla/leccion/3"],
      ["Complete book", "/cartilla/cuaderno"],
      ["Practice", "/cartilla/practica"],
    ]),
  },
  {
    group: "Teacher",
    links: toLinks([
      ["Teacher home", "/cartilla/teacher"],
      ["Flip Chart picker", "/cartilla/teacher/flipchart?lesson=3"],
      ["Class & students (demo)", "/cartilla/teacher/crm"],
      ["Reports", "/cartilla/teacher/reportes"],
      ["Progress", "/cartilla/teacher/progreso"],
      ["Artwork board", "/cartilla/teacher/crm/artwork"],
    ]),
  },
  {
    group: "Games — existing routes, not A/B approvals",
    links: GAME_SLUGS.map(([label, slug]) => ({ label, href: `/cartilla/juego/${slug}` })),
  },
  {
    group: "Voice",
    links: toLinks([["Gretel voice policy page", "/cartilla/voces"]]),
  },
];

export const DOWNLOADS: ReviewLink[] = toLinks([
  ["Locked Option B decision ledger (JSON)", "/review/owner-decisions-locked-b.json"],
]);
