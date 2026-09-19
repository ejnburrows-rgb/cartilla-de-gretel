/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { initialSkill, recordAnswer, loadSkills, saveSkills } from "../adaptive";

beforeEach(() => localStorage.clear());

describe("adaptive tier engine", () => {
  it("starts at tier 1 with no streak", () => {
    expect(initialSkill()).toEqual({ tier: 1, streak: 0 });
  });

  it("promotes after two correct in a row and resets the streak", () => {
    const one = recordAnswer(initialSkill(), true);
    expect(one).toEqual({ next: { tier: 1, streak: 1 }, change: "none" });
    const two = recordAnswer(one.next, true);
    expect(two).toEqual({ next: { tier: 2, streak: 0 }, change: "promoted" });
  });

  it("never promotes past tier 3", () => {
    const atThree = { tier: 3 as const, streak: 1 };
    const r = recordAnswer(atThree, true);
    expect(r.change).toBe("none");
    expect(r.next.tier).toBe(3);
    expect(r.next.streak).toBe(2);
  });

  it("demotes on a miss above tier 1", () => {
    const r = recordAnswer({ tier: 2, streak: 1 }, false);
    expect(r).toEqual({ next: { tier: 1, streak: 0 }, change: "demoted" });
  });

  it("at tier 1 a miss only resets the streak (no demotion)", () => {
    const r = recordAnswer({ tier: 1, streak: 1 }, false);
    expect(r).toEqual({ next: { tier: 1, streak: 0 }, change: "none" });
  });

  it("round-trips skills through save/load", () => {
    saveSkills({ "l1.match": { tier: 3, streak: 0 } });
    expect(loadSkills()).toEqual({ "l1.match": { tier: 3, streak: 0 } });
  });

  it("returns {} when nothing is stored", () => {
    expect(loadSkills()).toEqual({});
  });
});
