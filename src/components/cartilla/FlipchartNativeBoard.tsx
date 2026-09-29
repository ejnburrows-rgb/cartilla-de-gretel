import { useEffect, type CSSProperties } from "react";
import { FlipchartFrontmatter } from "@/components/cartilla/FlipchartFrontmatter";
import { getNativeFlipchartPage, type FlipchartLayoutType, type NativeFlipchartPage } from "@/lib/flipchart-native";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import type { FlipchartPage } from "@/lib/flipchart-hd";

const WORD_ACCENTS = ["#bb0733", "#1d6f42", "#1a4fa0", "#b06a00", "#6b3fa0", "#0e7d7d"];

/** Pastel panel colors per book §2 (vary by page) */
const PANEL_COLORS: Record<string, string> = {
  blue: "#dbeafe",
  pink: "#fce7f3",
  lavender: "#ede9fe",
  cream: "#fef3c7",
  peach: "#ffedd5",
  teal: "#ccfbf1",
};

/** Pick a pastel panel color based on page number (matches book variation) */
function panelColorFor(pageNumber: number): string {
  const colors = [PANEL_COLORS.blue, PANEL_COLORS.pink, PANEL_COLORS.lavender, PANEL_COLORS.cream, PANEL_COLORS.peach];
  return colors[pageNumber % colors.length]!;
}

/** Crescent colors per book §2 (purple, pink, blue, teal — varies by lesson) */
function crescentColorFor(pageNumber: number): string {
  const colors = ["#ddd6fe", "#fce7f3", "#dbeafe", "#ccfbf1", "#e9d5ff"];
  return colors[Math.floor(pageNumber / 3) % colors.length]!;
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
        const leadColor = useRedLead ? "#bb0733" : WORD_ACCENTS[index % WORD_ACCENTS.length];
        return (
          <li
            key={`${word.x}-${word.y}-${index}`}
            className="fc-native-board__word"
            style={{ borderColor: WORD_ACCENTS[index % WORD_ACCENTS.length] }}
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
  const BAKED_LABEL_SLUGS = ["p021-dados", "p021-dedo", "p021-didi", "p021-dunia"];
  return (
    <div className="fc-native-board__art-grid" data-testid="flipchart-art-grid" data-art-count={native.art.length}>
      {native.art.map((asset, index) => {
        const hasBakedLabel = asset.labelInImage || BAKED_LABEL_SLUGS.some((s) => asset.src.includes(s));
        return (
        <figure key={asset.src} className="fc-native-board__art-card" data-art-index={index}>
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
        {native.art.length > 0 && (
          <div className="fc-vowel-header__scene">
            <LivingIllustration
              src={native.art[0]!.src}
              alt={decorative ? "" : native.art[0]!.word}
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
            {verseLines.map((line, index) => (
              <p
                key={`${line.x}-${line.y}-${index}`}
                className={index === 0 ? "fc-vowel-header__title" : "fc-vowel-header__verse"}
              >
                {line.text}
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
        {native.art.length > 1 ? (
          <ArtGrid native={{ ...native, art: native.art.slice(1) }} isVowelPage={isVowelPage} decorative={decorative} />
        ) : (
          <VocabGrid native={native} isVowelPage={isVowelPage} decorative={decorative} />
        )}
        {remainingBody.length > 0 && (
          <div className="fc-native-board__rhyme">
            {remainingBody.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-native-board__line">
                {line.text}
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
        {native.art.length > 0 && (
          <div className="fc-consonant-vocab__scene">
            <LivingIllustration
              src={native.art[0]!.src}
              alt={decorative ? "" : native.art[0]!.word}
              static={decorative}
              loading={decorative ? "lazy" : "eager"}
              className="fc-native-board__living-art"
            />
          </div>
        )}
        {/* Big red letter in soft oval (center) */}
        <div className="fc-letter-oval" aria-label={`Letra ${letterText}`}>
          <span>{letterText}</span>
        </div>
        {/* Syllable crescent (right): pastel moon with vertical syllable stack */}
        {native.syllables.length > 0 && (
          <div
            className="fc-crescent"
            style={{ backgroundColor: crescentColorFor(pageNumber) }}
            aria-label="Sílabas"
          >
            {native.syllables.map((syllable, index) => (
              <span key={`${syllable}-${index}`} className="fc-crescent__syllable">
                <span className="fc-crescent__consonant">{syllable[0]}</span>
                <span className="fc-crescent__vowel">{syllable.slice(1)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="fc-native-board__body-zone">
        {/* Vocab grid (excluding scene art) */}
        {native.art.length > 1 ? (
          <ArtGrid native={{ ...native, art: native.art.slice(1) }} isVowelPage={isVowelPage} decorative={decorative} />
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
                {line.text}
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
        {native.art.length > 0 && (
          <div className="fc-reading-panel__scene">
            <LivingIllustration
              src={native.art[0]!.src}
              alt={decorative ? "" : native.art[0]!.word}
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
                {line.text}
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
        {native.art.length > 0 && (
          <div className="fc-story-letter__scene">
            <LivingIllustration
              src={native.art[0]!.src}
              alt={decorative ? "" : native.art[0]!.word}
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
            style={{ backgroundColor: PANEL_COLORS.blue }}
          >
            {storyTitle && <h3 className="fc-story-panel__title">{storyTitle.text}</h3>}
            {storyLines.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-story-panel__verse">
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          /* p62: full-width story, no panel */
          <div className="fc-story-fullwidth">
            {storyTitle && <h3 className="fc-story-fullwidth__title">{storyTitle.text}</h3>}
            {storyLines.map((line, index) => (
              <p key={`${line.x}-${line.y}-${index}`} className="fc-story-fullwidth__para">
                {line.text}
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
  const isVowelPage = page.flipchartPage >= 3 && page.flipchartPage <= 6;
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
