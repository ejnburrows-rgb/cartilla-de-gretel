/**
 * Flip Chart sheet replica model (owner reference guides, 2026-10-13).
 *
 * Every word, panel and picture is placed exactly where the printed Flip
 * Chart sheet places it, using the source text layer
 * (`flipchart-text-*.json`, 1000-unit-wide page frames) and the approved
 * picture crop boxes (`flipchart-native-assets.json`, same frame space).
 * Decorations the PDF text layer does not carry (letter medallions, vowel
 * circles, the syllable crescent) are derived from the source letters they
 * surround. Nothing here invents text, reorders reading, or adds art.
 */
import firstPages from "@/data/flipchart-text-3-22.json";
import middlePages from "@/data/flipchart-text-23-42.json";
import lastPages from "@/data/flipchart-text-43-62.json";
import frames from "@/data/flipchart-frames.json";
import nativeAssets from "@/data/flipchart-native-assets.json";
import artBounds from "@/data/flipchart-art-content-bounds.json";
import artPlacement from "@/data/flipchart-art-placement.json";
import crescentScans from "@/data/flipchart-crescents.json";

type RawItem = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  fontWeight?: number | string;
  backgroundColor?: string;
  segments?: Array<{ text: string; color: string }>;
  /** Set when a word space separates this piece from the previous one on its line. */
  spaced?: boolean;
};

type RawAsset = { word: string; src: string; crop: number[]; role?: string; labelInImage?: boolean };

const RAW_TEXT = { ...firstPages, ...middlePages, ...lastPages } as unknown as Record<string, RawItem[]>;
const FRAMES = frames as Record<string, { width: number; height: number }>;
const ASSETS = nativeAssets as unknown as Record<string, RawAsset[]>;
/** [naturalWidth, naturalHeight, left, top, width, height] of the drawn area. */
const ART_BOUNDS = artBounds as unknown as Record<string, [number, number, number, number, number, number]>;
type Circle = [number, number, number];
/** The printed syllable moon, measured on each consonant sheet's scan. */
const CRESCENTS = crescentScans as unknown as Record<string, { outer: Circle; inner: Circle }>;
/** Drawn-area rect of each picture on its printed scan: [x, y, w, h, score]. */
const ART_PLACEMENT = artPlacement as unknown as Record<string, [number, number, number, number, number]>;

export const REPLICA_WIDTH = 1000;

export type ReplicaSegment = { text: string; color: string; bold: boolean; /** Bold inside a regular line (the lesson's letter): keep it bold. */ emph?: boolean };

export type ReplicaTokenKind =
  | "letter" // taught letter pair inside a medallion (Mm, Dd …)
  | "vowel" // vowel inside a circle (vowel pages)
  | "title" // bold card title
  | "verse" // reading lines
  | "syllable" // syllable chip in a band
  | "crescent" // syllable in the crescent
  | "word" // vocabulary / word-column chip
  | "chip"; // single highlighted word inside its own small panel (e.g. "y")

export type ReplicaToken = {
  id: string;
  kind: ReplicaTokenKind;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  text: string;
  segments: ReplicaSegment[];
  align: "left" | "center";
  bold: boolean;
  panel?: number;
  /** Printed baseline (sheet units). */
  base: number;
  /** Width the printed sheet gives this text; the renderer fits to it. */
  fitW: number;
  /** Hard maximum width (sheet units), e.g. a card's inner width. */
  fitCap?: number;
  /** Tokens sharing a fit group render at one common size (e.g. a verse card). */
  fitGroup?: string;
  /** Distance to the next printed line (sheet units); caps the size so lines never touch. */
  pitch?: number;
  /** Share of the line pitch the font may take (default: reading lines). */
  pitchShare?: number;
  /** Override for how far this text may grow past its printed size. */
  fitMax?: number;
  /** Fixed chip width (sheet units) so a band's syllable chips match. */
  chipW?: number;
};

export type ReplicaPanel = {
  id: number;
  kind: "card" | "band" | "chip";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  /** 0 = lightest band on the sheet, rising with depth (source order of tone). */
  tone: number;
};

export type ReplicaMedallion = { kind: "letter" | "vowel"; cx: number; cy: number; d: number; tokenId: string };
export type ReplicaCrescent = { x: number; y: number; w: number; h: number; /** Moon outline in sheet units. */ path: string };
export type ReplicaArt = {
  /** Image element rect (sheet units) such that the drawn area fills the printed box. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Clip insets (sheet units) hiding padding/scan leftovers outside the drawing. */
  clip: [number, number, number, number];
  src: string;
  word: string;
  scene: boolean;
  labelInImage: boolean;
};

export type ReplicaSheet = {
  page: number;
  width: number;
  height: number;
  tokens: ReplicaToken[];
  panels: ReplicaPanel[];
  medallions: ReplicaMedallion[];
  crescent?: ReplicaCrescent;
  art: ReplicaArt[];
};

const RED_LIKE = /^#(b|c|d)[0-9a-f]00?[0-9a-f]{2,3}$/i;

function isBold(item: RawItem) {
  return Number(item.fontWeight ?? 400) >= 600;
}

function isWhite(color?: string) {
  return !color || /^#?(fff|ffffff)$/i.test(color.trim());
}

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value.padEnd(6, "f");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function letterPair(text: string) {
  const value = text.trim();
  if (/^rr$/i.test(value)) return true;
  const chars = Array.from(value);
  if (chars.length !== 2) return false;
  return chars[0]!.toLocaleLowerCase("es") === chars[1]!.toLocaleLowerCase("es") && chars[0] !== chars[1];
}

/** Printed stanzas are evenly leaded; OCR baselines wobble. Re-space each
 * stanza's baselines at its median pitch, starting from its first line. */
function evenLines(lines: ReplicaToken[]) {
  const sorted = [...lines].sort((a, b) => a.base - b.base);
  if (sorted.length < 3) return;
  const gaps = sorted.slice(1).map((t, i) => t.base - sorted[i]!.base);
  const pitch = median(gaps);
  let start = 0;
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || gaps[i - 1]! > pitch * 1.45) {
      const stanza = sorted.slice(start, i);
      const local = stanza.length > 1 ? median(stanza.slice(1).map((t, k) => t.base - stanza[k]!.base)) : pitch;
      stanza.forEach((t, k) => {
        t.base = stanza[0]!.base + k * local;
        t.pitch = Math.min(local, pitch);
      });
      start = i;
    }
  }
}

/** The printed moon: the part of the outer circle outside the inner one. */
function moonFromScan(outer: Circle, inner: Circle): ReplicaCrescent {
  const [ox, oy, R] = outer;
  const [ix, iy, r] = inner;
  const d = Math.hypot(ix - ox, iy - oy);
  const a = (R * R - r * r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, R * R - a * a));
  const [ux, uy] = [(ix - ox) / d, (iy - oy) / d];
  const [px, py] = [ox + a * ux, oy + a * uy];
  const tips = [
    [px - h * uy, py + h * ux],
    [px + h * uy, py - h * ux],
  ].sort((p, q) => p[1]! - q[1]!) as [[number, number], [number, number]];
  const [top, bottom] = tips;
  const chordX = (top[0] + bottom[0]) / 2;
  const f = (v: number) => v.toFixed(1);
  const outerLarge = ox > chordX ? 1 : 0;
  const innerLarge = ix > chordX ? 1 : 0;
  const path = `M ${f(top[0])} ${f(top[1])} A ${f(R)} ${f(R)} 0 ${outerLarge} 1 ${f(bottom[0])} ${f(bottom[1])} A ${f(r)} ${f(r)} 0 ${innerLarge} 0 ${f(top[0])} ${f(top[1])} Z`;
  const x = Math.min(top[0], bottom[0]) - 4;
  const y = Math.min(top[1], ox > chordX ? oy - R : top[1]) - 4;
  const yEnd = Math.max(bottom[1], ox > chordX ? oy + R : bottom[1]) + 4;
  return { x, y, w: ox + R + 4 - x, h: yEnd - y, path };
}

/** The printed crescent wraps the letter medallion: a moon whose inner edge
 * is concentric with the medallion. The syllables are set evenly along its
 * middle, in their printed order. Returns undefined if they don't sit beside
 * the medallion. */
function moonAround(tokens: ReplicaToken[], medallion: { cx: number; cy: number; d: number }): ReplicaCrescent | undefined {
  const rows = [...tokens].sort((a, b) => a.y - b.y);
  const { cx, cy } = medallion;
  const centers = rows.map((t) => [t.x + t.w / 2, t.y + t.h / 2] as const);
  if (centers.some(([x]) => x < cx)) return undefined;
  const angles = centers.map(([x, y]) => Math.atan2(y - cy, x - cx));
  const half = Math.max(...rows.map((t) => t.w / 2)) + 30;
  const t = Math.max(half, 64);
  let mid = median(centers.map(([x, y]) => Math.hypot(x - cx, y - cy)));
  const r = Math.max(medallion.d / 2 + 14, mid - t);
  mid = r + t;
  const first = angles[0]!;
  const last = angles[angles.length - 1]!;
  const step = rows.length > 1 ? (last - first) / (rows.length - 1) : 0;
  rows.forEach((token, index) => {
    const a = first + index * step;
    const oy = centers[index]![1];
    const nx = cx + mid * Math.cos(a);
    const ny = cy + mid * Math.sin(a);
    token.x = nx - token.w / 2;
    token.base += ny - oy;
    token.y += ny - oy;
    token.align = "center";
  });
  const phi = Math.min(Math.PI * 0.8, Math.max(Math.abs(first), Math.abs(last)) + 0.42);
  const e = (2 * t * (r + t)) / (r + 2 * t - r * Math.cos(phi));
  const R = r + 2 * t - e;
  const xt = r * Math.cos(phi);
  const yt = r * Math.sin(phi);
  const top = [cx + xt, cy - yt];
  const bottom = [cx + xt, cy + yt];
  const outerLarge = xt - e < 0 ? 1 : 0;
  const innerLarge = xt < 0 ? 1 : 0;
  const f = (v: number) => v.toFixed(1);
  const path = `M ${f(top[0]!)} ${f(top[1]!)} A ${f(R)} ${f(R)} 0 ${outerLarge} 1 ${f(bottom[0]!)} ${f(bottom[1]!)} A ${f(r)} ${f(r)} 0 ${innerLarge} 0 ${f(top[0]!)} ${f(top[1]!)} Z`;
  const x = Math.min(top[0]!, cx + e - R) - 4;
  const y = cy - Math.max(yt, R) - 4;
  return { x, y, w: cx + e + R + 4 - x, h: 2 * Math.max(yt, R) + 8, path };
}

/** A moon that hugs the printed syllables: its outer edge runs past their
 * right edges, its inner edge past their left edges, tapering to two tips. */
function crescentAround(tokens: ReplicaToken[]): ReplicaCrescent {
  const rows = [...tokens].sort((a, b) => a.y - b.y);
  const pad = 28;
  const outer = rows.map((t) => [t.x + t.w + pad, t.y + t.h / 2] as const);
  const inner = rows.map((t) => [t.x - pad, t.y + t.h / 2] as const);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const top = [first.x + first.w / 2 - 34, first.y - 70] as const;
  const bottom = [last.x + last.w / 2 - 34, last.y + last.h + 70] as const;
  const points = [top, ...outer, bottom, ...[...inner].reverse(), top];
  // Smooth (Catmull-Rom) through each edge; the tips stay sharp.
  const smooth = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts.slice(0, -1).map((p, i) => {
      const prev = pts[i - 1] ?? p;
      const next = pts[i + 1]!;
      const after = pts[i + 2] ?? next;
      const c1 = [p[0] + (next[0] - prev[0]) / 6, p[1] + (next[1] - prev[1]) / 6];
      const c2 = [next[0] - (after[0] - p[0]) / 6, next[1] - (after[1] - p[1]) / 6];
      return `C ${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
    });
  const half = outer.length + 1;
  const path = `M ${top[0].toFixed(1)} ${top[1].toFixed(1)} ${smooth(points.slice(0, half + 1)).join(" ")} ${smooth(points.slice(half)).join(" ")} Z`;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs) - 4;
  const y = Math.min(...ys) - 4;
  return { x, y, w: Math.max(...xs) + 4 - x, h: Math.max(...ys) + 4 - y, path };
}

/** Coarse ink class for comparing printed styles: dark text vs. a colour. */
function inkClass(color?: string) {
  const hex = (color ?? "#000000").replace("#", "");
  if (hex.length !== 6) return "dark";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  if (r + g + b < 200) return "dark";
  return r > g + 60 ? "red" : `c${Math.round(r / 64)}${Math.round(g / 64)}${Math.round(b / 64)}`;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function inside(px: number, py: number, p: { x: number; y: number; w: number; h: number }) {
  return px >= p.x - 4 && px <= p.x + p.w + 4 && py >= p.y - 4 && py <= p.y + p.h + 4;
}

/** Join pieces the PDF split mid-word ("m"+"a", "a"+"vión") into one token. */
function mergeLine(items: RawItem[], inBand: (item: RawItem) => boolean) {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const groups: RawItem[][] = [];
  for (const item of sorted) {
    const last = groups[groups.length - 1];
    const prev = last?.[last.length - 1];
    const gap = prev ? item.x - (prev.x + prev.width) : Infinity;
    const em = prev ? Math.min(prev.fontSize, item.fontSize) : 0;
    if (prev && gap <= Math.max(6, 0.16 * em)) last!.push(item);
    // Words of one printed line ("La r para la rama") join with a space;
    // syllable bands keep each syllable apart.
    else if (prev && gap <= 0.5 * em && !inBand(prev) && !inBand(item)) last!.push({ ...item, spaced: true });
    else groups.push([item]);
  }
  return groups;
}

function segmentsFor(group: RawItem[]): ReplicaSegment[] {
  const out: ReplicaSegment[] = [];
  for (const item of group) {
    const lead = item.spaced ? " " : "";
    if (item.segments?.length) {
      item.segments.forEach((segment, index) => out.push({ text: (index > 0 ? " " : lead) + segment.text, color: segment.color, bold: isBold(item) }));
    } else {
      out.push({ text: lead + item.text, color: item.color, bold: isBold(item) });
    }
  }
  return out;
}

export function getReplicaSheet(page: number): ReplicaSheet | null {
  const raw = RAW_TEXT[String(page)];
  const frame = FRAMES[String(page)];
  if (!raw || !frame) return null;
  const height = frame.height * (REPLICA_WIDTH / frame.width);

  // 1. Panels: empty text runs that only paint a background.
  const panelItems = raw.filter((item) => !item.text.trim() && !isWhite(item.backgroundColor) && item.width > 60 && item.height > 50);
  const stacked: ReplicaPanel[] = panelItems.map((item, id) => ({
    id,
    kind: "card",
    x: item.x,
    y: item.y,
    w: item.width,
    h: item.height,
    color: item.backgroundColor!,
    tone: 0,
  }));
  // The PDF paints one L-shaped card (art overlapping a corner) as stacked
  // rectangles; draw it as one card, with the art on top as printed.
  const panels: ReplicaPanel[] = [];
  for (const panel of [...stacked].sort((a, b) => a.y - b.y)) {
    const above = panels.find((p) => p.color.toLowerCase() === panel.color.toLowerCase() && Math.abs(p.y + p.h - panel.y) <= 4 && Math.min(p.x + p.w, panel.x + panel.w) - Math.max(p.x, panel.x) > 0.5 * Math.min(p.w, panel.w) && p.h >= 80 && panel.h >= 80);
    if (!above) {
      panels.push({ ...panel, id: panels.length });
      continue;
    }
    const right = Math.max(above.x + above.w, panel.x + panel.w);
    above.x = Math.min(above.x, panel.x);
    above.w = right - above.x;
    above.h = panel.y + panel.h - above.y;
  }

  // 2. Text lines → tokens.
  const textItems = raw.filter((item) => item.text.trim().length > 0).sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: RawItem[][] = [];
  for (const item of textItems) {
    const cy = item.y + item.height / 2;
    const line = lines.find((l) => Math.abs(l[0]!.y + l[0]!.height / 2 - cy) < Math.min(l[0]!.height, item.height) * 0.42);
    if (line) line.push(item);
    else lines.push([item]);
  }

  const tokens: ReplicaToken[] = [];
  for (const line of lines) {
    const inBand = (item: RawItem) => panels.some((p) => p.h < 160 && inside(item.x + item.width / 2, item.y + item.height / 2, p));
    for (const group of mergeLine(line, inBand)) {
      const x = Math.min(...group.map((g) => g.x));
      const y = Math.min(...group.map((g) => g.y));
      const right = Math.max(...group.map((g) => g.x + g.width));
      const bottom = Math.max(...group.map((g) => g.y + g.height));
      const segments = segmentsFor(group);
      const text = segments.map((s) => s.text).join("");
      const fontSize = Math.max(...group.map((g) => g.fontSize));
      const cx = (x + right) / 2;
      const cy = (y + bottom) / 2;
      const panel = panels.find((p) => inside(cx, cy, p));
      const descends = /[gjpqyç,;()]/.test(text);
      const base = bottom - (descends ? 0.2 * fontSize : 0);
      tokens.push({
        base,
        fitW: right - x,
        id: `t${tokens.length}`,
        kind: "word",
        x,
        y,
        w: right - x,
        h: bottom - y,
        fontSize,
        text,
        segments,
        align: "left",
        bold: group.every(isBold),
        panel: panel?.id,
      });
    }
  }

  // 3. Classify panels and their tokens.
  for (const panel of panels) {
    const members = tokens.filter((t) => t.panel === panel.id);
    const shortMembers = members.filter((t) => t.text.trim().length <= 3);
    if (members.length >= 3 && shortMembers.length === members.length && panel.h < 160) {
      panel.kind = "band";
      // One baseline per band and evenly spaced, equal chips (OCR wobbles).
      const row = [...members].sort((a, b) => a.x - b.x);
      const base = median(row.map((t) => t.base));
      const first = row[0]!.x + row[0]!.w / 2;
      const last = row[row.length - 1]!.x + row[row.length - 1]!.w / 2;
      const step = row.length > 1 ? (last - first) / (row.length - 1) : panel.w;
      row.forEach((t, index) => {
        t.kind = "syllable";
        t.align = "center";
        t.fitGroup = "syllables";
        t.base = base;
        const center = first + index * step;
        t.x = center - t.w / 2;
        t.chipW = Math.min(step * 0.86, panel.w / row.length);
      });
    } else if (members.length === 1 && panel.w < 220 && panel.h < 140) {
      panel.kind = "chip";
      members[0]!.kind = "chip";
      members[0]!.align = "center";
    } else {
      panel.kind = "card";
      // Titles: the leading lines set apart from the reading lines by colour
      // or weight ("Arre caballito" coloured over bold verse; "Made y papá"
      // bold over regular verse).
      const style = (t: ReplicaToken) => `${inkClass(t.segments[0]?.color)}|${t.bold ? "b" : "r"}`;
      const counts = new Map<string, number>();
      members.forEach((t) => counts.set(style(t), (counts.get(style(t)) ?? 0) + 1));
      const majority = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
      const leading: ReplicaToken[] = [];
      for (const t of [...members].sort((a, b) => a.y - b.y)) {
        if (members.length < 2 || style(t) === majority || leading.length >= 2) break;
        leading.push(t);
      }
      const verse = members.filter((t) => !leading.includes(t));
      const titles = members.filter((t) => !verse.includes(t));
      const lefts = verse.map((t) => t.x);
      const spread = lefts.length ? Math.max(...lefts) - Math.min(...lefts) : 0;
      const panelCenter = panel.x + panel.w / 2;
      for (const t of titles) {
        t.kind = "title";
        const centered = Math.abs(t.x + t.w / 2 - panelCenter) < 40 && (!lefts.length || Math.abs(t.x - Math.min(...lefts)) > 30);
        t.align = centered ? "center" : "left";
        if (centered) t.x = panelCenter - t.w / 2;
      }
      for (const t of verse) {
        t.kind = "verse";
        t.align = spread > 40 ? "center" : "left";
        t.fitGroup = `panel-${panel.id}`;
        t.fontSize = median(verse.map((v) => v.fontSize));
      }
      // The printed card encloses its text with a margin; the PDF's paint
      // rectangle sometimes sits flush with the text, so grow it to the text.
      const left = Math.min(panel.x, ...members.map((t) => t.x - 24));
      const right = Math.max(panel.x + panel.w, ...members.map((t) => t.x + t.w + 24));
      panel.x = Math.max(8, left);
      panel.w = Math.min(REPLICA_WIDTH - 8, right) - panel.x;
      evenLines(verse);
      for (const t of titles) if (t.align === "center") t.x = panel.x + panel.w / 2 - t.w / 2;
      for (const t of verse) {
        t.fitCap = t.align === "center" ? panel.w - 56 : panel.x + panel.w - 26 - t.x;
        if (t.x < panel.x + 22) t.x = panel.x + 22;
      }
      for (const t of titles) {
        t.fitGroup = `title-${panel.id}`;
        t.fitCap = panel.w - 56;
      }
    }
  }
  const bands = panels.filter((p) => p.kind === "band").sort((a, b) => luminance(b.color) - luminance(a.color));
  bands.forEach((band, index) => (band.tone = index));

  // 4. Letters, vowels, crescent syllables, free text.
  const medallions: ReplicaMedallion[] = [];
  const vowelPage = page >= 3 && page <= 8;
  const freeTokens = tokens.filter((t) => t.panel === undefined);
  for (const t of freeTokens) {
    const value = t.text.trim();
    const red = t.segments.every((s) => RED_LIKE.test(s.color) || /^#bb0733$/i.test(s.color));
    if (letterPair(value) && t.fontSize >= 70) {
      t.kind = "letter";
      t.align = "center";
      medallions.push({ kind: "letter", cx: t.x + t.w / 2, cy: t.y + t.h / 2, d: 250, tokenId: t.id });
      // The letter fills its medallion (the print's narrow face measures small).
      t.fitW = 180;
      t.fitCap = 200;
    } else if (vowelPage && /^[aeiou]$/i.test(value) && t.fontSize >= 72 && red) {
      t.kind = "vowel";
      t.align = "center";
      medallions.push({ kind: "vowel", cx: t.x + t.w / 2, cy: t.y + t.h / 2 + 4, d: 165, tokenId: t.id });
      t.fitW = 100;
      t.fitCap = 118;
    }
  }

  const measured = CRESCENTS[String(page)];
  const inMoon = (t: ReplicaToken) => {
    if (!measured) return false;
    const [cx, cy] = [t.x + t.w / 2, t.y + t.h / 2];
    const [ox, oy, R] = measured.outer;
    const [ix, iy, r] = measured.inner;
    return Math.hypot(cx - ox, cy - oy) <= R + 10 && Math.hypot(cx - ix, cy - iy) >= r - 30;
  };
  const crescentTokens = freeTokens.filter(
    (t) =>
      t.kind === "word" &&
      t.text.trim().length <= 3 &&
      t.segments.length >= 1 &&
      (inMoon(t) || raw.some((r) => r.text.trim() && !isWhite(r.backgroundColor) && inside(r.x + r.width / 2, r.y + r.height / 2, t))),
  );
  let crescent: ReplicaCrescent | undefined;
  if (measured && crescentTokens.length >= 3) {
    crescentTokens.forEach((t) => (t.kind = "crescent"));
    crescent = moonFromScan(measured.outer, measured.inner);
  } else if (crescentTokens.length >= 3) {
    crescentTokens.forEach((t) => (t.kind = "crescent"));
    const letter = medallions.find((m) => m.kind === "letter");
    crescent = (letter && moonAround(crescentTokens, letter)) || crescentAround(crescentTokens);
  }

  // Free-standing words: columns stay left-aligned, single labels centre on
  // their own printed centre (so a different font never drifts off its picture).
  const free = freeTokens.filter((t) => t.kind === "word");
  const columnOf = (t: ReplicaToken) => free.filter((o) => Math.abs(o.x - t.x) <= 8);
  for (const t of free) {
    const column = columnOf(t).filter((o) => o !== t);
    t.align = column.length >= 2 ? "left" : "center";
    // Reading lines printed straight on the paper (no card): one size per
    // left edge, like a card's stanza.
    const reading = (o: ReplicaToken) => o.text.trim().split(/\s+/).length > 2;
    if (column.length >= 2 && (reading(t) || column.filter(reading).length >= 2)) {
      t.kind = "verse";
      t.fitGroup = `column-${Math.round(t.x / 10)}`;
    } else if (column.length >= 2) {
      // Word columns have room to read larger, as in the reference guides;
      // never past the next column.
      const next = Math.min(...free.filter((o) => o.x > t.x + 20 && Math.abs(o.base - t.base) < 40).map((o) => o.x), REPLICA_WIDTH - 20);
      t.fitGroup = "columns";
      t.fitW = t.w * 1.22;
      t.fitMax = 1.3;
      t.fitCap = next - t.x - 36;
    } else {
      t.fitGroup = "words";
    }
  }

  // Picture labels on one sheet are printed at one size.
  const labels = free.filter((t) => t.fitGroup === "words");
  if (labels.length >= 2) {
    const size = median(labels.map((t) => t.fontSize));
    labels.forEach((t) => {
      t.fitW *= size / t.fontSize;
      t.fontSize = size;
    });
  }

  const columns = new Map<string, ReplicaToken[]>();
  for (const t of free) if (t.fitGroup) columns.set(t.fitGroup, [...(columns.get(t.fitGroup) ?? []), t]);
  for (const [key, members] of columns) {
    const sorted = [...members].sort((a, b) => a.base - b.base);
    const gaps = sorted.slice(1).map((t, i) => t.base - sorted[i]!.base).filter((g) => g > 0);
    if (key.startsWith("column-")) {
      // A bold first line over regular reading lines is the title.
      const head = sorted[0]!;
      if (head.bold && !sorted.slice(1).every((t) => t.bold)) {
        head.kind = "title";
        head.fitGroup = `title-${key}`;
      }
      const lines = sorted.filter((t) => t.kind === "verse");
      const size = median(lines.map((t) => t.fontSize));
      lines.forEach((t) => {
        t.fontSize = size;
        t.fitCap = REPLICA_WIDTH - 24 - t.x;
      });
      evenLines(lines);
    } else if (key === "columns" && gaps.length) {
      const pitch = Math.min(...gaps.filter((g) => g > 20));
      members.forEach((t) => {
        t.pitch = pitch;
        t.pitchShare = 0.8;
      });
    }
  }

  // 5. Pictures from the approved crop boxes (same frame space as the text).
  const sx = REPLICA_WIDTH / frame.width;
  const art: ReplicaArt[] = (ASSETS[String(page)] ?? []).map((asset) => {
    const [cx, cy, cw, ch] = (asset.crop.map(Number) as [number, number, number, number]).map((v) => v * sx) as [number, number, number, number];
    const bounds = ART_BOUNDS[asset.src];
    const base = { src: asset.src, word: asset.word, scene: asset.role === "scene", labelInImage: Boolean(asset.labelInImage) };
    if (!bounds) return { ...base, x: cx, y: cy, w: cw, h: ch, clip: [0, 0, 0, 0] as [number, number, number, number] };
    const [nw, nh, bl, bt, bw, bh] = bounds;
    // Where the drawing sits on the printed scan (template match); otherwise
    // fit the drawn area (not the padded canvas) into the approved box.
    const found = ART_PLACEMENT[asset.src];
    const scale = found ? (found[2] * sx) / bw : Math.min(cw / bw, ch / bh);
    const drawnX = found ? found[0] * sx : cx + (cw - bw * scale) / 2;
    const drawnY = found ? found[1] * sx : cy + (ch - bh * scale) / 2;
    const x = drawnX - bl * scale;
    const y = drawnY - bt * scale;
    const w = nw * scale;
    const h = nh * scale;
    const clip: [number, number, number, number] = [
      Math.max(0, bt * scale - 2),
      Math.max(0, (nw - bl - bw) * scale - 2),
      Math.max(0, (nh - bt - bh) * scale - 2),
      Math.max(0, bl * scale - 2),
    ];
    return { ...base, x, y, w, h, clip };
  });

  for (const t of tokens) {
    if (t.kind !== "verse" || t.segments.every((seg) => seg.bold)) continue;
    t.segments.forEach((seg) => {
      if (seg.bold && seg.text.trim()) seg.emph = true;
    });
  }

  // Reading order: top-to-bottom, then left-to-right.
  tokens.sort((a, b) => (Math.abs(a.y - b.y) < Math.min(a.h, b.h) * 0.5 ? a.x - b.x : a.y - b.y));

  return { page, width: REPLICA_WIDTH, height, tokens, panels, medallions, crescent, art };
}

/** True when the sheet has source geometry (text layer + frame) to replicate. */
export function hasReplicaSheet(page: number) {
  return page >= 3 && Boolean(RAW_TEXT[String(page)]?.length) && Boolean(FRAMES[String(page)]);
}
