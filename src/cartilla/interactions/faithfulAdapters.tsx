/**
 * Adapters from FaithfulPage region shapes → professional activity hosts.
 * Keeps printed verbs honest; does not invent lesson text.
 */
import type { PageRegion, PageGridCell, PageRegionType } from "@/lib/book-faithful";
import { PaintCanvas } from "./PaintCanvas";
import { DibujaHost, type DibujaPickOption } from "./DibujaHost";
import { LassoConnect, type LassoTarget, type LassoVerbFamily } from "./LassoConnect";
import { CATALOG } from "@/lib/lesson-catalog";

function pageKey(lessonId: string | undefined, regionId: string) {
  return `${lessonId ?? "x"}:${regionId}`;
}

function verbFromText(text?: string): LassoVerbFamily {
  const t = (text ?? "").toLowerCase();
  if (t.includes("encierra")) return "encierra";
  if (t.includes("enlaza")) return "enlaza";
  if (t.includes("conecta")) return "conecta";
  if (t.includes("empareja")) return "empareja";
  if (t.includes("une") || t.includes("traza una línea") || t.includes("traza una linea")) return "une";
  return "encierra";
}

/**
 * Interactive host chosen for a region. Used by FaithfulPageRenderer and
 * integrity tests so Colorea never silently falls back to tap-select.
 */
export type FaithfulHost =
  | "paint"
  | "dibuja"
  | "lasso-mark"
  | "lasso-pair"
  | "tap-grid"
  | "tap-pick"
  | "fill-blank"
  | "trace"
  | "static";

/**
 * Pure mechanic routing: region type + printed instruction → host component.
 * paint-box always paints; draw-box always Dibuja; Encierra/Une/match → lasso.
 */
export function resolveFaithfulHost(
  regionType: PageRegionType,
  precedingInstruction?: string,
): FaithfulHost {
  switch (regionType) {
    case "paint-box":
      return "paint";
    case "draw-box":
      // Dibuja / "Haz un dibujo" freehand — never tap fallback
      return "dibuja";
    case "illustration-slot":
      return instructionSuggestsColorea(precedingInstruction) ? "paint" : "static";
    case "picture-grid":
      if (instructionSuggestsLasso(precedingInstruction)) return "lasso-mark";
      if (instructionSuggestsColorea(precedingInstruction)) return "paint";
      return "tap-grid";
    case "syllable-match":
    case "vowel-line-match":
      return "lasso-mark";
    case "vowel-match-all":
      return "lasso-pair";
    case "vowel-pick-one":
      return "tap-pick";
    case "fill-in-blank":
      return "fill-blank";
    case "writing-line":
      return "trace";
    default:
      return "static";
  }
}

/** Printed color-in verb for the paint host (never renamed to "Toca"). */
export function printedPaintVerb(text?: string): string {
  if (!text) return "Colorea";
  const t = text.toLowerCase();
  if (t.includes("colorea") || t.includes("colorear")) return "Colorea";
  if (/\bpinta\b/.test(t)) return "Pinta";
  return "Colorea";
}

/** Collect pick options from lesson catalog vocab (in-repo art only). */
export function pickOptionsForLesson(lessonNumber?: number): DibujaPickOption[] {
  if (!lessonNumber) return [];
  const entry = CATALOG.find((e) => e.n === lessonNumber);
  if (!entry) return [];
  if (entry.kind === "vowel") {
    const vocab = entry.lesson.vocab ?? [];
    return vocab.slice(0, 4).map((v, i) => ({
      id: `v-${i}-${v.word}`,
      caption: v.word,
      illustrationSrc: v.illustrationSrc,
      // First item that starts with the lesson vowel is correct; else first
      correct: i === 0,
    }));
  }
  if (entry.kind === "consonant") {
    const vocab = entry.data.vocab ?? [];
    return vocab.slice(0, 4).map((v, i) => ({
      id: `c-${i}-${v.word}`,
      caption: v.word,
      illustrationSrc: v.illustrationSrc,
      correct: i === 0,
    }));
  }
  return [];
}

/** Prefer graded cells from a same-page picture-grid when available. */
export function pickOptionsFromCells(cells: PageGridCell[]): DibujaPickOption[] {
  return cells.slice(0, 4).map((c, i) => ({
    id: `cell-${i}-${c.caption ?? i}`,
    caption: c.caption ?? `opción ${i + 1}`,
    illustrationSrc: c.illustrationSrc,
    correct: Boolean(c.correct),
  }));
}

export function PaintFromRegion({
  region,
  lessonId,
  illustrationSrc,
  illustrationAlt,
  instruction,
}: {
  region: PageRegion;
  lessonId?: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
  /** Printed instruction (or region.text) — keeps Colorea/Pinta verb honest. */
  instruction?: string;
}) {
  return (
    <PaintCanvas
      pageKey={pageKey(lessonId, region.id)}
      illustrationSrc={illustrationSrc ?? region.illustrationSrc}
      illustrationAlt={illustrationAlt ?? region.caption ?? region.text ?? ""}
      verbLabel={printedPaintVerb(instruction ?? region.text)}
      lessonId={lessonId}
    />
  );
}

export function DibujaFromRegion({
  region,
  lessonId,
  lessonNumber,
  siblingCells,
}: {
  region: PageRegion;
  lessonId?: string;
  lessonNumber?: number;
  siblingCells?: PageGridCell[];
}) {
  const fromSiblings =
    siblingCells && siblingCells.some((c) => c.correct !== undefined)
      ? pickOptionsFromCells(siblingCells)
      : [];
  const fromLesson = pickOptionsForLesson(lessonNumber);
  // Prefer graded sibling cells; fall back to lesson vocab art
  let pickOptions = fromSiblings.length >= 2 ? fromSiblings : fromLesson;
  // Ensure at least one correct if we only have vocab fallback
  if (pickOptions.length >= 2 && !pickOptions.some((p) => p.correct)) {
    pickOptions = pickOptions.map((p, i) => ({ ...p, correct: i === 0 }));
  }

  return (
    <DibujaHost
      pageKey={pageKey(lessonId, region.id)}
      hint={region.text}
      lessonId={lessonId}
      pickOptions={pickOptions}
    />
  );
}

/** Encierra / syllable-match → mark lasso */
export function LassoSyllableMatch({
  region,
  lessonId,
  instruction,
}: {
  region: PageRegion;
  lessonId?: string;
  instruction?: string;
}) {
  const rows = region.matchRows ?? [];
  const targets: LassoTarget[] = [];
  rows.forEach((row, r) => {
    row.forEach((entry, w) => {
      targets.push({
        id: `${region.id}-${r}-${w}`,
        label: entry.word,
        src: entry.illustrationSrc,
        correct: entry.correct !== false,
        role: "solo",
      });
    });
  });
  // Syllable chip as non-target header handled by instruction
  return (
    <div className="am-faithful-lasso">
      {region.syllable ? (
        <span className="am-faithful-lasso__syllable" aria-hidden>
          {region.syllable}
        </span>
      ) : null}
      <LassoConnect
        pageKey={pageKey(lessonId, region.id)}
        targets={targets}
        mode="mark"
        verbFamily={verbFromText(instruction)}
        instruction={instruction}
        lessonId={lessonId}
      />
    </div>
  );
}

/** Traza una línea vowel-match-all → pair lasso (letter ↔ picture) */
export function LassoVowelMatchAll({
  region,
  lessonId,
  instruction,
}: {
  region: PageRegion;
  lessonId?: string;
  instruction?: string;
}) {
  const pairs = region.vowelPairs ?? [];
  const targets: LassoTarget[] = [];
  pairs.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    targets.push({
      id: `${region.id}-L-${i}`,
      label: pair.letter,
      role: "left",
      pairId,
    });
    targets.push({
      id: `${region.id}-R-${i}`,
      label: pair.caption ?? pair.letter,
      src: pair.illustrationSrc,
      role: "right",
      pairId,
    });
  });
  return (
    <LassoConnect
      pageKey={pageKey(lessonId, region.id)}
      targets={targets}
      mode="pair"
      verbFamily={verbFromText(instruction ?? "Une")}
      instruction={instruction}
      lessonId={lessonId}
    />
  );
}

/** Vowel line match — mark correct pictures with lasso */
export function LassoVowelLineMatch({
  region,
  lessonId,
  instruction,
}: {
  region: PageRegion;
  lessonId?: string;
  instruction?: string;
}) {
  const cells = region.cells ?? [];
  const targets: LassoTarget[] = cells.map((cell, i) => ({
    id: `${region.id}-${i}`,
    label: cell.caption ?? `dibujo ${i + 1}`,
    src: cell.illustrationSrc,
    correct: cell.correct,
    role: "solo",
  }));
  return (
    <div className="am-faithful-lasso">
      {region.letterPair ? (
        <span className="am-faithful-lasso__letter" aria-hidden>
          {region.letterPair}
        </span>
      ) : null}
      <LassoConnect
        pageKey={pageKey(lessonId, region.id)}
        targets={targets}
        mode="mark"
        verbFamily={verbFromText(instruction ?? "Une")}
        instruction={instruction}
        lessonId={lessonId}
      />
    </div>
  );
}

/** Picture-grid with "Encierra" semantics → mark lasso; otherwise unchanged callers handle Marca. */
export function LassoPictureGrid({
  region,
  lessonId,
  instruction,
}: {
  region: PageRegion;
  lessonId?: string;
  instruction?: string;
}) {
  const cells = region.cells ?? [];
  const targets: LassoTarget[] = cells.map((cell, i) => ({
    id: `${region.id}-${i}`,
    label: cell.caption ?? `dibujo ${i + 1}`,
    src: cell.illustrationSrc,
    correct: cell.correct,
    role: "solo",
  }));
  return (
    <LassoConnect
      pageKey={pageKey(lessonId, region.id)}
      targets={targets}
      mode="mark"
      verbFamily={verbFromText(instruction)}
      instruction={instruction}
      lessonId={lessonId}
    />
  );
}

export function instructionSuggestsLasso(text?: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes("encierra") ||
    t.includes("enlaza") ||
    t.includes("conecta") ||
    t.includes("empareja") ||
    /\bune\b/.test(t) ||
    t.includes("traza una línea") ||
    t.includes("traza una linea")
  );
}

export function instructionSuggestsColorea(text?: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  // Printed color-in verbs only — not reading sentences like "Pepe pinta un pino."
  return (
    t.includes("colorea") ||
    t.includes("colorear") ||
    /\bpinta\s+(el|la|los|las|este|esta|estos|estas)\b/.test(t)
  );
}

export function instructionSuggestsDibuja(text?: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes("dibuja") || t.includes("haz un dibujo");
}
