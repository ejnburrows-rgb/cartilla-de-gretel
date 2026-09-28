import flipchartData from "@/data/teacher-flipchart.json";
import firstPages from "@/data/flipchart-text-3-22.json";
import middlePages from "@/data/flipchart-text-23-42.json";
import lastPages from "@/data/flipchart-text-43-62.json";
import frames from "@/data/flipchart-frames.json";
import faithfulManifest from "../../public/cartilla/art/faithful/manifest.json";

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
  artRegion: { top: number; bottom: number; left: number; right: number };
  slots: string[];
  art: Array<{ src: string; word: string }>;
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

function normalizeWord(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-zñü0-9]+/g, "");
}

function lessonArtFallback(lesson: number) {
  if (lesson === 1) {
    const starter = new Set(["avion", "escoba", "iman", "olla", "una"]);
    return FAITHFUL.filter((entry) => starter.has(normalizeWord(entry.word ?? entry.slug ?? "")));
  }
  const vowelDir: Record<number, string> = {
    2: "/vocal-o/",
    3: "/vocal-a/",
    4: "/vocal-e/",
    5: "/vocal-i/",
    6: "/vocal-u/",
  };
  const dir = vowelDir[lesson];
  if (dir) return FAITHFUL.filter((entry) => entry.src.includes(dir));
  return FAITHFUL.filter((entry) => entry.lessonNumber === lesson);
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

  const exactPage = FAITHFUL.filter(
    (entry) => typeof entry.sourceFlipchartPage === "number" && entry.sourceFlipchartPage === flipchartPage,
  );
  const textMatches = FAITHFUL.filter((entry) => {
    const word = normalizeWord(entry.word ?? entry.slug ?? "");
    return word && tokens.has(word);
  });

  const unique = new Map<string, FaithfulManifestEntry>();
  for (const entry of [...exactPage, ...textMatches, ...lessonArtFallback(lesson)]) {
    if (!entry.src || unique.has(entry.src)) continue;
    unique.set(entry.src, entry);
    if (unique.size >= 8) break;
  }
  return [...unique.values()].map((entry) => ({
    src: entry.src,
    word: entry.word ?? entry.slug ?? "Ilustración",
  }));
}

function classify(items: FlipchartTextItem[]) {
  const real = items.filter((item) => item.text.trim().length > 0);
  if (!real.length) return { title: [] as FlipchartTextItem[], body: [] as FlipchartTextItem[], words: [] as FlipchartWordGroup[] };

  const maxFs = Math.max(...real.map((item) => item.fontSize));
  const title = real.filter((item) => item.fontSize >= maxFs * 0.9 && item.y < 200);
  const rest = real.filter((item) => !title.includes(item));
  const lower = rest.filter((item) => item.y >= 420 && item.fontSize >= 30);
  const body = rest.filter((item) => !lower.includes(item));

  const words: FlipchartWordGroup[] = [];
  const sorted = [...lower].sort((a, b) => a.y - b.y || a.x - b.x);
  const used = new Set<FlipchartTextItem>();

  for (const item of sorted) {
    if (used.has(item)) continue;
    const members = [item];
    used.add(item);
    for (const other of sorted) {
      if (used.has(other)) continue;
      const sameRow =
        Math.abs(other.y - item.y) < 55 &&
        other.x >= item.x - 20 &&
        other.x <= item.x + 320;
      if (sameRow) {
        members.push(other);
        used.add(other);
      }
    }
    members.sort((a, b) => a.x - b.x);
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
      width: Math.max(...members.map((member) => member.x + member.width)) - Math.min(...members.map((member) => member.x)),
      height: Math.max(...members.map((member) => member.y + member.height)) - Math.min(...members.map((member) => member.y)),
      color: first.color,
    });
  }

  return { title, body, words };
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
  const { title, body, words } = classify(items);
  const hasDigitalText = items.some((item) => item.text.trim().length > 0);
  return {
    flipchartPage: pageNumber,
    lesson: meta.lesson,
    title,
    body,
    words,
    artRegion: deriveArtRegion(pageNumber, body, words, hasDigitalText),
    slots: flipchartArtSlots(pageNumber, meta.lesson, words.length),
    art: pageArt(pageNumber, meta.lesson, words, body),
    hasDigitalText,
  };
}

export const NATIVE_FLIPCHART_PAGES = PAGE_META.map((page) => getNativeFlipchartPage(page.flipchartPage)!).filter(Boolean);

export function flipchartSlotAssetSrc(slot: string) {
  return `/cartilla/art/faithful/flipchart/${slot}.webp`;
}
