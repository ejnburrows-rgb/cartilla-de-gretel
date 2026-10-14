import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { getReplicaSheet, type ReplicaToken } from "@/lib/flipchart-replica";
import sourceColors from "@/data/flipchart-source-colors.json";
import "@/styles/flipchart-replica-fonts.css";
import "@/styles/flipchart-replica.css";

type SourcePageColors = { panel?: string; crescentLight?: string; crescentEdge?: string };
const SOURCE_COLORS = (sourceColors as { pages: Record<string, SourcePageColors> }).pages;

function box(x: number, y: number, w: number, h: number, extra?: Record<string, string | number>) {
  return { "--x": x, "--y": y, "--w": w, "--h": h, ...extra } as CSSProperties;
}

/** How far a text may grow past its printed size to fill its printed width. */
const MAX_GROW: Partial<Record<ReplicaToken["kind"], number>> = { letter: 1.18, vowel: 1.15, word: 1.08, syllable: 1.08, crescent: 1.2, verse: 1.5, title: 1.12 };
/** Largest font size, as a share of the printed line pitch, that keeps lines apart. */
const PITCH_SHARE = 0.92;

/** Reading lines are inked soft charcoal, as in the reference guides. */
function inkFor(token: ReplicaToken, color: string) {
  if (token.kind !== "verse") return color;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return color;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return r! + g! + b! < 150 ? "var(--replica-verse-ink)" : color;
}

function Token({ token }: { token: ReplicaToken }) {
  const style = {
    "--x": token.align === "center" ? token.x + token.w / 2 : token.x,
    "--base": token.base,
    "--fs": token.fontSize,
    ...(token.chipW ? { "--chip-w": token.chipW } : {}),
  } as CSSProperties;
  return (
    <p
      className={`fc-replica__text fc-replica__text--${token.kind} fc-replica__text--${token.align}`}
      data-token-kind={token.kind}
      data-fit-w={token.fitW}
      data-fit-cap={token.fitCap}
      data-fit-group={token.fitGroup}
      data-fit-pitch={token.pitch ? (token.pitch * (token.pitchShare ?? PITCH_SHARE)) / token.fontSize : undefined}
      data-fit-max={token.fitMax ?? MAX_GROW[token.kind] ?? 1.04}
      style={style}
    >
      <span className="fc-replica__ink">
        {token.segments.map((segment, index) => (
          <span key={index} style={{ color: inkFor(token, segment.color) }} data-bold={segment.bold || undefined} data-emph={segment.emph || undefined}>
            {segment.text}
          </span>
        ))}
      </span>
    </p>
  );
}

/**
 * One Flip Chart sheet as an exact positional replica of the printed sheet,
 * finished in the owner's reference style (paper, spiral, embossed letter
 * medallion, rose chips and cards). See src/lib/flipchart-replica.ts.
 */
export function FlipchartReplicaSheet({ pageNumber, decorative = false }: { pageNumber: number; decorative?: boolean }) {
  const sheet = useMemo(() => getReplicaSheet(pageNumber), [pageNumber]);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fit every text to the width the printed sheet gives it. The ratio is
  // independent of the on-screen size (everything scales by --u), so it is
  // measured once per sheet and again when web fonts finish loading.
  useLayoutEffect(() => {
    const root = sheetRef.current;
    if (!root) return;
    const fit = () => {
      const unit = root.clientWidth / 1000;
      if (!unit) return;
      const texts = [...root.querySelectorAll<HTMLElement>(".fc-replica__text[data-fit-w]")];
      texts.forEach((el) => el.style.removeProperty("--fit"));
      // Measure layout widths (offsetWidth ignores the page-turn transform),
      // text only: chips' padding/min-width are switched off while measuring.
      root.classList.add("fc-replica__sheet--measuring");
      const naturals = new Map<HTMLElement, number>();
      for (const el of texts) {
        const ink = el.firstElementChild as HTMLElement | null;
        if (ink) naturals.set(el, ink.offsetWidth);
      }
      root.classList.remove("fc-replica__sheet--measuring");
      const ratios = new Map<HTMLElement, number>();
      const caps = new Map<HTMLElement, number>();
      for (const el of texts) {
        const natural = naturals.get(el) ?? 0;
        const target = Number(el.dataset.fitW) * unit;
        if (!(natural > 0) || !(target > 0)) continue;
        const cap = Number(el.dataset.fitCap) * unit;
        const ratio = Math.max(0.6, Math.min(Number(el.dataset.fitMax) || 1, target / natural));
        ratios.set(el, ratio);
        const pitchCap = Number(el.dataset.fitPitch) || Infinity;
        if (cap > 0 || pitchCap < Infinity) caps.set(el, Math.min(cap > 0 ? cap / natural : Infinity, pitchCap));
      }
      // One size per group (median), never wider than the card allows.
      const groups = new Map<string, number[]>();
      for (const [el, ratio] of ratios) {
        const key = el.dataset.fitGroup;
        if (key) groups.set(key, [...(groups.get(key) ?? []), ratio]);
      }
      const groupRatio = new Map<string, number>();
      for (const [key, list] of groups) groupRatio.set(key, [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]!);
      const final = new Map<HTMLElement, number>();
      for (const [el, ratio] of ratios) {
        const key = el.dataset.fitGroup;
        final.set(el, Math.min(key ? groupRatio.get(key)! : ratio, caps.get(el) ?? Infinity));
      }
      // Keep a group even: if a cap forced one line smaller, use that size for all.
      const groupMin = new Map<string, number>();
      for (const [el, ratio] of final) {
        const key = el.dataset.fitGroup;
        if (key && caps.has(el)) groupMin.set(key, Math.min(groupMin.get(key) ?? Infinity, ratio));
      }
      for (const [el, ratio] of final) {
        const key = el.dataset.fitGroup;
        el.style.setProperty("--fit", String(Math.min(ratio, key ? groupMin.get(key) ?? Infinity : Infinity)));
      }
    };
    fit();
    let cancelled = false;
    document.fonts?.ready.then(() => { if (!cancelled) fit(); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [sheet]);

  if (!sheet) return null;
  const colors = SOURCE_COLORS[String(pageNumber)] ?? {};
  const crescentLight = colors.crescentLight ?? "#e6dcef";
  const crescentEdge = colors.crescentEdge ?? colors.crescentLight ?? "#c9b8dc";
  const gradientId = `fc-replica-crescent-${pageNumber}${decorative ? "-thumb" : ""}`;

  return (
    <div className="fc-replica" data-replica-page={pageNumber}>
      <div
        ref={sheetRef}
        className="fc-replica__sheet"
        data-testid="flipchart-replica-sheet"
        style={{ "--sheet-h": sheet.height } as CSSProperties}
      >
        <div className="fc-replica__spiral" aria-hidden="true" />
        <div className="fc-replica__canvas">
          {sheet.panels.map((panel) => (
            <div
              key={`panel-${panel.id}`}
              aria-hidden="true"
              className={`fc-replica__panel fc-replica__panel--${panel.kind}`}
              data-tone={panel.tone}
              style={box(panel.x, panel.y, panel.w, panel.h, { "--panel": panel.color })}
            />
          ))}

          {sheet.crescent && (
            <svg
              className="fc-replica__crescent"
              aria-hidden="true"
              focusable="false"
              viewBox={`${sheet.crescent.x} ${sheet.crescent.y} ${sheet.crescent.w} ${sheet.crescent.h}`}
              style={box(sheet.crescent.x, sheet.crescent.y, sheet.crescent.w, sheet.crescent.h)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0.2" stopColor={crescentLight} />
                  <stop offset="1" stopColor={crescentEdge} />
                </linearGradient>
              </defs>
              <path d={sheet.crescent.path} fill={`url(#${gradientId})`} />
            </svg>
          )}

          {sheet.medallions.map((medallion) => (
            <div
              key={`medallion-${medallion.tokenId}`}
              aria-hidden="true"
              className={`fc-replica__medallion fc-replica__medallion--${medallion.kind}`}
              style={box(
                medallion.cx - medallion.d / 2,
                medallion.cy - medallion.d / 2,
                medallion.d,
                medallion.d,
                // On crescent sheets the medallion ring takes the moon's colour, as printed.
                sheet.crescent && medallion.kind === "letter" ? { "--ring-light": crescentLight, "--ring-edge": crescentEdge } : undefined,
              )}
            />
          ))}

          {sheet.art.map((asset) => (
            <figure
              key={asset.src}
              className={`fc-replica__art${asset.scene ? " fc-replica__art--scene" : ""}`}
              style={box(asset.x, asset.y, asset.w, asset.h, {
                "--clip-t": asset.clip[0],
                "--clip-r": asset.clip[1],
                "--clip-b": asset.clip[2],
                "--clip-l": asset.clip[3],
              })}
            >
              <LivingIllustration
                src={asset.src}
                alt={decorative ? "" : asset.word}
                static={decorative}
                loading={decorative ? "lazy" : "eager"}
                className="fc-replica__living"
              />
            </figure>
          ))}

          {sheet.tokens.map((token) => (
            <Token key={token.id} token={token} />
          ))}
        </div>
        {!decorative && (
          <div className="fc-native-board__pagenum fc-replica__pagenum" aria-hidden="true">
            {pageNumber}
          </div>
        )}
      </div>
    </div>
  );
}
