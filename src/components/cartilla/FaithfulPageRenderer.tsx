import "@/styles/native-lesson.css";
import type { ReactNode } from "react";
import { GretelActivity } from "@/components/gretel/GretelActivity";
import { SOURCE_BLOCKED_WORKBOOK_PAGES } from "@/lib/workbook-pages";
import { getPageLayout, type PageGridCell, type PageRegion } from "@/lib/book-faithful";
import { archetypeMappingForPage } from "@/data/workbook-archetypes";
// PageGridCell used by RegionView siblingCells for Dibuja pick options
import { PageFrame } from "./PageFrame";
import { CATALOG } from "@/lib/lesson-catalog";
import {
  InteractivePictureGrid,
  InteractiveVowelPickOne,
  InteractiveFillInBlank,
  pictureMarkFor,
} from "./InteractivePageExercises";
import { WorkbookLetterTrace } from "./WorkbookLetterTrace";
import { WorkbookWritingResponse } from "./WorkbookWritingResponse";
import { DibujaHost } from "@/cartilla/interactions/DibujaHost";
import { SyllableWordCircle } from "@/cartilla/interactions/SyllableWordCircle";
import { getLetterTemplate } from "./letter-stroke-templates";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { EscucharInstruccionButton } from "./EscucharInstruccionButton";
import { FixedLayoutPage } from "./FixedLayoutPage";
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
 * Renders a workbook page from its faithful, verified region layout
 * (src/data/page-layouts.json) â€” real text in the book's font + real COLOR
 * illustrations cropped from the original artwork. This is the single renderer
 * shared by the student CRM view, the student workbook, and the teacher
 * flipbook, so all three match exactly and in the same order.
 *
 * If a page has no verified layout yet, it renders `fallback` (the surface's
 * existing content) so nothing regresses â€” never invented content.
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
   * workbook only â€” teacher's flipbook/paginas views stay read-only
   * previews and must never pass this.
   */
  interactive?: boolean;
  /** Use measured 612 x 792 positions when a page has verified geometry. */
  fixedLayout?: boolean;
  native?: boolean;
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
  // No faithful crop yet â€” explicit marker, NEVER an invented drawing.
  return (
    <div
      className="fp-art-pending"
      role="img"
      aria-label={caption ? `IlustraciÃ³n pendiente: ${caption}` : "IlustraciÃ³n pendiente"}
    >
      {caption ? <span className="fp-art-pending__word">{caption}</span> : null}
      <span>ilustraciÃ³n pendiente</span>
    </div>
  );
}

/** Same ambient float used by the interactive cells (InteractivePageExercises.tsx)
 * and the older games (DragMatchPairs.tsx, leccion.$n.tsx) â€” duplicated per-file
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
                cell.caption ? `IlustraciÃ³n pendiente: ${cell.caption}` : "IlustraciÃ³n pendiente"
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
            cell.caption ? `IlustraciÃ³n pendiente: ${cell.caption}` : "IlustraciÃ³n pendiente"
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
                      ? `IlustraciÃ³n pendiente: ${cell.caption}`
                      : "IlustraciÃ³n pendiente"
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
              <LivingIllustration src={pair.illustrationSrc} alt={pair.caption ?? ""} loading="lazy" />
            ) : (
              <div
                className="fp-art-pending"
                role="img"
                aria-label={
                  pair.caption ? `IlustraciÃ³n pendiente: ${pair.caption}` : "IlustraciÃ³n pendiente"
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
  native,
  pageNumber,
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
  native?: boolean;
  pageNumber?: number;
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
      // Always PaintCanvas when interactive â€” never tap fallback
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
            <LivingIllustration src={region.illustrationSrc} alt={region.caption ?? ""} loading="lazy" />
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
          mark={pictureMarkFor(precedingInstruction)}
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
          directPencil={pageNumber === 17}
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
      if (interactive && native) return <SyllableWordCircle region={region} lessonId={lessonId} />;
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
    case "instruction": {
      const instructionText =
        pageNumber === 17 && region.text
          ? region.text.split(/(Uu)/g).map((part, index) =>
              part === "Uu" ? (
                <span key={part + "-" + index} className="fp-target-emphasis">
                  {part}
                </span>
              ) : (
                part
              ),
            )
          : region.text;
      return (
        <p className="fp-region--instruction">
          {region.label ? <span className="fp-label">{region.label} </span> : null}
          {instructionText}
          {interactive && region.text ? (
            <EscucharInstruccionButton text={region.text} className="fp-instruction__escuchar" />
          ) : null}
        </p>
      );
    }
    case "writing-line": {
      // Student workbook (interactive) + a faithful stroke template for this
      // model letter â†’ real tracing exercise. The "trace it again" blank
      // line (no modelText of its own) inherits its letter from the
      // preceding writing-line sibling via resolvedModelText, so both
      // repetitions are traceable, not just the first.
      const traceLetter = resolvedModelText ?? region.modelText;
      const hasTemplate = !!traceLetter && getLetterTemplate(traceLetter) !== null;
      // If no verified stroke template exists, preserve the real writing
      // line and printed model. The learner can still use the workbook page.
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
      if (interactive && native) return (
        <div className="fp-writing-line fp-writing-line--freehand">
          {traceLetter && <span className="fp-writing-line__model">{traceLetter}</span>}
          <DibujaHost pageKey={region.id} hint={traceLetter} lessonId={lessonId} initialMode="draw" verb="Escribe" />
        </div>
      );
      return (
        <div className="fp-writing-line">
          {region.modelText ? (
            <span className="fp-writing-line__model">{region.modelText}</span>
          ) : null}
          <span className="fp-writing-line__rule" aria-hidden="true" />
        </div>
      );
    }
    case "writing-response":
      return <WorkbookWritingResponse pageNumber={Number(region.id.match(/^p(\d+)/)?.[1] ?? 0)} interactive={Boolean(interactive)} />;
    case "draw-box":
      return interactive ? (
        <DibujaFromRegion
          region={region}
          lessonId={lessonId}
          lessonNumber={lessonNumber}
          siblingCells={siblingCells}
          drawOnly={native}
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
    case "title":
      return native ? (
        <h2 className="fp-native-title">{region.text}</h2>
      ) : (
        <p className="fp-region--title">{region.text}</p>
      );
    case "syllable-bubble":
      return native ? (
        <div className="fp-native-syllables" aria-label={region.text ?? undefined}>
          {(region.text ?? "").split(/\s+/).filter(Boolean).map((syllable) => (
            <span key={syllable}>{syllable}</span>
          ))}
        </div>
      ) : (
        <p className="fp-region--syllable-bubble">{region.text}</p>
      );
    case "vocab-grid":
      return native ? (
        <div className="fp-native-vocab" style={{ gridTemplateColumns: `repeat(${region.columns ?? 3}, minmax(0, 1fr))` }}>
          {(region.text ?? "").split("Â·").map((word) => word.trim()).filter(Boolean).map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      ) : (
        <p className="fp-region--vocab-grid">{region.text}</p>
      );
    case "sentence-line":
      return native ? (
        <div className="fp-native-sight-word" aria-label="Palabra de enlace">{region.text}</div>
      ) : (
        <p className="fp-region--sentence-line">{region.text}</p>
      );
    case "footer":
    case "page-number":
      return native ? null : <p className={`fp-region--${region.regionType}`}>{region.text}</p>;
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
  fixedLayout = false,
  native = false,
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
        <p>PÃ¡gina en preparaciÃ³n</p>
      </PageFrame>
    );
  }

  if (fixedLayout) {
    if (layout.length > 0 && layout.every((region) => {
      const { x, y, width, height } = region;
      return [x, y, width, height].every((value) =>
        typeof value === "number" && Number.isFinite(value))
        && x! >= 0 && y! >= 0 && width! > 0 && height! > 0
        && x! + width! <= 1.000001 && y! + height! <= 1.000001;
    })) {
      return <FixedLayoutPage pageNumber={pageNumber} regions={layout} interactive={interactive} />;
    }
    if (fallback !== undefined) return <>{fallback}</>;
  }

  const ordered = [...layout].sort((a, b) => a.order - b.order);
  const letterReadingPage = native && ordered.some((region) => region.regionType === "vocab-grid")
    && ordered.filter((region) => region.regionType === "syllable-bubble").length === 2;
  const accent = lessonNumber ? CATALOG.find((e) => e.n === lessonNumber)?.color : undefined;
  const lessonId = lessonNumber ? String(lessonNumber) : undefined;

  let archetypeClasses: string[] = [];
  if (typeof pageNumber === "number" && pageNumber >= 1 && pageNumber <= 90) {
    try {
      const mapping = archetypeMappingForPage(pageNumber);
      archetypeClasses = mapping.archetypes.map((a) => `faithful-page--archetype-${a}`);
    } catch {
      // Unmapped or mock test page numbers
    }
  }

  // Every letter's writing-line pair is [model line with modelText, blank
  // "trace it again" line with no modelText] â€” the blank one inherits the
  // model letter from its immediately preceding writing-line sibling so both
  // repetitions are traceable, not just the first.
  let lastWritingLineModelText: string | undefined;
  let lastInstructionText: string | undefined;

  // Sibling picture-grid cells on this page â€” used by DibujaHost pick mode
  // so options stay lesson-faithful (never random clipart).
  const siblingCells: PageGridCell[] = ordered.flatMap((r) =>
    r.regionType === "picture-grid" ? (r.cells ?? []) : [],
  );

  return (
    <PageFrame
      pageNumber={pageNumber}
      lessonNumber={lessonNumber}

      className={[
        letterReadingPage ? "fp-native-letter-page" : "",
        pageNumber === 17 ? "faithful-page--archetype4-p17" : "",
        ...archetypeClasses,
      ].filter(Boolean).join(" ") || undefined}
    >
      {ordered.map((region) => {
        if (region.regionType === "instruction" && region.text) {
          lastInstructionText = region.text;
        }
        let resolvedModelText: string | undefined;
        if (region.regionType === "writing-line") {
          resolvedModelText = region.modelText || lastWritingLineModelText;
          lastWritingLineModelText = region.modelText || lastWritingLineModelText;
        }
        return (
          <GretelActivity key={region.id} id={`page-${pageNumber}-${region.id}`} pageNumber={pageNumber} kind={region.regionType}>
          <RegionView
            region={region}
            interactive={interactive}
            accent={accent}
            lessonId={lessonId}
            lessonNumber={lessonNumber}
            resolvedModelText={resolvedModelText}
            precedingInstruction={lastInstructionText}
            siblingCells={siblingCells}
            native={native}
            pageNumber={pageNumber}
          />
          </GretelActivity>
        );
      })}
      {SOURCE_BLOCKED_WORKBOOK_PAGES.includes(pageNumber) ? (
        <p className="fp-source-blocked" data-source-blocked="true" role="note">
          Esta pÃ¡gina falta en el escaneo del libro. Su contenido estÃ¡ pendiente de verificaciÃ³n con el libro impreso.
        </p>
      ) : null}
    </PageFrame>
  );
}
