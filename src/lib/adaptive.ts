// Per-skill tier engine: tiers 1..3, promote after 2 in a row, demote on miss.
export type SkillState = { tier: 1 | 2 | 3; streak: number };

export const initialSkill = (): SkillState => ({ tier: 1, streak: 0 });

export function recordAnswer(
  state: SkillState,
  correct: boolean,
): { next: SkillState; change: "promoted" | "demoted" | "none" } {
  if (correct) {
    const streak = state.streak + 1;
    if (streak >= 2 && state.tier < 3) {
      return { next: { tier: (state.tier + 1) as 1 | 2 | 3, streak: 0 }, change: "promoted" };
    }
    return { next: { ...state, streak }, change: "none" };
  }
  if (state.tier > 1) {
    return { next: { tier: (state.tier - 1) as 1 | 2 | 3, streak: 0 }, change: "demoted" };
  }
  return { next: { ...state, streak: 0 }, change: "none" };
}

const STORAGE_KEY = "cartilla.skills.v1";

function activeKey() {
  try {
    const id = localStorage.getItem("cartilla.profile.active.v1") || "demo";
    return `${STORAGE_KEY}:${id}`;
  } catch {
    return STORAGE_KEY;
  }
}

export function loadSkills(): Record<string, SkillState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(activeKey()) || "{}");
  } catch {
    return {};
  }
}

export function saveSkills(skills: Record<string, SkillState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(activeKey(), JSON.stringify(skills));
}
