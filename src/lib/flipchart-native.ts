import flipchartData from "@/data/teacher-flipchart.json";
import firstPages from "@/data/flipchart-text-3-22.json";
import middlePages from "@/data/flipchart-text-23-42.json";
import lastPages from "@/data/flipchart-text-43-62.json";
import frames from "@/data/flipchart-frames.json";
import faithfulManifest from "@/data/faithful-art-manifest.json";
import nativeExtras from "@/data/flipchart-native-assets.json";

export type FlipchartTextItem = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  fontWeight?: number | string;
  fontStyle?: string;
  backgroundColor?: string;
};

export type FlipchartWordGroup = {
  fontSize: number;
  parts: string[];
  lead: string;
  rest: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type NativeFlipchartPage = {
  flipchartPage: number;
  lesson: number;
  title: FlipchartTextItem[];
  body: FlipchartTextItem[];
  words: FlipchartWordGroup[];
  syllables: string[];
  artRegion: { top: number; bottom: number; left: number; right: number };
  slots: string[];
  art: Array<{ src: string; word: string }>;
  compositionKind: "art" | "typography-only" | "frontmatter";
  hasDigitalText: boolean;
};

const digitalPages = { ...firstPages, ...middlePages, ...lastPages } as Record<string, FlipchartTextItem[]>;
const frameMap = frames as Record<string, { width: number; height: number; left: number; right: number; bottom: number }>;
const PAGE_META = (flipchartData.pages as { flipchartPage: number; lesson: number }[])
  .slice()
  .sort((a, b) => a.flipchartPage - b.flipchartPage);

type FaithfulManifestEntry = {
  src: string;
  word?: string | null;
  slug?: string | null;
  lessonNumber?: number | null;
  sourceFlipchartPage?: number | string | null;
};

const FAITHFUL = faithfulManifest as FaithfulManifestEntry[];
const NATIVE_EXTRAS = nativeExtras as Record<string, Array<{ word: string; src: string }>>;

function normalizeWord(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-zñü0-9]+/g, "");
}

function pageArt(
  flipchartPage: number,
  lesson: number,
  words: FlipchartWordGroup[],
  body: FlipchartTextItem[],
) {
  const tokens = new Set<string>();
  for (const word of words) {
    const joined = word.parts.join("");
    if (joined.trim()) tokens.add(normalizeWord(joined));
  }
  for (const line of body) {
    for (const token of line.text.split(/\s+/)) {
      const normalized = normalizeWord(token);
      if (normalized.length >= 3) tokens.add(normalized);
    }
  }

  const textMatches = FAITHFUL.filter((entry) => {
    const word = normalizeWord(entry.word ?? entry.slug ?? "");
    return word && tokens.has(word);
  });

  const unique = new Map<string, { src: string; word: string }>();
  for (const entry of NATIVE_EXTRAS[String(flipchartPage)] ?? []) {
    if (!entry.src || unique.has(entry.src)) continue;
    unique.set(entry.src, { src: entry.src, word: entry.word });
  }
  for (const entry of textMatches) {
    if (!entry.src || unique.has(entry.src)) continue;
    unique.set(entry.src, {
      src: entry.src,
      word: entry.word ?? entry.slug ?? "Ilustración",
    });
    if (unique.size >= 8) break;
  }
  return [...unique.values()].slice(0, 8);
}

function normalizedLetterPair(text: string) {
  const value = text.trim();
  if (value.toLowerCase() === "rr") return true;
  const chars = Array.from(value);
  if (chars.length !== 2) return false;
  const first = chars[0]!.toLocaleLowerCase("es");
  const second = chars[1]!.toLocaleLowerCase("es");
  return first === second && chars[0] !== chars[1];
}

function classify(items: FlipchartTextItem[]) {
  const real = items.filter((item) => item.text.trim().length > 0);
  if (!real.length) {
    return {
      title: [] as FlipchartTextItem[],
      body: [] as FlipchartTextItem[],
      words: [] as FlipchartWordGroup[],
      syllables: [] as string[],
    };
  }

  const storyTitle = real
    .filter((item) => item.fontStyle === "italic" && item.y < 165)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  let title: FlipchartTextItem[] = [];
  if (storyTitle.length) {
    title = storyTitle;
  } else {
    const pairCandidates = real
      .filter((item) => normalizedLetterPair(item.text) && item.y < 380)
      .sort((a, b) => b.fontSize - a.fontSize || a.y - b.y || a.x - b.x);
    if (pairCandidates[0]) title = [pairCandidates[0]];
  }

  const titleSet = new Set(title);
  const remainder = real.filter((item) => !titleSet.has(item));

  const syllableParts = new Set<FlipchartTextItem>();
  const syllables: Array<{ y: number; x: number; text: string }> = [];
  const accentStarts = remainder
    .filter(
      (item) =>
        item.y < 430 &&
        item.text.trim().length <= 2 &&
        Number(item.fontWeight ?? 400) >= 600,
    )
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const start of accentStarts) {
    if (syllableParts.has(start)) continue;
    const right = remainder
      .filter((candidate) => {
        if (candidate === start || syllableParts.has(candidate)) return false;
        if (Math.abs(candidate.y - start.y) > 9) return false;
        if (candidate.x < start.x) return false;
        const gap = candidate.x - (start.x + start.width);
        return gap >= -8 && gap <= 18 && candidate.text.trim().length <= 2;
      })
      .sort((a, b) => a.x - b.x)[0];
    if (!right) continue;
    syllableParts.add(start);
    syllableParts.add(right);
    syllables.push({
      y: Math.min(start.y, right.y),
      x: Math.min(start.x, right.x),
      text: (start.text + right.text).replace(/\s+/g, ""),
    });
  }

  const rest = remainder.filter((item) => !syllableParts.has(item));
  const lower = rest.filter(
    (item) =>
      item.y >= 420 &&
      item.fontSize >= 30 &&
      !/\s/.test(item.text.trim()),
  );
  const body = rest.filter((item) => !lower.includes(item));

  const words: FlipchartWordGroup[] = [];
  const sorted = [...lower].sort((a, b) => a.y - b.y || a.x - b.x);
  const rowGroups: FlipchartTextItem[][] = [];

  for (const item of sorted) {
    let row = rowGroups.find(
      (candidate) => candidate.length > 0 && Math.abs(candidate[0]!.y - item.y) < 18,
    );
    if (!row) {
      row = [];
      rowGroups.push(row);
    }
    row.push(item);
  }

  for (const row of rowGroups) {
    row.sort((a, b) => a.x - b.x);
    const clusters: FlipchartTextItem[][] = [];
    for (const item of row) {
      const current = clusters.at(-1);
      if (!current) {
        clusters.push([item]);
        continue;
      }
      const previous = current.at(-1)!;
      const gap = item.x - (previous.x + previous.width);
      if (gap >= -10 && gap <= 18) current.push(item);
      else clusters.push([item]);
    }

    for (const members of clusters) {
      const joined = members.map((member) => member.text).join("");
      if (!joined.trim()) continue;
      const first = members[0]!;
      const lead = members.length > 1 && first.text.length <= 2 ? first.text : "";
      words.push({
        fontSize: Math.max(...members.map((member) => member.fontSize)),
        parts: members.map((member) => member.text),
        lead,
        rest: lead ? joined.slice(lead.length) : joined,
        x: Math.min(...members.map((member) => member.x)),
        y: Math.min(...members.map((member) => member.y)),
        width:
          Math.max(...members.map((member) => member.x + member.width)) -
          Math.min(...members.map((member) => member.x)),
        height:
          Math.max(...members.map((member) => member.y + member.height)) -
          Math.min(...members.map((member) => member.y)),
        color: first.color,
      });
    }
  }

  return {
    title,
    body,
    words,
    syllables: syllables
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((item) => item.text),
  };
}

function deriveArtRegion(pageNumber: number, body: FlipchartTextItem[], words: FlipchartWordGroup[], hasDigitalText: boolean) {
  const frame = frameMap[String(pageNumber)] ?? { width: 1000, height: 1344, left: 0, right: 1000, bottom: 1344 };
  const h = Math.max(1, frame.height);
  if (!hasDigitalText) return { top: 8, bottom: 92, left: 8, right: 92 };

  const proseBottom = body.reduce((max, item) => Math.max(max, item.y + item.height), 0);
  const wordsTop = words.length ? Math.min(...words.map((word) => word.y)) : h * 0.9;
  const topPx = Math.max(h * 0.16, Math.min(h * 0.42, proseBottom || h * 0.2));
  const bottomPx = Math.max(topPx + h * 0.24, Math.min(h * 0.92, wordsTop - h * 0.025));

  return {
    top: (topPx / h) * 100,
    bottom: (bottomPx / h) * 100,
    left: 5,
    right: 95,
  };
}

export function flipchartArtSlots(pageNumber: number, lesson: number, wordCount: number) {
  const slots = [`flipchart-p${String(pageNumber).padStart(3, "0")}-hero`];
  if (lesson >= 1 && lesson <= 6) slots.push(`flipchart-p${String(pageNumber).padStart(3, "0")}-vowel-scene`);
  if (wordCount >= 3) slots.push(`flipchart-p${String(pageNumber).padStart(3, "0")}-words-strip`);
  return slots;
}

export function getNativeFlipchartPage(pageNumber: number): NativeFlipchartPage | null {
  const meta = PAGE_META.find((page) => page.flipchartPage === pageNumber);
  if (!meta) return null;
  const items = digitalPages[String(pageNumber)] ?? [];
  const { title, body, words, syllables } = classify(items);
  const hasDigitalText = items.some((item) => item.text.trim().length > 0);
  const art = pageArt(pageNumber, meta.lesson, words, body);
  return {
    flipchartPage: pageNumber,
    lesson: meta.lesson,
    title,
    body,
    words,
    syllables,
    artRegion: deriveArtRegion(pageNumber, body, words, hasDigitalText),
    slots: flipchartArtSlots(pageNumber, meta.lesson, words.length),
    art,
    compositionKind:
      pageNumber <= 2 ? "frontmatter" : art.length > 0 ? "art" : "typography-only",
    hasDigitalText,
  };
}

export const NATIVE_FLIPCHART_PAGES = PAGE_META.map((page) => getNativeFlipchartPage(page.flipchartPage)!).filter(Boolean);

export function flipchartSlotAssetSrc(slot: string) {
  return `/cartilla/art/faithful/flipchart/${slot}.webp`;
}
