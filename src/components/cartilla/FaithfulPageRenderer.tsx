import type { ReactNode } from "react";
import { getPageLayout, type PageGridCell, type PageRegion } from "@/lib/book-faithful";
// PageGridCell used by RegionView siblingCells for Dibuja pick options
import { PageFrame } from "./PageFrame";
import { CATALOG } from "@/lib/lesson-catalog";
import {
  InteractivePictureGrid,
  InteractiveVowelPickOne,
  InteractiveFillInBlank,
} from "./InteractivePageExercises";
import { WorkbookLetterTrace } from "./WorkbookLetterTrace";
import { getLetterTemplate } from "./letter-stroke-templates";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import {
  DibujaFromRegion,
  LassoPictureGrid,
  LassoSyllableMatch,
  LassoVowelLineMatch,
  LassoVowelMatchAll,
  PaintFromRegion,
  resolveFaithfulHost,
} from "@/cartilla/interactions/faithfulAdapters";

/**
 * Per-lesson garden background overrides. The CSS default is gretel-authentic.jpg
 * (set on .faithful-page--garden in faithful-page.css). Add an entry here when
 * a dedicated lesson background arrives from the image-gen pipeline — just the
 * URL path, no `url()` wrapper needed. Hot-swappable without any other change.
 *
 * LESSON NUMBERS confirmed from src/lib/lesson-catalog.ts CATALOG:
 *   2 = Vocal A, 3 = Vocal E, 4 = Vocal I, 5 = Vocal O, 6 = Vocal U
 *
 * Lessons 1 and 7-24 (Lección 1 intro + all 18 consonants) use
 * `leccion-N.jpg` — the same real base.jpg garden painting used for the
 * vowel lessons, with a subtle color wash matching that lesson's own accent
 * color from consonants.json (same derive-from-real-art technique, not new
 * art). Generated once directly; no image-gen dependency.
 */
const LESSON_GARDEN_BG: Record<number, string> = {
  1: "/art/hd/garden/leccion-1.jpg",
  2: "/art/hd/garden/vocal-a.jpg",
  3: "/art/hd/garden/vocal-e.jpg",
  4: "/art/hd/garden/vocal-i.jpg",
  5: "/art/hd/garden/vocal-o.jpg",
  6: "/art/hd/garden/vocal-u.jpg",
  7: "/art/hd/garden/leccion-7.jpg",
  8: "/art/hd/garden/leccion-8.jpg",
  9: "/art/hd/garden/leccion-9.jpg",
  10: "/art/hd/garden/leccion-10.jpg",
  11: "/art/hd/garden/leccion-11.jpg",
  12: "/art/hd/garden/leccion-12.jpg",
  13: "/art/hd/garden/leccion-13.jpg",
  14: "/art/hd/garden/leccion-14.jpg",
  15: "/art/hd/garden/leccion-15.jpg",
  16: "/art/hd/garden/leccion-16.jpg",
  17: "/art/hd/garden/leccion-17.jpg",
  18: "/art/hd/garden/leccion-18.jpg",
  19: "/art/hd/garden/leccion-19.jpg",
  20: "/art/hd/garden/leccion-20.jpg",
  21: "/art/hd/garden/leccion-21.jpg",
  22: "/art/hd/garden/leccion-22.jpg",
  23: "/art/hd/garden/leccion-23.jpg",
  24: "/art/hd/garden/leccion-24.jpg",
};

/**
 * Renders a workbook page from its faithful, verified region layout
 * (src/data/page-layouts.json) — real text in the book's font + real COLOR
 * illustrations cropped from the original artwork. This is the single renderer
 * shared by the student CRM view, the student workbook, and the teacher
 * flipbook, so all three match exactly and in the same order.
 *
 * If a page has no verified layout yet, it renders `fallback` (the surface's
 * existing content) so nothing regresses — never invented content.
 */
interface FaithfulPageRendererProps {
  pageNumber: number;
  lessonNumber?: number;
  /** Override layout (used by the preview route); defaults to the canonical file. */
  regions?: PageRegion[];
  /** Shown when this page has no verified faithful layout yet. */
  fallback?: ReactNode;
  /**
   * Renders picture-grid/vowel-pick-one/vowel-match-all/vowel-line-match as
   * real tap-and-grade exercises instead of static pictures. Student
   * workbook only — teacher's flipbook/paginas views stay read-only
   * previews and must never pass this.
   */
  interactive?: boolean;
}

function IllustrationSlot({ region }: { region: PageRegion }) {
  const caption = region.caption ?? region.illustrationWord;
  if (region.illustrationSrc) {
    return (
      <div className="fp-illustration">
        <LivingIllustration src={region.illustrationSrc} alt={caption ?? ""} loading="lazy" />
        {caption ? <span className="fp-illustration__caption">{caption}</span> : null}
      </div>
    );
  }
  // No faithful crop yet — explicit marker, NEVER an invented drawing.
  return (
    <div
      className="fp-art-pending"
      role="img"
      aria-label={caption ? `Ilustración pendiente: ${caption}` : "Ilustración pendiente"}
    >
      {caption ? <span className="fp-art-pending__word">{caption}</span> : null}
      <span>ilustración pendiente</span>
    </div>
  );
}

/** Same ambient float used by the interactive cells (InteractivePageExercises.tsx)
 * and the older games (DragMatchPairs.tsx, leccion.$n.tsx) — duplicated per-file
 * by convention rather than shared, so static/teal-only renderers never pull in
 * interactive-exercises.css (which is scoped "student workbook only"). */
function floatDelay(index: number): string {
  return `${((index * 37) % 47) / 10}s`;
}

function PictureGrid({ region }: { region: PageRegion }) {
  const cells = region.cells ?? [];
  const columns = region.columns ?? 4;
  return (
    <div
      className="fp-picture-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className="fp-picture-grid__cell"
          style={{ ["--float-delay" as string]: floatDelay(i) }}
        >
          {cell.illustrationSrc ? (
            <LivingIllustration
              src={cell.illustrationSrc}
              alt={cell.caption ?? ""}
              loading="lazy"
            />
          ) : (
            <div
              className="fp-art-pending"
              role="img"
              aria-label={
                cell.caption ? `Ilustración pendiente: ${cell.caption}` : "Ilustración pendiente"
              }
            >
              {cell.caption ? <span className="fp-art-pending__word">{cell.caption}</span> : null}
              <span>pendiente</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SyllableMatch({ region }: { region: PageRegion }) {
  const rows = region.matchRows ?? [];
  return (
    <div className="fp-syllable-match">
      <span className="fp-syllable-match__syllable">{region.syllable}</span>
      <div className="fp-syllable-match__rows">
        {rows.map((row, i) => (
          <div key={i} className="fp-syllable-match__row">
            {row.map((entry, j) => (
              <span key={j} className="fp-syllable-match__word">
                {entry.word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FillInBlank({ region }: { region: PageRegion }) {
  const items = region.fillItems ?? [];
  return (
    <div className="fp-fill-in-blank">
      {items.map((item, i) => (
        <div key={i} className="fp-fill-in-blank__item">
          <span className="fp-fill-in-blank__wordbox">{item.wordBox}</span>
          <span className="fp-fill-in-blank__blank">{item.blank}</span>
          <span className="fp-fill-in-blank__choices">
            {item.choices.map((c) => c.text).join(" - ")}
          </span>
        </div>
      ))}
    </div>
  );
}

function VowelMatchCell({
  cell,
  isExample,
  index,
}: {
  cell: PageGridCell;
  isExample: boolean;
  index: number;
}) {
  return (
    <div
      className={`fp-vowel-match__cell${isExample ? " fp-vowel-match__cell--example" : ""}`}
      style={{ ["--float-delay" as string]: floatDelay(index) }}
    >
      {cell.illustrationSrc ? (
        <LivingIllustration src={cell.illustrationSrc} alt={cell.caption ?? ""} loading="lazy" />
      ) : (
        <div
          className="fp-art-pending"
          role="img"
          aria-label={
            cell.caption ? `Ilustración pendiente: ${cell.caption}` : "Ilustración pendiente"
          }
        >
          {cell.caption ? <span className="fp-art-pending__word">{cell.caption}</span> : null}
          <span>pendiente</span>
        </div>
      )}
    </div>
  );
}

function VowelLineMatch({ region }: { region: PageRegion }) {
  const cells = region.cells ?? [];
  return (
    <div className="fp-vowel-match">
      {cells.slice(0, 4).map((cell, i) => (
        <VowelMatchCell
          key={i}
          index={i}
          cell={cell}
          isExample={Boolean(region.exampleCaption) && cell.caption === region.exampleCaption}
        />
      ))}
      <div className="fp-vowel-match__letters">{region.letterPair}</div>
      {cells.slice(4, 8).map((cell, i) => (
        <VowelMatchCell
          key={i + 4}
          index={i + 4}
          cell={cell}
          isExample={Boolean(region.exampleCaption) && cell.caption === region.exampleCaption}
        />
      ))}
    </div>
  );
}

function VowelPickOne({ region }: { region: PageRegion }) {
  const rows = region.vowelRows ?? [];
  return (
    <div className="fp-vowel-pick">
      {rows.map((row, i) => (
        <div key={i} className="fp-vowel-pick__row">
          <span className="fp-vowel-pick__letter">{row.letter}</span>
          {row.cells.map((cell, j) => (
            <div
              key={j}
              className="fp-vowel-pick__cell"
              style={{ ["--float-delay" as string]: floatDelay(i * 3 + j) }}
            >
              {cell.illustrationSrc ? (
                <LivingIllustration
                  src={cell.illustrationSrc}
                  alt={cell.caption ?? ""}
                  loading="lazy"
                />
              ) : (
                <div
                  className="fp-art-pending"
                  role="img"
                  aria-label={
                    cell.caption
                      ? `Ilustración pendiente: ${cell.caption}`
                      : "Ilustración pendiente"
                  }
                >
                  {cell.caption ? (
                    <span className="fp-art-pending__word">{cell.caption}</span>
                  ) : null}
                  <span>pendiente</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function VowelMatchAll({ region }: { region: PageRegion }) {
  const pairs = region.vowelPairs ?? [];
  return (
    <div className="fp-vowel-match-all">
      {pairs.map((pair, i) => (
        <div key={i} className="fp-vowel-match-all__row">
          <span className="fp-vowel-match-all__letter">{pair.letter}</span>
          <div
            className="fp-vowel-match-all__cell"
            style={{ ["--float-delay" as string]: floatDelay(i) }}
          >
            {pair.illustrationSrc ? (
              <img src={pair.illustrationSrc} alt={pair.caption ?? ""} loading="lazy" />
            ) : (
              <div
                className="fp-art-pending"
                role="img"
                aria-label={
                  pair.caption ? `Ilustración pendiente: ${pair.caption}` : "Ilustración pendiente"
                }
              >
                {pair.caption ? <span className="fp-art-pending__word">{pair.caption}</span> : null}
                <span>pendiente</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RegionView({
  region,
  interactive,
  accent,
  lessonId,
  lessonNumber,
  resolvedModelText,
  precedingInstruction,
  siblingCells,
}: {
  region: PageRegion;
  interactive?: boolean;
  accent?: string;
  lessonId?: string;
  lessonNumber?: number;
  /** writing-line only: region.modelText, or inherited from the preceding
   * writing-line sibling when this region is the blank "trace it again" line. */
  resolvedModelText?: string;
  /** Most recent instruction text on this page (for verb-honest mechanic routing). */
  precedingInstruction?: string;
  /** Picture-grid cells from the same page (for Dibuja pick-mode options). */
  siblingCells?: PageGridCell[];
}) {
  // Host chosen once so Colorea never silently becomes tap-select, and
  // Encierra / Une always stay on LassoConnect when interactive.
  const host = interactive
    ? resolveFaithfulHost(region.regionType, precedingInstruction)
    : "static";

  switch (region.regionType) {
    case "illustration-slot":
      if (host === "paint") {
        return (
          <PaintFromRegion
            region={region}
            lessonId={lessonId}
            illustrationSrc={region.illustrationSrc}
            illustrationAlt={region.caption ?? region.illustrationWord}
            instruction={precedingInstruction}
          />
        );
      }
      return <IllustrationSlot region={region} />;
    case "paint-box":
      // Always PaintCanvas when interactive — never tap fallback
      return interactive ? (
        <PaintFromRegion
          region={region}
          lessonId={lessonId}
          illustrationSrc={region.illustrationSrc}
          illustrationAlt={region.caption ?? region.text}
          instruction={precedingInstruction ?? region.text}
        />
      ) : (
        <div className="fp-draw-box" aria-label={region.text ?? "Colorea"}>
          {region.illustrationSrc ? (
            <img src={region.illustrationSrc} alt={region.caption ?? ""} loading="lazy" />
          ) : null}
          {region.text ? <span className="fp-draw-box__hint">{region.text}</span> : null}
        </div>
      );
    case "picture-grid":
      if (host === "lasso-mark") {
        return (
          <LassoPictureGrid
            region={region}
            lessonId={lessonId}
            instruction={precedingInstruction}
          />
        );
      }
      if (host === "paint") {
        // Colorea on a grid: paint the first colorable illustration cell as stage
        const cell = (region.cells ?? []).find((c) => c.illustrationSrc) ?? region.cells?.[0];
        return (
          <PaintFromRegion
            region={region}
            lessonId={lessonId}
            illustrationSrc={cell?.illustrationSrc}
            illustrationAlt={cell?.caption}
            instruction={precedingInstruction}
          />
        );
      }
      return interactive ? (
        <InteractivePictureGrid
          region={region}
          accent={accent ?? "hsl(230 75% 58%)"}
          lessonId={lessonId}
        />
      ) : (
        <PictureGrid region={region} />
      );
    case "vowel-line-match":
      return interactive ? (
        <LassoVowelLineMatch
          region={region}
          lessonId={lessonId}
          instruction={precedingInstruction}
        />
      ) : (
        <VowelLineMatch region={region} />
      );
    case "vowel-pick-one":
      return interactive ? (
        <InteractiveVowelPickOne
          region={region}
          accent={accent ?? "hsl(230 75% 58%)"}
          lessonId={lessonId}
        />
      ) : (
        <VowelPickOne region={region} />
      );
    case "vowel-match-all":
      return interactive ? (
        <LassoVowelMatchAll
          region={region}
          lessonId={lessonId}
          instruction={precedingInstruction}
        />
      ) : (
        <VowelMatchAll region={region} />
      );
    case "syllable-match":
      return interactive ? (
        <LassoSyllableMatch
          region={region}
          lessonId={lessonId}
          instruction={precedingInstruction}
        />
      ) : (
        <SyllableMatch region={region} />
      );
    case "fill-in-blank":
      return interactive ? (
        <InteractiveFillInBlank
          region={region}
          accent={accent ?? "hsl(230 75% 58%)"}
          lessonId={lessonId}
        />
      ) : (
        <FillInBlank region={region} />
      );
    case "instruction":
      return (
        <p className="fp-region--instruction">
          {region.label ? <span className="fp-label">{region.label} </span> : null}
          {region.text}
        </p>
      );
    case "writing-line": {
      // Student workbook (interactive) + a faithful stroke template for this
      // model letter → real tracing exercise. The "trace it again" blank
      // line (no modelText of its own) inherits its letter from the
      // preceding writing-line sibling via resolvedModelText, so both
      // repetitions are traceable, not just the first.
      const traceLetter = resolvedModelText ?? region.modelText;
      const hasTemplate = !!traceLetter && getLetterTemplate(traceLetter) !== null;
      if (interactive && !hasTemplate) {
        // No real template for this letter (e.g. Ñ, rr, most lowercase) —
        // hide the tracing step entirely rather than show a fake/blank
        // stand-in. Teacher preview (non-interactive) keeps the static line
        // below, since that's a faithful page preview, not a student
        // tracing exercise.
        return null;
      }
      if (interactive && hasTemplate) {
        return (
          <div className="fp-writing-line fp-writing-line--trace">
            <WorkbookLetterTrace
              modelText={traceLetter as string}
              accent={accent}
              lessonId={lessonId}
            />
          </div>
        );
      }
      return (
        <div className="fp-writing-line">
          {region.modelText ? (
            <span className="fp-writing-line__model">{region.modelText}</span>
          ) : null}
          <span className="fp-writing-line__rule" aria-hidden="true" />
        </div>
      );
    }
    case "draw-box":
      return interactive ? (
        <DibujaFromRegion
          region={region}
          lessonId={lessonId}
          lessonNumber={lessonNumber}
          siblingCells={siblingCells}
        />
      ) : (
        <div className="fp-draw-box" aria-label={region.text ?? "Espacio para dibujar"}>
          {region.text ? <span className="fp-draw-box__hint">{region.text}</span> : null}
        </div>
      );
    case "reading-sentences":
      return (
        <div className="fp-region--reading-sentences">
          {(region.sentences ?? []).map((sentence, i) => (
            <p key={i}>{sentence}</p>
          ))}
        </div>
      );
    default:
      return <p className={`fp-region--${region.regionType}`}>{region.text}</p>;
  }
}

export function FaithfulPageRenderer({
  pageNumber,
  lessonNumber,
  regions,
  fallback,
  interactive,
}: FaithfulPageRendererProps) {
  const layout = regions ?? getPageLayout(pageNumber);

  if (!layout) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <PageFrame
        pageNumber={pageNumber}
        lessonNumber={lessonNumber}
        className="faithful-page--pending"
      >
        <p>Página en preparación</p>
      </PageFrame>
    );
  }

  const ordered = [...layout].sort((a, b) => a.order - b.order);
  const accent = lessonNumber ? CATALOG.find((e) => e.n === lessonNumber)?.color : undefined;
  const lessonId = lessonNumber ? String(lessonNumber) : undefined;
  const gardenBg = lessonNumber ? LESSON_GARDEN_BG[lessonNumber] : undefined;

  // Every letter's writing-line pair is [model line with modelText, blank
  // "trace it again" line with no modelText] — the blank one inherits the
  // model letter from its immediately preceding writing-line sibling so both
  // repetitions are traceable, not just the first.
  let lastWritingLineModelText: string | undefined;
  let lastInstructionText: string | undefined;

  // If every writing-line on this page hides (no real template), the
  // "Traza con tu mejor letra." instruction that precedes them would be
  // left dangling with nothing to write on — hide it too in that case.
  const pageHasTraceableWritingLine = ordered.some(
    (r) => r.regionType === "writing-line" && getLetterTemplate(r.modelText) !== null,
  );

  // Sibling picture-grid cells on this page — used by DibujaHost pick mode
  // so options stay lesson-faithful (never random clipart).
  const siblingCells: PageGridCell[] = ordered.flatMap((r) =>
    r.regionType === "picture-grid" ? (r.cells ?? []) : [],
  );

  return (
    <PageFrame
      pageNumber={pageNumber}
      lessonNumber={lessonNumber}
      garden={interactive}
      gardenBg={gardenBg}
    >
      {ordered.map((region) => {
        if (
          interactive &&
          !pageHasTraceableWritingLine &&
          region.regionType === "instruction" &&
          region.text === "Traza con tu mejor letra."
        ) {
          return null;
        }
        if (region.regionType === "instruction" && region.text) {
          lastInstructionText = region.text;
        }
        let resolvedModelText: string | undefined;
        if (region.regionType === "writing-line") {
          resolvedModelText = region.modelText || lastWritingLineModelText;
          lastWritingLineModelText = region.modelText || lastWritingLineModelText;
        }
        return (
          <RegionView
            key={region.id}
            region={region}
            interactive={interactive}
            accent={accent}
            lessonId={lessonId}
            lessonNumber={lessonNumber}
            resolvedModelText={resolvedModelText}
            precedingInstruction={lastInstructionText}
            siblingCells={siblingCells}
          />
        );
      })}
    </PageFrame>
  );
}
