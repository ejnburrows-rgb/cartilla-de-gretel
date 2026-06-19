// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns the fallback when the key is absent", () => {
    expect(storage.get("missing", "default")).toBe("default");
    expect(storage.get("missing", { a: 1 })).toEqual({ a: 1 });
  });

  it("round-trips JSON-serializable values", () => {
    storage.set("profile", { name: "Ana", streak: 4 });
    expect(storage.get("profile", null)).toEqual({ name: "Ana", streak: 4 });
  });

  it("returns the fallback (not a throw) when stored data is corrupt", () => {
    localStorage.setItem("broken", "{not valid json");
    expect(storage.get("broken", "safe")).toBe("safe");
  });

  it("overwrites a previous value", () => {
    storage.set("n", 1);
    storage.set("n", 2);
    expect(storage.get("n", 0)).toBe(2);
  });
});
