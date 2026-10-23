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
import dividerScans from "@/data/flipchart-dividers.json";

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
const CRESCENTS = crescentScans as unknown as Record<string, { outer: Circle; inner: Circle; extent?: [number, number] | null }>;
/** Printed divider bars (glossy colour tubes), measured on the scans: [x, y, w, h, colour stops top→bottom]. */
const DIVIDERS = dividerScans as unknown as Record<string, [number, number, number, number, string[]][]>;
/**
 * Card colour where the owner's reference guide departs from the default rose
 * card: sheet 3's poem card is a cool grey-lavender in the reference.
 */
const CARD_TINT: Record<number, "mist"> = { 3: "mist" };
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
  /** Justified paragraph line: stretch the words to this printed width (sheet units). */
  justifyW?: number;
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
export type ReplicaCrescent = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Moon outline in sheet units. */
  path: string;
  /** Printed top and bottom of the moon: its ends fade out there. */
  fade?: [number, number];
};
export type ReplicaDivider = { x: number; y: number; w: number; h: number; stops: string[] };
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
  dividers: ReplicaDivider[];
  cardTint?: "mist";
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
function moonFromScan(outer: Circle, inner: Circle, extent?: [number, number]): ReplicaCrescent {
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
  if (extent) {
    // The printed moon fades out before its two circles meet: stop where the print does.
    const top = Math.max(y, extent[0] - 6);
    const end = Math.min(yEnd, extent[1] + 6);
    return { x, y: top, w: ox + R + 4 - x, h: end - top, path, fade: [top, end] };
  }
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
    // Mid-word splits touch (≤ 0.05 em); a justified line's word spaces can be
    // as narrow as 0.12 em, so anything wider is a space.
    if (prev && gap <= Math.max(1.5, 0.05 * em)) last!.push(item);
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

  // Printed divider bars (measured from the scan). A bar carrying words is a
  // band and stays a card; an empty card the PDF paints under a bar is drawn
  // once, as the bar.
  const printed = raw.filter((r) => r.text.trim());
  const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
    Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const bars = (DIVIDERS[String(page)] ?? []).map(([x, y, w, h, stops]) => ({ x, y, w, h, stops }));
  const carriesWords = (d: { x: number; y: number; w: number; h: number }) => printed.some((r) => inside(r.x + r.width / 2, r.y + r.height / 2, d));
  const dividers = bars.filter((d) => !carriesWords(d));
  // A bar carrying words the PDF paints no card for: a band of its own.
  for (const d of bars.filter(carriesWords)) {
    if (panels.some((p) => overlap(p, d) >= 0.5 * d.w * d.h)) continue;
    panels.push({ id: panels.length, kind: "card", x: d.x, y: d.y, w: d.w, h: d.h, color: d.stops[3] ?? "#f4dbe4", tone: 0 });
  }
  const seenPanels = new Map<string, boolean>();
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i]!;
    const key = `${p.x},${p.y},${p.w},${p.h}`;
    let shouldRemove = seenPanels.get(key);
    if (shouldRemove === undefined) {
      const underBar = dividers.some((d) => overlap(p, d) >= 0.6 * Math.min(p.w * p.h, d.w * d.h));
      shouldRemove = underBar && !printed.some((r) => inside(r.x + r.width / 2, r.y + r.height / 2, p));
      seenPanels.set(key, shouldRemove);
    }
    if (shouldRemove) panels.splice(i, 1);
  }
  panels.forEach((p, i) => (p.id = i));

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
  const wordBands = new Set<number>();
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
    } else if (
      (members.length >= 2 || (members.length === 1 && panel.w > 600)) &&
      panel.h < 160 &&
      Math.max(...members.map((t) => t.base)) - Math.min(...members.map((t) => t.base)) < 0.4 * median(members.map((t) => t.fontSize))
    ) {
      // A bar of the lesson's sight words on one row ("tiene · patio · no"):
      // a band, each word kept on its printed centre at one size.
      panel.kind = "band";
      wordBands.add(panel.id);
      const base = median(members.map((t) => t.base));
      const size = median(members.map((t) => t.fontSize));
      members.forEach((t) => {
        t.kind = "verse";
        t.align = "center";
        t.base = base;
        t.fontSize = size;
        t.fitGroup = `row-${panel.id}`;
        t.fitCap = Math.min(t.w * 1.5, panel.w / members.length - 24);
        // Printed bold (the text layer drops the weight on these bars).
        t.bold = true;
        t.segments.forEach((seg) => {
          seg.bold = true;
          seg.emph = true;
        });
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
  const bands = panels.filter((p) => p.kind === "band" && !wordBands.has(p.id)).sort((a, b) => luminance(b.color) - luminance(a.color));
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
    crescent = moonFromScan(measured.outer, measured.inner, measured.extent ?? undefined);
  } else if (crescentTokens.length >= 3) {
    crescentTokens.forEach((t) => (t.kind = "crescent"));
    const letter = medallions.find((m) => m.kind === "letter");
    crescent = (letter && moonAround(crescentTokens, letter)) || crescentAround(crescentTokens);
  }

  // Free-standing words: columns stay left-aligned, single labels centre on
  // their own printed centre (so a different font never drifts off its picture).
  const free = freeTokens.filter((t) => t.kind === "word");
  // A column is one run of lines on one left edge: a band, card or divider
  // between two lines ends it (word list above, reading paragraph below).
  const separators = [...panels, ...dividers];
  const separated = (a: ReplicaToken, b: ReplicaToken) => {
    const [upper, lower] = a.base <= b.base ? [a, b] : [b, a];
    return separators.some((p) => p.y >= upper.base - 4 && p.y + p.h <= lower.y + 12 && p.x <= a.x + 8 && p.x + p.w >= a.x);
  };
  const columnOf = (t: ReplicaToken) => free.filter((o) => Math.abs(o.x - t.x) <= 8 && !separated(t, o));
  for (const t of free) {
    const column = columnOf(t).filter((o) => o !== t);
    t.align = column.length >= 2 ? "left" : "center";
    // Reading lines printed straight on the paper (no card): one size per
    // left edge, like a card's stanza.
    const reading = (o: ReplicaToken) => o.text.trim().split(/\s+/).length > 2;
    if (column.length >= 2 && (reading(t) || column.filter(reading).length >= 2)) {
      t.kind = "verse";
      const run = [t, ...column];
      t.fitGroup = `column-${Math.round(Math.min(...run.map((o) => o.x)))}-${Math.round(Math.min(...run.map((o) => o.y)))}`;
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

  // One paragraph per connected run of left edges (the print's edges wobble
  // a few units line to line).
  const reads = free.filter((t) => t.fitGroup?.startsWith("column-"));
  const seen = new Set<ReplicaToken>();
  for (const t of reads) {
    if (seen.has(t)) continue;
    const run = [t];
    seen.add(t);
    for (let k = 0; k < run.length; k++) {
      for (const o of reads) {
        if (!seen.has(o) && Math.abs(o.x - run[k]!.x) <= 8 && !separated(run[k]!, o)) {
          seen.add(o);
          run.push(o);
        }
      }
    }
    const key = `column-${Math.round(Math.min(...run.map((o) => o.x)))}-${Math.round(Math.min(...run.map((o) => o.y)))}`;
    run.forEach((o) => (o.fitGroup = key));
  }

  // A reading line set in a little (an answer under a question) belongs to
  // the paragraph beside it.
  for (const t of free) {
    if (t.fitGroup !== "words" || t.text.trim().split(/\s+/).length < 3) continue;
    const host = free
      .filter((o) => o.fitGroup?.startsWith("column-") && Math.abs(o.x - t.x) <= 80 && Math.abs(o.base - t.base) <= 2.6 * t.fontSize && !separated(t, o))
      .sort((a, b) => Math.abs(a.base - t.base) - Math.abs(b.base - t.base))[0];
    if (!host) continue;
    t.kind = "verse";
    t.align = "left";
    t.fitGroup = host.fitGroup;
  }

  // Picture labels on one sheet are printed at one size.
  const labels = free.filter((t) => t.fitGroup === "words");
  if (labels.length >= 2) {
    const size = median(labels.map((t) => t.fontSize));
    labels.forEach((t) => {
      const k = size / t.fontSize;
      t.fitW *= k;
      // An oversized text-layer run ("Tierra") also sits too low: keep its
      // top and bring its baseline to the shared size.
      if (k < 0.75) t.base = t.y + (t.base - t.y) * k;
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
      // A printed paragraph set justified: most lines end on one right edge.
      const widest = Math.max(...lines.map((t) => t.w));
      const full = lines.filter((t) => t.w >= widest - 6);
      if (lines.length >= 4 && full.length >= 3 && full.length >= lines.length * 0.6) {
        lines.forEach((t) => {
          // Printed widths include the stretched spaces: keep the printed size
          // and stretch the words, never the letters.
          t.fitMax = 1;
          t.fitCap = widest;
          if (full.includes(t) && t !== lines[lines.length - 1]) t.justifyW = widest;
        });
      }
      evenLines(lines);
    } else if (key === "columns" && gaps.length) {
      // The word lists are printed at one size; the text layer's sizes wobble.
      const size = median(members.map((t) => t.fontSize));
      members.forEach((t) => (t.fontSize = size));
      // Each list's rows are evenly spaced in print (the text layer's
      // baselines wobble): space them from first to last row.
      const lists: ReplicaToken[][] = [];
      for (const t of [...members].sort((a, b) => a.x - b.x)) {
        const list = lists.find((l) => Math.abs(l[0]!.x - t.x) <= 8);
        if (list) list.push(t);
        else lists.push([t]);
      }
      const steps: number[] = [];
      for (const list of lists) {
        list.sort((a, b) => a.base - b.base);
        if (list.length < 3) continue;
        const first = list[0]!.base;
        const step = (list[list.length - 1]!.base - first) / (list.length - 1);
        list.forEach((t, k) => (t.base = first + k * step));
        steps.push(step);
      }
      const pitch = steps.length ? Math.min(...steps) : Math.min(...gaps.filter((g) => g > 20));
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

  // The lesson's sight words (on the word band or in chips) print bold in
  // its reading lines.
  const plain = (w: string) => w.toLowerCase().replace(/[^\p{L}]/gu, "");
  const sight = new Set(
    tokens
      .filter((t) => t.panel !== undefined && (wordBands.has(t.panel) || panels[t.panel]?.kind === "chip"))
      .flatMap((t) => t.text.trim().split(/\s+/).map(plain))
      .filter(Boolean),
  );
  for (const t of tokens) {
    if (t.kind !== "verse" || t.segments.every((seg) => seg.bold)) continue;
    if (sight.size && !(t.panel !== undefined && wordBands.has(t.panel))) {
      t.segments = t.segments.flatMap((seg) => {
        if (seg.bold) return [seg];
        const out: ReplicaSegment[] = [];
        const push = (text: string, bold: boolean) => {
          const last = out[out.length - 1];
          if (last && last.bold === bold) last.text += text;
          else out.push({ ...seg, text, bold });
        };
        for (const part of seg.text.split(/(\s+)/)) {
          const m = /^([^\p{L}]*)(\p{L}+)([^\p{L}]*)$/u.exec(part);
          if (m && sight.has(plain(m[2]!))) {
            push(m[1]!, false);
            push(m[2]!, true);
            push(m[3]!, false);
          } else push(part, false);
        }
        return out.filter((o) => o.text);
      });
    }
    t.segments.forEach((seg) => {
      if (seg.bold && seg.text.trim()) seg.emph = true;
    });
  }

  // Reading order: top-to-bottom, then left-to-right.
  tokens.sort(byReadingOrder);
  // The lesson letter (Mm) is read before the syllables that ring it, even
  // when the crescent's first syllables sit higher than the letter's top.
  for (const letter of tokens.filter((t) => t.kind === "letter")) {
    const at = tokens.indexOf(letter);
    const first = tokens.findIndex((t, i) => i < at && (t.kind === "crescent" || t.kind === "syllable") && t.y < letter.y + letter.h);
    if (first >= 0) {
      tokens.splice(at, 1);
      tokens.splice(first, 0, letter);
    }
  }

  return { page, width: REPLICA_WIDTH, height, tokens, panels, medallions, crescent, art, dividers, cardTint: CARD_TINT[page] };
}

type Box = { x: number; y: number; w: number; h: number };

/** Top-to-bottom rows, then left-to-right within a row. */
function byReadingOrder(a: Box, b: Box) {
  return Math.abs(a.y - b.y) < Math.min(a.h, b.h) * 0.5 ? a.x - b.x : a.y - b.y;
}

export type ReplicaItem = { kind: "art"; art: ReplicaArt } | { kind: "token"; token: ReplicaToken };

/**
 * Pictures and texts in one reading order, so assistive technology meets each
 * picture next to its word. The visual stacking (pictures under text) is set
 * by CSS z-index, not by this order. Texts keep their own order; each picture
 * goes before the first item it precedes, judged by its visible (clipped) box.
 */
export function replicaReadingOrder(sheet: Pick<ReplicaSheet, "tokens" | "art">): ReplicaItem[] {
  const items: (ReplicaItem & { box: Box })[] = sheet.tokens.map((token) => ({ kind: "token", token, box: token }));
  for (const art of sheet.art) {
    const [t, r, b, l] = art.clip;
    const box = { x: art.x + l, y: art.y + t, w: Math.max(1, art.w - l - r), h: Math.max(1, art.h - t - b) };
    const at = items.findIndex((item) => byReadingOrder(box, item.box) < 0);
    items.splice(at < 0 ? items.length : at, 0, { kind: "art", art, box });
  }
  return items.map(({ box: _box, ...item }) => item as ReplicaItem);
}

/** True when the sheet has source geometry (text layer + frame) to replicate. */
export function hasReplicaSheet(page: number) {
  return page >= 3 && Boolean(RAW_TEXT[String(page)]?.length) && Boolean(FRAMES[String(page)]);
}
