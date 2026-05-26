// streak-milestones.ts — streak threshold celebrations.
// Streak engine math lives in src/lib/streak-engine.ts (other lane).
// This file only defines what to celebrate and how.

import type { BadgeId } from "./badge-catalog";

export type StreakMilestone = {
	days: number;
	badgeId: BadgeId;
	messageEs: string;
	messageEn: string;
	confetti: boolean;
	sound: "chime" | "cheer" | "fanfare";
};

export const STREAK_MILESTONES: StreakMilestone[] = [
	{ days: 3,  badgeId: "streak-3",  messageEs: "\u00a13 d\u00edas seguidos! Sigue as\u00ed.",          messageEn: "3 days in a row! Keep it up.",          confetti: true,  sound: "chime" },
	{ days: 7,  badgeId: "streak-7",  messageEs: "\u00a1Una semana entera! Eres incre\u00edble.",         messageEn: "A whole week! You're amazing.",         confetti: true,  sound: "cheer" },
	{ days: 14, badgeId: "streak-14", messageEs: "\u00a1Dos semanas! Sigues brillando.",                  messageEn: "Two weeks! You keep shining.",          confetti: true,  sound: "cheer" },
	{ days: 30, badgeId: "streak-30", messageEs: "\u00a1Un mes entero! Eres una estrella de la lectura.", messageEn: "A whole month! You're a reading star.", confetti: true,  sound: "fanfare" },
];

export function milestoneForDays(days: number): StreakMilestone | null {
	return STREAK_MILESTONES.find((m) => m.days === days) ?? null;
}

export function nextMilestone(currentDays: number): StreakMilestone | null {
	for (const m of STREAK_MILESTONES) {
		if (m.days > currentDays) return m;
	}
	return null;
}
