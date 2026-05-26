import { useEffect, useState } from "react";
import { getStudentSession } from "@/lib/student-session";

export type RewardKind = "sticker" | "badge";

export type Reward = {
  id: string;
  kind: RewardKind;
  label: string;
  description: string;
  symbol: string;
  lessonNumber?: number;
  color: string;
};

export type EarnedReward = Reward & {
  earnedAt: string;
};

const KEY = "cartilla.rewards.v1";
const EVENT = "cartilla:rewards";

const STICKER_COLORS = [
  "#f9a8d4",
  "#fdba74",
  "#fde68a",
  "#86efac",
  "#93c5fd",
  "#c4b5fd",
];

const STICKER_SYMBOLS = [
  "sol",
  "flor",
  "luna",
  "estrella",
  "corazon",
  "nube",
  "libro",
  "lapiz",
  "casa",
  "campana",
  "diamante",
  "regalo",
];

const STICKER_GLYPHS = [
  "☀",
  "✿",
  "☾",
  "★",
  "♡",
  "☁",
  "▣",
  "✎",
  "⌂",
  "◌",
  "◆",
  "◇",
];

export const LESSON_STICKERS: Reward[] = Array.from({ length: 24 }, (_, index) => {
  const lessonNumber = index + 1;
  const symbolIndex = index % STICKER_SYMBOLS.length;
  return {
    id: `lesson-${lessonNumber}`,
    kind: "sticker",
    lessonNumber,
    label: `Leccion ${lessonNumber}`,
    description: `Completaste la leccion ${lessonNumber}.`,
    symbol: STICKER_GLYPHS[symbolIndex],
    color: STICKER_COLORS[index % STICKER_COLORS.length],
  };
});

export const BADGES: Reward[] = [
  {
    id: "badge-first-step",
    kind: "badge",
    label: "Primer paso",
    description: "Completa tu primera leccion.",
    symbol: "1",
    color: "#93c5fd",
  },
  {
    id: "badge-vowels",
    kind: "badge",
    label: "Vocales listas",
    description: "Completa las lecciones 1 a 6.",
    symbol: "AEI",
    color: "#fcd34d",
  },
  {
    id: "badge-half-book",
    kind: "badge",
    label: "Medio camino",
    description: "Completa 12 lecciones.",
    symbol: "12",
    color: "#86efac",
  },
  {
    id: "badge-reader",
    kind: "badge",
    label: "Cartilla completa",
    description: "Completa las 24 lecciones.",
    symbol: "24",
    color: "#c4b5fd",
  },
];

function activeKey() {
  const session = getStudentSession();
  return session ? `${KEY}.${session.classId}.${session.studentId}` : KEY;
}

function read(): EarnedReward[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(activeKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EarnedReward[];
    return Array.isArray(parsed) ? parsed.filter((reward) => typeof reward.id === "string") : [];
  } catch {
    return [];
  }
}

function write(rewards: EarnedReward[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(activeKey(), JSON.stringify(rewards));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore local persistence failures */
  }
}

function award(reward: Reward, current = read()): EarnedReward[] {
  if (current.some((earned) => earned.id === reward.id)) return current;
  return [...current, { ...reward, earnedAt: new Date().toISOString() }];
}

function badgesForCompletedLessons(completedLessons: number[]): Reward[] {
  const unique = new Set(completedLessons.filter((n) => Number.isFinite(n) && n > 0));
  const badges: Reward[] = [];
  if (unique.size >= 1) badges.push(BADGES[0]);
  if ([1, 2, 3, 4, 5, 6].every((n) => unique.has(n))) badges.push(BADGES[1]);
  if (unique.size >= 12) badges.push(BADGES[2]);
  if (unique.size >= 24) badges.push(BADGES[3]);
  return badges;
}

export function getEarnedRewards(): EarnedReward[] {
  return read();
}

export function getEarnedStickerIds(): Set<string> {
  return new Set(read().filter((reward) => reward.kind === "sticker").map((reward) => reward.id));
}

export function getEarnedBadgeIds(): Set<string> {
  return new Set(read().filter((reward) => reward.kind === "badge").map((reward) => reward.id));
}

export function earnReward(reward: Reward): EarnedReward[] {
  const next = award(reward);
  write(next);
  return next;
}

export function earnLessonReward(lessonNumber: number, completedLessons: number[] = [lessonNumber]) {
  const sticker = LESSON_STICKERS.find((item) => item.lessonNumber === lessonNumber);
  if (!sticker) return read();
  const completed = Array.from(new Set([...completedLessons, lessonNumber]));
  const next = badgesForCompletedLessons(completed).reduce(
    (acc, badge) => award(badge, acc),
    award(sticker),
  );
  write(next);
  return next;
}

export function clearEarnedRewards() {
  write([]);
}

export function useRewards() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((tick) => tick + 1);
    window.addEventListener(EVENT, h);
    window.addEventListener("storage", h);
    window.addEventListener("cartilla:student-session", h);
    return () => {
      window.removeEventListener(EVENT, h);
      window.removeEventListener("storage", h);
      window.removeEventListener("cartilla:student-session", h);
    };
  }, []);

  const earned = read();
  return {
    earned,
    earnedStickerIds: new Set(earned.filter((reward) => reward.kind === "sticker").map((reward) => reward.id)),
    earnedBadgeIds: new Set(earned.filter((reward) => reward.kind === "badge").map((reward) => reward.id)),
  };
}
