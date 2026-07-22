import { describe, it, expect, vi, afterEach } from "vitest";
import { schoolYearStart, startOfWeek } from "../date-helpers";

describe("date-helpers", () => {
  describe("schoolYearStart", () => {
    it("returns August 1st of the previous year for dates before August 1st", () => {
      // July 31st, 2023
      const date = new Date(2023, 6, 31);
      const result = schoolYearStart(date);
      expect(result).toEqual(new Date(2022, 7, 1, 0, 0, 0, 0));
    });

    it("returns August 1st of the current year for August 1st", () => {
      // August 1st, 2023
      const date = new Date(2023, 7, 1);
      const result = schoolYearStart(date);
      expect(result).toEqual(new Date(2023, 7, 1, 0, 0, 0, 0));
    });

    it("returns August 1st of the current year for dates after August 1st", () => {
      // December 15th, 2023
      const date = new Date(2023, 11, 15);
      const result = schoolYearStart(date);
      expect(result).toEqual(new Date(2023, 7, 1, 0, 0, 0, 0));
    });

    it("returns August 1st of the previous year for early next year (e.g., January 1st)", () => {
      // January 1st, 2024
      const date = new Date(2024, 0, 1);
      const result = schoolYearStart(date);
      expect(result).toEqual(new Date(2023, 7, 1, 0, 0, 0, 0));
    });

    it("handles the edge case of month index 7 correctly", () => {
      // Month index 7 is August.
      const augustDate = new Date(2023, 7, 10);
      const result = schoolYearStart(augustDate);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(7); // August
      expect(result.getDate()).toBe(1);
    });
  });

  describe("startOfWeek", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns the Monday of the week for a mid-week date (default weekStartsOn=1)", () => {
      const d = new Date(2023, 8, 6, 14, 30, 0); // Wed, Sept 6, 2023
      const result = startOfWeek(d);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(4); // Mon, Sept 4
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("goes back to the previous Monday when the date is a Sunday", () => {
      const d = new Date(2023, 8, 10, 10, 0, 0); // Sun, Sept 10, 2023
      expect(startOfWeek(d).getDate()).toBe(4); // Mon, Sept 4
    });

    it("keeps a Sunday when weekStartsOn=0", () => {
      const d = new Date(2023, 8, 10, 10, 0, 0);
      expect(startOfWeek(d, 0).getDate()).toBe(10);
    });

    it("returns the previous Sunday for a mid-week date when weekStartsOn=0", () => {
      const d = new Date(2023, 8, 6, 10, 0, 0);
      expect(startOfWeek(d, 0).getDate()).toBe(3); // Sun, Sept 3
    });

    it("handles month boundaries", () => {
      const d = new Date(2023, 5, 1, 10, 0, 0); // Thu, June 1, 2023
      const result = startOfWeek(d, 1);
      expect(result.getMonth()).toBe(4); // May
      expect(result.getDate()).toBe(29);
    });

    it("handles year boundaries", () => {
      const d = new Date(2022, 0, 1, 10, 0, 0); // Sat, Jan 1, 2022
      const result = startOfWeek(d, 1);
      expect(result.getFullYear()).toBe(2021);
      expect(result.getMonth()).toBe(11); // Dec
      expect(result.getDate()).toBe(27);
    });

    it("uses the current date when no argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 8, 6, 12, 0, 0)); // Wed, Sept 6, 2023
      const result = startOfWeek();
      expect(result.getDate()).toBe(4); // Mon, Sept 4
      expect(result.getHours()).toBe(0);
    });
  });
});
