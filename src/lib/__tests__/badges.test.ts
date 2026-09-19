import { describe, it, expect } from "vitest";
import { computeBadges } from "../badges";
import { lessons, VOWELS } from "@/lib/cartilla-content";
import type { SkillState as AdaptiveSkill } from "@/lib/adaptive";

function skillsWith(entries: Record<string, number>): Record<string, AdaptiveSkill> {
  const out: Record<string, AdaptiveSkill> = {};
  for (const [k, tier] of Object.entries(entries)) {
    out[k] = { tier: tier as 1 | 2 | 3, streak: 0 };
  }
  return out;
}

describe("computeBadges", () => {
  it("returns a badge per vowel plus the all-vowels and fast-star badges, none earned when there are no skills", () => {
    const badges = computeBadges({});
    const ids = badges.map((b) => b.id);
    for (const v of VOWELS) expect(ids).toContain(`vowel-${v}`);
    expect(ids).toContain("all-vowels");
    expect(ids).toContain("fast-star");
    expect(badges.every((b) => !b.earned)).toBe(true);
  });

  it("earns a vowel badge when its lesson reaches tier 3 (match or checkbox)", () => {
    const v = VOWELS[0];
    const lesson = lessons.find((l) => l.vowel === v)!;
    const badges = computeBadges(skillsWith({ [`${lesson.id}.match`]: 3 }));
    const badge = badges.find((b) => b.id === `vowel-${v}`);
    expect(badge?.earned).toBe(true);
  });

  it("earns the all-vowels trophy only when every vowel is mastered", () => {
    const partial = skillsWith(
      Object.fromEntries(
        VOWELS.slice(0, 4).map((v) => [`${lessons.find((l) => l.vowel === v)!.id}.match`, 3]),
      ),
    );
    expect(computeBadges(partial).find((b) => b.id === "all-vowels")?.earned).toBe(false);

    const all = skillsWith(
      Object.fromEntries(
        VOWELS.map((v) => [`${lessons.find((l) => l.vowel === v)!.id}.checkbox`, 3]),
      ),
    );
    expect(computeBadges(all).find((b) => b.id === "all-vowels")?.earned).toBe(true);
  });

  it("earns the fast-star badge when any FAST-test skill hits tier 3", () => {
    const badges = computeBadges(skillsWith({ [`fast-test.${VOWELS[0]}`]: 3 }));
    expect(badges.find((b) => b.id === "fast-star")?.earned).toBe(true);
  });
});
