import type { ReactNode } from "react";
import { getPageLayout, type PageGridCell, type PageRegion } from "@/lib/book-faithful";
import { PageFrame } from "./PageFrame";
import { CATALOG } from "@/lib/lesson-catalog";
import {
  InteractivePictureGrid,
  InteractiveVowelPickOne,
  InteractiveVowelMatchAll,
  InteractiveVowelLineMatch,
  InteractiveSyllableMatch,
  InteractiveFillInBlank,
} from "./InteractivePageExercises";

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
        <img src={region.illustrationSrc} alt={caption ?? ""} loading="lazy" />
        {caption ? <span className="fp-illustration__caption">{caption}</span> : null}
      </div>
    );
  }
  // No faithful crop yet — explicit marker, NEVER an invented drawing.
  return (
    <div className="fp-art-pending" role="img" aria-label={caption ? `Ilustración pendiente: ${caption}` : "Ilustración pendiente"}>
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
        <div key={i} className="fp-picture-grid__cell" style={{ ["--float-delay" as string]: floatDelay(i) }}>
          {cell.illustrationSrc ? (
            <img src={cell.illustrationSrc} alt={cell.caption ?? ""} loading="lazy" />
          ) : (
            <div className="fp-art-pending" role="img" aria-label={cell.caption ? `Ilustración pendiente: ${cell.caption}` : "Ilustración pendiente"}>
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
          <span className="fp-fill-in-blank__choices">{item.choices.map((c) => c.text).join(" - ")}</span>
        </div>
      ))}
    </div>
  );
}

function VowelMatchCell({ cell, isExample, index }: { cell: PageGridCell; isExample: boolean; index: number }) {
  return (
    <div
      className={`fp-vowel-match__cell${isExample ? " fp-vowel-match__cell--example" : ""}`}
      style={{ ["--float-delay" as string]: floatDelay(index) }}
    >
      {cell.illustrationSrc ? (
        <img src={cell.illustrationSrc} alt={cell.caption ?? ""} loading="lazy" />
      ) : (
        <div className="fp-art-pending" role="img" aria-label={cell.caption ? `Ilustración pendiente: ${cell.caption}` : "Ilustración pendiente"}>
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
        <VowelMatchCell key={i} index={i} cell={cell} isExample={Boolean(region.exampleCaption) && cell.caption === region.exampleCaption} />
      ))}
      <div className="fp-vowel-match__letters">{region.letterPair}</div>
      {cells.slice(4, 8).map((cell, i) => (
        <VowelMatchCell key={i + 4} index={i + 4} cell={cell} isExample={Boolean(region.exampleCaption) && cell.caption === region.exampleCaption} />
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
            <div key={j} className="fp-vowel-pick__cell" style={{ ["--float-delay" as string]: floatDelay(i * 3 + j) }}>
              {cell.illustrationSrc ? (
                <img src={cell.illustrationSrc} alt={cell.caption ?? ""} loading="lazy" />
              ) : (
                <div className="fp-art-pending" role="img" aria-label={cell.caption ? `Ilustración pendiente: ${cell.caption}` : "Ilustración pendiente"}>
                  {cell.caption ? <span className="fp-art-pending__word">{cell.caption}</span> : null}
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
          <div className="fp-vowel-match-all__cell" style={{ ["--float-delay" as string]: floatDelay(i) }}>
            {pair.illustrationSrc ? (
              <img src={pair.illustrationSrc} alt={pair.caption ?? ""} loading="lazy" />
            ) : (
              <div className="fp-art-pending" role="img" aria-label={pair.caption ? `Ilustración pendiente: ${pair.caption}` : "Ilustración pendiente"}>
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
}: {
  region: PageRegion;
  interactive?: boolean;
  accent?: string;
  lessonId?: string;
}) {
  switch (region.regionType) {
    case "illustration-slot":
      return <IllustrationSlot region={region} />;
    case "picture-grid":
      return interactive ? (
        <InteractivePictureGrid region={region} accent={accent ?? "hsl(230 75% 58%)"} lessonId={lessonId} />
      ) : (
        <PictureGrid region={region} />
      );
    case "vowel-line-match":
      return interactive ? (
        <InteractiveVowelLineMatch region={region} accent={accent ?? "hsl(230 75% 58%)"} lessonId={lessonId} />
      ) : (
        <VowelLineMatch region={region} />
      );
    case "vowel-pick-one":
      return interactive ? (
        <InteractiveVowelPickOne region={region} accent={accent ?? "hsl(230 75% 58%)"} lessonId={lessonId} />
      ) : (
        <VowelPickOne region={region} />
      );
    case "vowel-match-all":
      return interactive ? (
        <InteractiveVowelMatchAll region={region} accent={accent ?? "hsl(230 75% 58%)"} lessonId={lessonId} />
      ) : (
        <VowelMatchAll region={region} />
      );
    case "syllable-match":
      return interactive ? (
        <InteractiveSyllableMatch region={region} accent={accent ?? "hsl(230 75% 58%)"} lessonId={lessonId} />
      ) : (
        <SyllableMatch region={region} />
      );
    case "fill-in-blank":
      return interactive ? (
        <InteractiveFillInBlank region={region} accent={accent ?? "hsl(230 75% 58%)"} lessonId={lessonId} />
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
    case "writing-line":
      return (
        <div className="fp-writing-line">
          {region.modelText ? <span className="fp-writing-line__model">{region.modelText}</span> : null}
          <span className="fp-writing-line__rule" aria-hidden="true" />
        </div>
      );
    case "draw-box":
      return (
        <div className="fp-draw-box" aria-label={region.text ?? "Espacio para dibujar"}>
          {region.text ? <span className="fp-draw-box__hint">{region.text}</span> : null}
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
      <PageFrame pageNumber={pageNumber} lessonNumber={lessonNumber} className="faithful-page--pending">
        <p>Página en preparación</p>
      </PageFrame>
    );
  }

  const ordered = [...layout].sort((a, b) => a.order - b.order);
  const accent = lessonNumber ? CATALOG.find((e) => e.n === lessonNumber)?.color : undefined;
  const lessonId = lessonNumber ? String(lessonNumber) : undefined;

  return (
    <PageFrame pageNumber={pageNumber} lessonNumber={lessonNumber}>
      {ordered.map((region) => (
        <RegionView key={region.id} region={region} interactive={interactive} accent={accent} lessonId={lessonId} />
      ))}
    </PageFrame>
  );
}
