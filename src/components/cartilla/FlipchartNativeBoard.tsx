import { useEffect, useState } from "react";
import { FlipchartFrontmatter } from "@/components/cartilla/FlipchartFrontmatter";
import { flipchartSlotAssetSrc, getNativeFlipchartPage } from "@/lib/flipchart-native";
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
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    setHeroFailed(false);
  }, [page.flipchartPage]);

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

  const heroSlot = native.slots[0]!;
  const heroSrc = flipchartSlotAssetSrc(heroSlot);
  const titleText = native.title.map((item) => item.text.trim()).filter(Boolean).join(" ");
  const bodyLines = native.body.filter((item) => item.text.trim().length > 0);
  const maxBody = bodyLines.reduce((max, item) => Math.max(max, item.fontSize), 1);

  return (
    <article
      className="fc-native-board"
      data-testid="flipchart-native-board"
      data-flipchart-page={page.flipchartPage}
      data-lesson={page.lesson}
      data-surface="native"
      data-native-flipchart="true"
      style={{ ["--fc-accent" as string]: accentColor }}
      aria-hidden={decorative || undefined}
    >
      <header className="fc-native-board__head">
        {titleText ? (
          <h2 className="fc-native-board__title">{titleText}</h2>
        ) : (
          <h2 className="fc-native-board__title">Lámina {page.flipchartPage}</h2>
        )}
        {!decorative && (
          <p className="fc-native-board__meta">
            {page.lesson > 0 ? `Lección ${page.lesson}` : "Apertura"} · Lámina {page.flipchartPage}/62
          </p>
        )}
      </header>

      <div className="fc-native-board__grid">
        <section
          className="fc-native-board__art"
          data-slot={heroSlot}
          aria-label={decorative ? undefined : `Ilustración de la lámina ${page.flipchartPage}`}
        >
          {!heroFailed ? (
            <img
              className="fc-native-board__hero"
              src={heroSrc}
              alt={decorative ? "" : `Ilustración — ${titleText || `lámina ${page.flipchartPage}`}`}
              loading={decorative ? "lazy" : "eager"}
              decoding="async"
              draggable={false}
              onLoad={onReady}
              onError={() => {
                setHeroFailed(true);
                onReady?.();
              }}
              data-testid="flipchart-hero-asset"
            />
          ) : (
            <div className="fc-native-board__missing-art" role={decorative ? undefined : "status"}>
              <span aria-hidden>✦</span>
              <strong>Ilustración en preparación</strong>
            </div>
          )}
        </section>

        {(bodyLines.length > 0 || native.words.length > 0) && (
          <section className="fc-native-board__content">
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
                {native.words.map((word, index) => (
                  <li
                    key={`${word.x}-${word.y}-${index}`}
                    className="fc-native-board__word"
                    style={{ borderColor: WORD_ACCENTS[index % WORD_ACCENTS.length] }}
                  >
                    {word.lead ? (
                      <span
                        className="fc-native-board__word-lead"
                        style={{ color: WORD_ACCENTS[index % WORD_ACCENTS.length] }}
                      >
                        {word.lead}
                      </span>
                    ) : null}
                    <span className="fc-native-board__word-rest">{word.rest || word.parts.join("")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
