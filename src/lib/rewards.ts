import { useEffect, useState } from "react";
import { recordEvent } from "./student-session";

export interface Sticker {
  lessonId: number;
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  condition: string;
  isUnlocked: (completedIds: number[], stats: any) => boolean;
}

// 24 beautifully designed themed stickers (one per lesson)
export const STICKERS: Sticker[] = [
  { lessonId: 1, id: "butterfly", name: "Mariposa MÃ¡gica", emoji: "ðŸ¦‹", color: "hsl(280, 85%, 65%)", description: "Â¡Volando alto en el inicio de tu lectura!" },
  { lessonId: 2, id: "bear", name: "Oso Curioso", emoji: "ðŸ»", color: "hsl(35, 75%, 50%)", description: "Â¡Abrazo peludo por dominar la vocal O!" },
  { lessonId: 3, id: "bee", name: "Abeja Alegre", emoji: "ðŸ", color: "hsl(50, 95%, 55%)", description: "Â¡Zumbando de felicidad con la vocal A!" },
  { lessonId: 4, id: "star", name: "Estrella Brillante", emoji: "â­", color: "hsl(45, 100%, 60%)", description: "Â¡Tu lectura brilla con la vocal E!" },
  { lessonId: 5, id: "iguana", name: "Iguana Inteligente", emoji: "ðŸ¦Ž", color: "hsl(100, 75%, 45%)", description: "Â¡DeslizÃ¡ndote genial por la vocal I!" },
  { lessonId: 6, id: "unicorn", name: "Unicornio SoÃ±ador", emoji: "ðŸ¦„", color: "hsl(300, 80%, 70%)", description: "Â¡Magia pura lograda en la vocal U!" },
  { lessonId: 7, id: "monkey", name: "Mono SaltarÃ­n", emoji: "ðŸ’", color: "hsl(25, 70%, 55%)", description: "Â¡Saltos de alegrÃ­a aprendiendo la letra M!" },
  { lessonId: 8, id: "puppy", name: "Perrito JuguetÃ³n", emoji: "ðŸ¶", color: "hsl(30, 80%, 60%)", description: "Â¡Guau, increÃ­ble avance con la letra P!" },
  { lessonId: 9, id: "frog", name: "Ranita Cantarina", emoji: "ðŸ¸", color: "hsl(120, 70%, 45%)", description: "Â¡Saltando a la fama con la letra S!" },
  { lessonId: 10, id: "turtle", name: "Tortuga Veloz", emoji: "ðŸ¢", color: "hsl(110, 60%, 50%)", description: "Â¡Paso a paso ganas con la letra T!" },
  { lessonId: 11, id: "dolphin", name: "DelfÃ­n Sonriente", emoji: "ðŸ¬", color: "hsl(190, 85%, 55%)", description: "Â¡Navegando feliz en la letra D!" },
  { lessonId: 12, id: "lion", name: "LeÃ³n Valiente", emoji: "ðŸ¦", color: "hsl(40, 85%, 55%)", description: "Â¡Ruge con fuerza leyendo la letra L!" },
  { lessonId: 13, id: "koala", name: "Koala Lector", emoji: "ðŸ¨", color: "hsl(200, 15%, 65%)", description: "Â¡Abrazando los libros de la letra N!" },
  { lessonId: 14, id: "bunny", name: "Conejo SaltarÃ­n", emoji: "ðŸ°", color: "hsl(320, 60%, 80%)", description: "Â¡Orejas arriba por dominar la letra B!" },
  { lessonId: 15, id: "fox", name: "Zorrito Veloz", emoji: "ðŸ¦Š", color: "hsl(20, 90%, 55%)", description: "Â¡Astucia pura leyendo la letra V!" },
  { lessonId: 16, id: "dino", name: "Dinosaurio Fuerte", emoji: "ðŸ¦–", color: "hsl(130, 65%, 45%)", description: "Â¡Lectura gigante con la letra R!" },
  { lessonId: 17, id: "cat", name: "Gatito Artista", emoji: "ðŸ±", color: "hsl(35, 80%, 65%)", description: "Â¡Miau, espectacular con la letra F!" },
  { lessonId: 18, id: "chick", name: "Pollito Lector", emoji: "ðŸ¥", color: "hsl(55, 90%, 60%)", description: "Â¡PÃ­o pÃ­o de orgullo con la letra G!" },
  { lessonId: 19, id: "octopus", name: "Pulpo de Ideas", emoji: "ðŸ™", color: "hsl(340, 80%, 65%)", description: "Â¡Ocho brazos para aplaudir la letra J!" },
  { lessonId: 20, id: "owl", name: "BÃºho Sabio", emoji: "ðŸ¦‰", color: "hsl(28, 50%, 45%)", description: "Â¡SabidurÃ­a total al conquistar la letra C!" },
  { lessonId: 21, id: "panda", name: "Panda CariÃ±oso", emoji: "ðŸ¼", color: "hsl(0, 0%, 20%)", description: "Â¡SÃºper tranquilo leyendo la letra Y!" },
  { lessonId: 22, id: "zebra", name: "Cebra Elegante", emoji: "ðŸ¦“", color: "hsl(0, 0%, 40%)", description: "Â¡Rayas de victoria con la letra Z!" },
  { lessonId: 23, id: "penguin", name: "PingÃ¼ino Feliz", emoji: "ðŸ§", color: "hsl(200, 80%, 40%)", description: "Â¡DeslizÃ¡ndote al Ã©xito en el repaso final!" },
  { lessonId: 24, id: "dragon", name: "DragÃ³n Dorado", emoji: "ðŸ‰", color: "hsl(45, 90%, 50%)", description: "Â¡Fuego sagrado de la lectura! Â¡Cartilla completada!" },
];

// Milestone badges
export const BADGES: Badge[] = [
  {
    id: "first_step",
    name: "Primer Paso",
    emoji: "ðŸŽˆ",
    color: "hsl(350, 85%, 65%)",
    description: "Â¡Completaste tu primera lecciÃ³n interactiva!",
    condition: "1 lecciÃ³n completada",
    isUnlocked: (completed) => completed.length >= 1,
  },
  {
    id: "syllable_explorer",
    name: "Explorador de SÃ­labas",
    emoji: "ðŸ“š",
    color: "hsl(150, 75%, 45%)",
    description: "Â¡Cinco lecciones dominadas con orgullo!",
    condition: "5 lecciones completadas",
    isUnlocked: (completed) => completed.length >= 5,
  },
  {
    id: "super_champion",
    name: "SÃºper CampeÃ³n",
    emoji: "ðŸ†",
    color: "hsl(48, 95%, 55%)",
    description: "Â¡Llegaste a 10 lecciones! Â¡Eres genial!",
    condition: "10 lecciones completadas",
    isUnlocked: (completed) => completed.length >= 10,
  },
  {
    id: "cartilla_sage",
    name: "Sabio de la Cartilla",
    emoji: "ðŸ¦‰",
    color: "hsl(28, 70%, 50%)",
    description: "Â¡15 lecciones completas! Â¡CuÃ¡nto sabes!",
    condition: "15 lecciones completadas",
    isUnlocked: (completed) => completed.length >= 15,
  },
  {
    id: "grand_master",
    name: "Corona de Oro",
    emoji: "ðŸ‘‘",
    color: "hsl(43, 100%, 50%)",
    description: "Â¡Conquistaste las 24 lecciones! Â¡Eres un lector maestro!",
    condition: "Las 24 lecciones completadas",
    isUnlocked: (completed) => completed.length >= 24,
  },
  {
    id: "perfect_score",
    name: "Estrella Perfecta",
    emoji: "âœ¨",
    color: "hsl(190, 95%, 60%)",
    description: "Â¡Lograste un 100% de acierto en cualquier ejercicio!",
    condition: "Acierto perfecto en algÃºn ejercicio",
    isUnlocked: (_, stats) => {
      if (!stats) return false;
      return Object.values(stats).some((lesson: any) =>
        Object.values(lesson).some((ex: any) => ex.attempts > 0 && ex.hits === ex.attempts)
      );
    },
  },
  {
    id: "active_streak",
    name: "Racha Ardiente",
    emoji: "ðŸ”¥",
    color: "hsl(15, 95%, 55%)",
    description: "Â¡Mantuviste tu racha de lectura activa!",
    condition: "Racha activa",
    isUnlocked: (_, stats) => {
      // In the absence of a complete streak tracker, we can unlock this if they have done exercises in at least 2 distinct runs/sessions.
      if (!stats) return false;
      const count = Object.values(stats).reduce((acc: number, lesson: any) => {
        return acc + Object.values(lesson).reduce((acc2: number, ex: any) => acc2 + (ex.completedRounds || 0), 0);
      }, 0);
      return count >= 2;
    },
  },
];

// Local persist functions
const STICKERS_KEY = "cartilla.rewards.stickers.v1";
const BADGES_KEY = "cartilla.rewards.badges.v1";

export function getEarnedStickers(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STICKERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEarnedSticker(lessonId: number) {
  if (typeof window === "undefined") return;
  try {
    const current = getEarnedStickers();
      if (!current.includes(lessonId)) {
      const next = [...current, lessonId].sort((a, b) => a - b);
      localStorage.setItem(STICKERS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("cartilla:rewards-changed"));
      recordEvent({
        lessonId: String(lessonId),
        kind: "badge",
        meta: { stickerLessonId: lessonId, name: STICKERS.find(s => s.lessonId === lessonId)?.name },
      });
    }
  } catch {
    /* ignore */
  }
}

export function getEarnedBadges(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEarnedBadge(badgeId: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getEarnedBadges();
      if (!current.includes(badgeId)) {
      const next = [...current, badgeId];
      localStorage.setItem(BADGES_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("cartilla:rewards-changed"));
      recordEvent({
        kind: "badge",
        lessonId: "global",
        meta: { badgeId, name: BADGES.find(b => b.id === badgeId)?.name },
      });
    }
  } catch {
    /* ignore */
  }
}

// Aliases used by mi-progreso.tsx (and any other consumer expecting this naming)
export const getUnlockedStickers = getEarnedStickers;
export const getUnlockedBadges = getEarnedBadges;

export function checkAndAwardRewards(completedLessons: number[], localStats: any) {
  // 1. Award stickers for completed lessons
  completedLessons.forEach((id) => {
    saveEarnedSticker(id);
  });

  // 2. Award badges based on conditions
  BADGES.forEach((badge) => {
    if (badge.isUnlocked(completedLessons, localStats)) {
      saveEarnedBadge(badge.id);
    }
  });
}

// React Hook
export function useRewards(completedLessons: number[] = [], localStats: any = null) {
  const [stickers, setStickers] = useState<number[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    // Run an initial check and award cycle
    checkAndAwardRewards(completedLessons, localStats);

    const load = () => {
      setStickers(getEarnedStickers());
      setBadges(getEarnedBadges());
    };

    load();

    const h = () => {
      load();
    };

    window.addEventListener("storage", h);
    window.addEventListener("cartilla:rewards-changed", h);

    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("cartilla:rewards-changed", h);
    };
  }, [completedLessons.length, JSON.stringify(localStats)]);

  return {
    stickers,
    badges,
    allStickers: STICKERS,
    allBadges: BADGES,
    claimSticker: saveEarnedSticker,
    claimBadge: saveEarnedBadge,
  };
}
