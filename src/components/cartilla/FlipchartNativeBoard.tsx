import { useEffect, type CSSProperties } from "react";
import { FlipchartFrontmatter } from "@/components/cartilla/FlipchartFrontmatter";
import { getNativeFlipchartPage, type FlipchartLayoutType, type NativeFlipchartPage, type FlipchartTextItem } from "@/lib/flipchart-native";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import type { FlipchartPage } from "@/lib/flipchart-hd";

function BookLine({ line }: { line: FlipchartTextItem }) {
  return line.segments ? <>{line.segments.map((part, index) => <span key={index} style={{ color: part.color }}>{index > 0 ? " " : ""}{part.text}</span>)}</> : <>{line.text}</>;
}

import sourceColors from "@/data/flipchart-source-colors.json";

/** The Flip Chart prints the taught letter in this red on every page. */
const BOOK_RED = "#bb0733";

type SourcePageColors = {
  panel?: string;
  crescentLight?: string;
  crescentEdge?: string;
  vowelCircles?: { vowel: string; color: string }[];
};

/** Colors taken from the Flip Chart source itself (PDF text layer + HD page
 * samples, see scripts/extract-flipchart-colors.py) — never a page-number cycle. */
const SOURCE_COLORS = (sourceColors as { pages: Record<string, SourcePageColors> }).pages;
const NEUTRAL_PANEL = "#f5f1ea";

export function panelColorFor(pageNumber: number): string {
  return SOURCE_COLORS[String(pageNumber)]?.panel ?? NEUTRAL_PANEL;
}

export function crescentColorsFor(pageNumber: number): { light: string; edge: string } {
  const colors = SOURCE_COLORS[String(pageNumber)];
  const panel = panelColorFor(pageNumber);
  return { light: colors?.crescentLight ?? panel, edge: colors?.crescentEdge ?? colors?.crescentLight ?? panel };
}

function vowelCircleColorFor(pageNumber: number, vowel: string): string {
  const match = SOURCE_COLORS[String(pageNumber)]?.vowelCircles?.find((c) => c.vowel === vowel.trim().toLowerCase());
  return match?.color ?? panelColorFor(pageNumber);
}

/** The book's syllable crescent: a true lune (outer arc minus an inner arc),
 * shaded from a light inner edge to the saturated outer rim like the print. */
function SyllableCrescent({ pageNumber, syllables }: { pageNumber: number; syllables: string[] }) {
  const { light, edge } = crescentColorsFor(pageNumber);
  const gradientId = `fc-crescent-gradient-${pageNumber}`;
  return (
    <div className="fc-crescent" aria-label="Sílabas" data-crescent-light={light} data-crescent-edge={edge}>
      <svg className="fc-crescent__shape" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.25" stopColor={light} />
            <stop offset="1" stopColor={edge} />
          </linearGradient>
        </defs>
        <path d="M 4 2 A 96 98 0 0 1 4 198 A 40 98 0 0 0 4 2 Z" fill={`url(#${gradientId})`} />
      </svg>
      <div className="fc-crescent__stack">
        {syllables.map((syllable, index) => (
          <span key={`${syllable}-${index}`} className="fc-crescent__syllable">
            <span className="fc-crescent__consonant">{syllable.toLowerCase().startsWith("rr") ? syllable.slice(0, 2) : syllable[0]}</span>
            <span className="fc-crescent__vowel">{syllable.toLowerCase().startsWith("rr") ? syllable.slice(2) : syllable.slice(1)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

type BoardProps = {
  native: NativeFlipchartPage;
  pageNumber: number;
  decorative: boolean;
  accentColor: string;
  isVowelPage: boolean;
};

/** Shared: vocabulary grid with red-letter rule */
function VocabGrid({ native, isVowelPage, decorative }: Pick<BoardProps, "native" | "isVowelPage" | "decorative">) {
  if (native.words.length === 0) return null;
  return (
    <ul className="fc-native-board__words" data-testid="flipchart-words">
      {native.words.map((word, index) => {
        const wordText = word.rest || word.parts.join("");
        const fullWord = word.lead ? word.lead + wordText : wordText;
        const useRedLead = isVowelPage && word.lead && /^[aeiouáéíóú]/i.test(fullWord);
        const leadColor = useRedLead ? "#bb0733" : BOOK_RED;
        return (
          <li
            key={`${word.x}-${word.y}-${index}`}
            className="fc-native-board__word"
            style={{ borderColor: BOOK_RED }}
          >
            {word.lead ? (
              <span className="fc-native-board__word-lead" style={{ color: leadColor }}>
                {word.lead}
              </span>
            ) : null}
            <span className="fc-native-board__word-rest">{wordText}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Shared: art grid (images float on white, labels below) */
function ArtGrid({ native, isVowelPage, decorative }: Pick<BoardProps, "native" | "isVowelPage" | "decorative">) {
  if (native.art.length === 0) return null;
  // Baked-label guard: these image files have the word printed inside the image itself.
  // Never render a figcaption for them (would duplicate the baked text as ghost).

  return (
    <div className="fc-native-board__art-grid" data-testid="flipchart-art-grid" data-art-count={native.art.length}>
      {native.art.map((asset, index) => {
        const hasBakedLabel = asset.labelInImage;
        return (
        <figure key={asset.src} className="fc-native-board__art-card" data-art-index={index}>
          {native.flipchartPage === 3 && <span className="fc-vocab-vowel" style={{ backgroundColor: vowelCircleColorFor(3, asset.word[0]!) }}>{asset.word[0]}</span>}
          <LivingIllustration
            src={asset.src}
            alt={decorative ? "" : asset.word}
            static={decorative}
            loading={decorative ? "lazy" : "eager"}
            className="fc-native-board__living-art"
          />
          {!decorative && !hasBakedLabel && (
            <figcaption className="fc-native-board__art-label">
              {isVowelPage && /^[aeiouáéíóú]/i.test(asset.word) ? (
                <>
                  <span className="fc-native-board__art-label-red">{asset.word[0]}</span>
                  {asset.word.slice(1)}
                </>
              ) : (
                asset.word
              )}
            </figcaption>
          )}
        </figure>
        );
      })}
    </div>
  );
}

/**
 * Type A (vowel-header): pastel title/verse panel top-right, scene left,
 * vowel circles (page 3), vocab grid below.
 */
function VowelHeaderLayout(props: BoardProps) {
  const { native, pageNumber, decorative, isVowelPage } = props;
  // Verse lines are body items in the top zone (y < 500)
  const verseLines = native.body.filter((item) => item.y < 500 && item.text.trim().length > 0);
  // Vowel circles: large single vowels (page 3 variant)
  const vowelCircles = native.body.filter(
    (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
  );
  const remainingBody = native.body.filter((item) => !verseLines.includes(item) && !vowelCircles.includes(item));

  return (
    <>
      <div className="fc-native-board__header-zone fc-layout-vowel-header">
        {/* Scene illustration (left) */}
        {native.scene && (
          <div className="fc-vowel-header__scene">
            <LivingIllustration
              src={native.scene!.src}
              alt={decorative ? "" : native.scene!.word}
              static={decorative}
              loading={decorative ? "lazy" : "eager"}
              className="fc-native-board__living-art"
            />
          </div>
        )}
        {/* Pastel title/verse panel (right) */}
        {verseLines.length > 0 && (
          <div
            className="fc-vowel-header__panel"
            style={{ backgroundColor: panelColorFor(pageNumber) }}
          >
            <h3 className="fc-vowel-header__title">{native.title.map((line) => line.text).join(" ")}</h3>
            {verseLines.map((line, index) => (
              <p
                key={`${line.x}-${line.y}-${index}`}
                className="fc-vowel-header__verse"
              >
                <BookLine line={line} />
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="fc-native-board__body-zone">
        {/* Vowel circles (page 3 variant) */}
        {vowelCircles.length > 0 && (
          <div className="fc-vowel-circles" aria-label="Vocales">
            {vowelCircles.map((vowel, index) => (
              <div
                key={`${vowel.x}-${vowel.y}-${index}`}
                className="fc-vowel-circle"
                style={{ backgroundColor: panelColorFor(pageNumber + index) }}
              >
                <span>{vowel.text.trim()}</span>
              </div>
            ))}
          </div>
        )}
        {/* Vocab grid (excluding scene art already shown) */}
        {native.art.length > 0 ? (
          <ArtGrid native={native} isVowelPage={isVowelPage} decorative={decorative} />
        ) : (
          <VocabGrid native={native} isVowelPage={isVowelPage} decorative={decorative} />
        )}
        {remainingBody.length > 0 && (
          <div className="fc-native-board__rhyme">
            {remainingBody.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-native-board__line">
                <BookLine line={line} />
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Type B (consonant-vocab): scene (left) + letter oval (center) +
 * syllable crescent (right), 3-col vocab grid below.
 */
function ConsonantVocabLayout(props: BoardProps) {
  const { native, pageNumber, decorative, isVowelPage } = props;
  const letterText = native.title.map((item) => item.text.trim()).filter(Boolean).join(" ") || "Aa";

  return (
    <>
      <div className="fc-native-board__header-zone fc-layout-consonant-vocab">
        {/* Scene illustration (left) */}
        {native.scene && (
          <div className="fc-consonant-vocab__scene">
            <LivingIllustration
              src={native.scene!.src}
              alt={decorative ? "" : native.scene!.word}
              static={decorative}
              loading={decorative ? "lazy" : "eager"}
              className="fc-native-board__living-art"
            />
          </div>
        )}
        {/* Big red letter in soft oval (center) */}
        <div className="fc-letter-oval" style={{ "--fc-letter-ring": panelColorFor(pageNumber) } as CSSProperties} aria-label={`Letra ${letterText}`}>
          <span>{letterText}</span>
        </div>
        {native.syllables.length > 0 && <SyllableCrescent pageNumber={pageNumber} syllables={native.syllables} />}
      </div>
      <div className="fc-native-board__body-zone">
        {/* Vocab grid (excluding scene art) */}
        {native.art.length > 0 ? (
          <ArtGrid native={native} isVowelPage={isVowelPage} decorative={decorative} />
        ) : (
          <VocabGrid native={native} isVowelPage={isVowelPage} decorative={decorative} />
        )}
      </div>
    </>
  );
}

/**
 * Type C (syllable-drill): big red letter (left) + syllable rows (right),
 * 3-col word lists, pastel key bar, reading paragraph.
 */
function SyllableDrillLayout(props: BoardProps) {
  const { native, pageNumber, decorative } = props;
  const letterText = native.title.map((item) => item.text.trim()).filter(Boolean).join(" ") || "Aa";
  // Split syllables into two rows (first 5 in order, rest scrambled)
  const row1 = native.syllables.slice(0, 5);
  const row2 = native.syllables.slice(5, 10);
  // Reading paragraph: body items in lower zone with spaces (prose)
  const proseLines = native.body.filter((item) => item.text.includes(" "));
  const wordListItems = native.body.filter((item) => !item.text.includes(" ") && item.text.trim().length > 0);

  return (
    <>
      <div className="fc-native-board__header-zone fc-layout-syllable-drill">
        {/* Big red letter (left) */}
        <div className="fc-drill-letter" aria-label={`Letra ${letterText}`}>
          <span>{letterText}</span>
        </div>
        {/* Syllable rows (right) */}
        {native.syllables.length > 0 && (
          <div className="fc-syllable-rows" aria-label="Sílabas">
            {row1.length > 0 && (
              <div className="fc-syllable-row">
                {row1.map((syllable, index) => (
                  <span key={`r1-${syllable}-${index}`} className="fc-syllable-row__item">
                    <span className="fc-syllable-row__consonant">{syllable[0]}</span>
                    <span className="fc-syllable-row__vowel">{syllable.slice(1)}</span>
                  </span>
                ))}
              </div>
            )}
            {row2.length > 0 && (
              <div
                className="fc-syllable-row fc-syllable-row--highlight"
                style={{ backgroundColor: panelColorFor(pageNumber) }}
              >
                {row2.map((syllable, index) => (
                  <span key={`r2-${syllable}-${index}`} className="fc-syllable-row__item">
                    <span className="fc-syllable-row__consonant">{syllable[0]}</span>
                    <span className="fc-syllable-row__vowel">{syllable.slice(1)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="fc-native-board__body-zone">
        {/* 3-column word lists */}
        {(native.words.length > 0 || wordListItems.length > 0) && (
          <div className="fc-word-columns">
            {native.words.length > 0 ? (
              <VocabGrid native={native} isVowelPage={false} decorative={decorative} />
            ) : (
              <ul className="fc-word-columns__list">
                {wordListItems.map((item, index) => (
                  <li key={`${item.x}-${item.y}-${index}`}>{item.text}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {/* Pastel key-pattern bar + reading paragraph */}
        {proseLines.length > 0 && (
          <div
            className="fc-reading-bar"
            style={{ backgroundColor: panelColorFor(pageNumber + 1) }}
          >
            {proseLines.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-reading-bar__line">
                <BookLine line={line} />
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Type D (reading-panel): big red letter + pastel panel with
 * bold title + reading verse.
 */
function ReadingPanelLayout(props: BoardProps) {
  const { native, pageNumber, decorative } = props;
  const letterText = native.title.map((item) => item.text.trim()).filter(Boolean).join(" ") || "Aa";
  // Panel title: first bold/large item; verse: remaining body items
  const sortedBody = [...native.body].sort((a, b) => a.y - b.y);
  const panelTitle = sortedBody[0];
  const verseLines = sortedBody.slice(1);

  return (
    <>
      <div className="fc-native-board__header-zone fc-layout-reading-panel">
        {/* Big red letter (left) */}
        <div className="fc-reading-letter" aria-label={`Letra ${letterText}`}>
          <span>{letterText}</span>
        </div>
        {/* Small scene illustration (right) */}
        {native.scene && (
          <div className="fc-reading-panel__scene">
            <LivingIllustration
              src={native.scene!.src}
              alt={decorative ? "" : native.scene!.word}
              static={decorative}
              loading={decorative ? "lazy" : "eager"}
              className="fc-native-board__living-art"
            />
          </div>
        )}
      </div>
      <div className="fc-native-board__body-zone">
        {/* Pastel reading panel */}
        {(panelTitle || verseLines.length > 0) && (
          <div
            className="fc-reading-panel"
            style={{ backgroundColor: panelColorFor(pageNumber) }}
          >
            {panelTitle && (
              <h3 className="fc-reading-panel__title">{panelTitle.text}</h3>
            )}
            {verseLines.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-reading-panel__verse">
                <BookLine line={line} />
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Type E (story-letter): pages 44 and 62.
 * p44: red letter + scene top, panel bottom-left, right side empty.
 * p62: red letter + full-width story, no panel.
 */
function StoryLetterLayout(props: BoardProps) {
  const { native, pageNumber, decorative } = props;
  const letterText = native.title.map((item) => item.text.trim()).filter(Boolean).join(" ") || "Aa";
  const sortedBody = [...native.body].sort((a, b) => a.y - b.y);
  const storyTitle = sortedBody[0];
  const storyLines = sortedBody.slice(1);
  const isPage44 = pageNumber === 44;

  return (
    <>
      <div className="fc-native-board__header-zone fc-layout-story-letter">
        {/* Red letter (left) */}
        <div className="fc-story-letter__letter" aria-label={`Letra ${letterText}`}>
          <span>{letterText}</span>
        </div>
        {/* Large scene illustration (right) */}
        {native.scene && (
          <div className="fc-story-letter__scene">
            <LivingIllustration
              src={native.scene!.src}
              alt={decorative ? "" : native.scene!.word}
              static={decorative}
              loading={decorative ? "lazy" : "eager"}
              className="fc-native-board__living-art"
            />
          </div>
        )}
      </div>
      <div className={`fc-native-board__body-zone ${isPage44 ? "fc-story-letter__asymmetric" : ""}`}>
        {isPage44 ? (
          /* p44: panel bottom-left, right side empty */
          <div
            className="fc-story-panel"
            style={{ backgroundColor: panelColorFor(pageNumber) }}
          >
            {storyTitle && <h3 className="fc-story-panel__title">{storyTitle.text}</h3>}
            {storyLines.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-story-panel__verse">
                <BookLine line={line} />
              </p>
            ))}
          </div>
        ) : (
          /* p62: full-width story, no panel */
          <div className="fc-story-fullwidth">
            {storyTitle && <h3 className="fc-story-fullwidth__title">{storyTitle.text}</h3>}
            {storyLines.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-story-fullwidth__para">
                <BookLine line={line} />
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function FlipchartNativeBoard({
  page,
  accentColor = "#bb0733",
  decorative = false,
  onReady,
}: {
  page: FlipchartPage;
  accentColor?: string;
  decorative?: boolean;
  onReady?: () => void;
}) {
  const native = getNativeFlipchartPage(page.flipchartPage);

  useEffect(() => {
    if (page.flipchartPage > 2) onReady?.();
  }, [onReady, page.flipchartPage]);

  if (page.flipchartPage === 1 || page.flipchartPage === 2) {
    return (
      <FlipchartFrontmatter
        pageNumber={page.flipchartPage}
        decorative={decorative}
        onReady={onReady}
      />
    );
  }

  if (!native) return null;

  const layoutType: FlipchartLayoutType = native.layoutType;
  // Red-letter rule (book §1.5): red target vowel in word labels ONLY on vowel pages 3-6.
  const isVowelPage = page.flipchartPage >= 3 && page.flipchartPage <= 8;
  const boardProps: BoardProps = {
    native,
    pageNumber: page.flipchartPage,
    decorative,
    accentColor,
    isVowelPage,
  };

  return (
    <article
      className="fc-native-board"
      data-testid="flipchart-native-board"
      data-flipchart-page={page.flipchartPage}
      data-lesson={page.lesson}
      data-surface="native"
      data-composition={native.compositionKind}
      data-layout-type={layoutType}
      data-native-flipchart="true"
      style={{ "--fc-accent": accentColor } as CSSProperties}
      aria-hidden={decorative || undefined}
    >
      {/* Exact replica: layout type drives the page composition (book §2) */}
      <div className="fc-native-board__page">
        {layoutType === "vowel-header" && <VowelHeaderLayout {...boardProps} />}
        {layoutType === "consonant-vocab" && <ConsonantVocabLayout {...boardProps} />}
        {layoutType === "syllable-drill" && <SyllableDrillLayout {...boardProps} />}
        {layoutType === "reading-panel" && <ReadingPanelLayout {...boardProps} />}
        {layoutType === "story-letter" && <StoryLetterLayout {...boardProps} />}
        {layoutType === "frontmatter" && null}
      </div>
      {/* Printed page number, bottom-right (book style) */}
      {!decorative && (
        <div className="fc-native-board__pagenum" aria-hidden="true">
          {page.flipchartPage}
        </div>
      )}
    </article>
  );
}
