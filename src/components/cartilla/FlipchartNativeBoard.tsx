import { useEffect, type CSSProperties } from "react";
import { FlipchartFrontmatter } from "@/components/cartilla/FlipchartFrontmatter";
import { getNativeFlipchartPage } from "@/lib/flipchart-native";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import type { FlipchartPage } from "@/lib/flipchart-hd";

const WORD_ACCENTS = ["#bb0733", "#1d6f42", "#1a4fa0", "#b06a00", "#6b3fa0", "#0e7d7d"];

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

  const titleText = native.title.map((item) => item.text.trim()).filter(Boolean).join(" ");
  const bodyLines = native.body.filter((item) => item.text.trim().length > 0);
  const maxBody = bodyLines.reduce((max, item) => Math.max(max, item.fontSize), 1);
  // Red-letter rule (book §1.5): red target vowel in word labels ONLY on vowel pages 3-6.
  const isVowelPage = page.flipchartPage >= 3 && page.flipchartPage <= 6;

  return (
    <article
      className="fc-native-board"
      data-testid="flipchart-native-board"
      data-flipchart-page={page.flipchartPage}
      data-lesson={page.lesson}
      data-surface="native"
      data-composition={native.compositionKind}
      data-native-flipchart="true"
      style={{ "--fc-accent": accentColor } as CSSProperties}
      aria-hidden={decorative || undefined}
    >
      {/* Exact replica: single-column vertical flow. Header zone (~top 40%) then body below.
          No page chrome — the book has no "Lámina N" title or meta pill inside the page. */}
      <div className="fc-native-board__page">
        <div className="fc-native-board__header-zone">
          {native.art.length > 0 ? (
            <div
              className="fc-native-board__art-grid"
              data-testid="flipchart-art-grid"
              data-art-count={native.art.length}
            >
              {native.art.map((asset, index) => (
                <figure
                  key={asset.src}
                  className="fc-native-board__art-card"
                  data-art-index={index}
                >
                  <LivingIllustration
                    src={asset.src}
                    alt={decorative ? "" : asset.word}
                    static={decorative}
                    loading={decorative ? "lazy" : "eager"}
                    className="fc-native-board__living-art"
                  />
                  {!decorative && (
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
              ))}
            </div>
          ) : (
            <div
              className="fc-native-board__letter-stage"
              aria-label={decorative ? undefined : `Lámina tipográfica ${page.flipchartPage}`}
            >
              <span>{titleText.slice(0, 2) || native.syllables[0] || "Aa"}</span>
            </div>
          )}
        </div>

        {(bodyLines.length > 0 || native.syllables.length > 0 || native.words.length > 0) && (
          <div className="fc-native-board__body-zone">
            {native.syllables.length > 0 && (
              <div className="fc-native-board__syllables" aria-label="Sílabas">
                {native.syllables.map((syllable, index) => (
                  <span key={`${syllable}-${index}`}>{syllable}</span>
                ))}
              </div>
            )}
            {bodyLines.length > 0 && (
              <div className="fc-native-board__rhyme">
                {bodyLines.map((line, index) => (
                  <p
                    key={`${line.x}-${line.y}-${index}`}
                    className="fc-native-board__line"
                    style={{
                      fontSize: `${Math.max(1.05, (line.fontSize / maxBody) * 1.45)}rem`,
                      fontWeight: Number(line.fontWeight ?? 400) >= 600 ? 800 : 600,
                      fontStyle: line.fontStyle === "italic" ? "italic" : "normal",
                    }}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            )}

            {native.words.length > 0 && (
              <ul className="fc-native-board__words" data-testid="flipchart-words">
                {native.words.map((word, index) => {
                  // Red-letter rule (book §1.5): red target vowel in word pills
                  // ONLY on vowel pages 3-6, matching the art-label rule above.
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
                        <span
                          className="fc-native-board__word-lead"
                          style={{ color: leadColor }}
                        >
                          {word.lead}
                        </span>
                      ) : null}
                      <span className="fc-native-board__word-rest">{wordText}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
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
