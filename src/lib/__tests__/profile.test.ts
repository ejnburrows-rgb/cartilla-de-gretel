/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_PROFILE,
  loadProfiles,
  getActiveProfileId,
  setActiveProfileId,
  getActiveProfile,
  addProfile,
  removeProfile,
} from "../profile";

beforeEach(() => localStorage.clear());

describe("profile", () => {
  it("falls back to the default profile when none are stored", () => {
    expect(loadProfiles()).toEqual([DEFAULT_PROFILE]);
    expect(getActiveProfileId()).toBe(DEFAULT_PROFILE.id);
    expect(getActiveProfile()).toEqual(DEFAULT_PROFILE);
  });

  it("adds a profile (trimming the name) and persists it", () => {
    const p = addProfile("  Sofía  ", "🦄");
    expect(p.name).toBe("Sofía");
    expect(p.emoji).toBe("🦄");
    const all = loadProfiles();
    expect(all.map((x) => x.id)).toContain(p.id);
  });

  it("uses a fallback name when the given name is blank", () => {
    expect(addProfile("   ").name).toBe("Estudiante");
  });

  it("switches the active profile", () => {
    const p = addProfile("Mateo");
    setActiveProfileId(p.id);
    expect(getActiveProfileId()).toBe(p.id);
    expect(getActiveProfile().id).toBe(p.id);
  });

  it("never removes the default profile", () => {
    removeProfile(DEFAULT_PROFILE.id);
    expect(loadProfiles().some((p) => p.id === DEFAULT_PROFILE.id)).toBe(true);
  });

  it("removing the active profile resets active back to default", () => {
    const p = addProfile("Diego");
    setActiveProfileId(p.id);
    removeProfile(p.id);
    expect(loadProfiles().some((x) => x.id === p.id)).toBe(false);
    expect(getActiveProfileId()).toBe(DEFAULT_PROFILE.id);
  });
});
