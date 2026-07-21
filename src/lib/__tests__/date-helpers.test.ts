import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startOfWeek } from "../date-helpers";

describe("startOfWeek", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return Monday when weekStartsOn is 1 (default) and date is mid-week", () => {
    // Wednesday, Sept 6, 2023
    const d = new Date(2023, 8, 6, 14, 30, 0); // Month is 0-indexed (8 = Sept)
    const result = startOfWeek(d);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(8); // Sept
    expect(result.getDate()).toBe(4); // Monday, Sept 4
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("should return Sunday when weekStartsOn is 1 (default) and date is Sunday (should go to previous Monday)", () => {
    // Sunday, Sept 10, 2023
    const d = new Date(2023, 8, 10, 10, 0, 0);
    const result = startOfWeek(d);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(4); // Monday, Sept 4
  });

  it("should return Sunday when weekStartsOn is 0 and date is Sunday (should stay on Sunday)", () => {
    // Sunday, Sept 10, 2023
    const d = new Date(2023, 8, 10, 10, 0, 0);
    const result = startOfWeek(d, 0);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(10); // Sunday, Sept 10
  });

  it("should return previous Sunday when weekStartsOn is 0 and date is mid-week", () => {
    // Wednesday, Sept 6, 2023
    const d = new Date(2023, 8, 6, 10, 0, 0);
    const result = startOfWeek(d, 0);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(3); // Sunday, Sept 3
  });

  it("should handle month boundaries correctly", () => {
    // Thursday, June 1, 2023. weekStartsOn = 1 (Monday)
    // Start of week should be Monday, May 29, 2023
    const d = new Date(2023, 5, 1, 10, 0, 0); // Month 5 is June
    const result = startOfWeek(d, 1);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(4); // May
    expect(result.getDate()).toBe(29);
  });

  it("should handle year boundaries correctly", () => {
    // Saturday, Jan 1, 2022. weekStartsOn = 1 (Monday)
    // Start of week should be Monday, Dec 27, 2021
    const d = new Date(2022, 0, 1, 10, 0, 0); // Month 0 is Jan
    const result = startOfWeek(d, 1);

    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth()).toBe(11); // Dec
    expect(result.getDate()).toBe(27);
  });

  it("should use the current date when no arguments are provided", () => {
    // Mock system time to Wednesday, Sept 6, 2023, 12:00:00
    const mockNow = new Date(2023, 8, 6, 12, 0, 0);
    vi.setSystemTime(mockNow);

    const result = startOfWeek();

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(8); // Sept
    expect(result.getDate()).toBe(4); // Monday, Sept 4
    expect(result.getHours()).toBe(0); // Should be start of day
  });
});
