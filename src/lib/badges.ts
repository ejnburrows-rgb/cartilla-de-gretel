import { loadSkills, type SkillState } from "@/lib/adaptive";
import { lessons, VOWELS } from "@/lib/cartilla-content";

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  hint: string;
};

export function computeBadges(skills?: Record<string, SkillState>): Badge[] {
  const s = skills ?? loadSkills();
  const badges: Badge[] = [];

  for (const v of VOWELS) {
    const lesson = lessons.find((l) => l.vowel === v);
    if (!lesson) continue;
    const m = s[`${lesson.id}.match`]?.tier ?? 0;
    const c = s[`${lesson.id}.checkbox`]?.tier ?? 0;
    badges.push({
      id: `vowel-${v}`,
      label: `Vocal ${v}`,
      emoji: { a: "🐝", e: "👂", i: "🛖", o: "🐻", u: "🦄" }[v] ?? "⭐",
      earned: m >= 3 || c >= 3,
      hint: "Llega al nivel 3 en la lección",
    });
  }

  badges.push({
    id: "all-vowels",
    label: "Maestra/o de vocales",
    emoji: "🏆",
    earned: badges.filter((b) => b.id.startsWith("vowel-")).every((b) => b.earned),
    hint: "Domina las 5 vocales",
  });

  badges.push({
    id: "fast-star",
    label: "Estrella FAST",
    emoji: "⚡",
    earned: VOWELS.some((v) => (s[`fast-test.${v}`]?.tier ?? 0) >= 3),
    hint: "Brilla en el Modo FAST",
  });

  return badges;
}
