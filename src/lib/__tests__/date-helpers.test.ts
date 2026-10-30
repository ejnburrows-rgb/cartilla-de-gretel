import { describe, it, expect, vi, afterEach } from "vitest";
import { schoolYearStart, startOfWeek, startOfDay, endOfWeek, daysBetween, isSameDay, isConsecutiveDay, schoolYearEnd, weekOfSchoolYear, formatDateEs, formatDateEn, relativeDateEs, relativeDateEn } from "../date-helpers";

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


  describe("startOfDay", () => {
    it("sets time to 00:00:00.000", () => {
      const d = new Date(2023, 8, 6, 14, 30, 0);
      const result = startOfDay(d);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(6);
    });
  });

  describe("endOfWeek", () => {
    it("returns Sunday 23:59:59.999 for mid-week date", () => {
      const d = new Date(2023, 8, 6, 14, 30, 0); // Wed, Sept 6, 2023
      const result = endOfWeek(d);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(10); // Sun, Sept 10
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("daysBetween", () => {
    it("calculates exact number of days ignoring time", () => {
      const d1 = new Date(2023, 8, 6, 14, 30, 0);
      const d2 = new Date(2023, 8, 10, 10, 0, 0);
      expect(daysBetween(d1, d2)).toBe(4);
    });
    it("returns negative if b is before a", () => {
      const d1 = new Date(2023, 8, 10, 10, 0, 0);
      const d2 = new Date(2023, 8, 6, 14, 30, 0);
      expect(daysBetween(d1, d2)).toBe(-4);
    });
    it("returns 0 for same day", () => {
      const d1 = new Date(2023, 8, 6, 10, 0, 0);
      const d2 = new Date(2023, 8, 6, 14, 30, 0);
      expect(daysBetween(d1, d2)).toBe(0);
    });
  });

  describe("isSameDay", () => {
    it("returns true for same day with different times", () => {
      const d1 = new Date(2023, 8, 6, 10, 0, 0);
      const d2 = new Date(2023, 8, 6, 14, 30, 0);
      expect(isSameDay(d1, d2)).toBe(true);
    });
    it("returns false for different days", () => {
      const d1 = new Date(2023, 8, 6, 10, 0, 0);
      const d2 = new Date(2023, 8, 7, 10, 0, 0);
      expect(isSameDay(d1, d2)).toBe(false);
    });
  });

  describe("isConsecutiveDay", () => {
    it("returns true for exactly 1 day apart forward", () => {
      const d1 = new Date(2023, 8, 6, 10, 0, 0);
      const d2 = new Date(2023, 8, 7, 10, 0, 0);
      expect(isConsecutiveDay(d1, d2)).toBe(true);
    });
    it("returns false for same day", () => {
      const d1 = new Date(2023, 8, 6, 10, 0, 0);
      const d2 = new Date(2023, 8, 6, 14, 30, 0);
      expect(isConsecutiveDay(d1, d2)).toBe(false);
    });
    it("returns false for 1 day backward", () => {
      const d1 = new Date(2023, 8, 7, 10, 0, 0);
      const d2 = new Date(2023, 8, 6, 10, 0, 0);
      expect(isConsecutiveDay(d1, d2)).toBe(false);
    });
  });

  describe("schoolYearEnd", () => {
    it("returns July 31st of next year for August dates", () => {
      const d = new Date(2023, 7, 1); // Aug 1, 2023
      const result = schoolYearEnd(d);
      expect(result).toEqual(new Date(2024, 6, 31, 23, 59, 59, 999));
    });
    it("returns July 31st of current year for July dates", () => {
      const d = new Date(2023, 6, 1); // Jul 1, 2023
      const result = schoolYearEnd(d);
      expect(result).toEqual(new Date(2023, 6, 31, 23, 59, 59, 999));
    });
  });

  describe("weekOfSchoolYear", () => {
    it("returns 1 for Aug 1st", () => {
      const d = new Date(2023, 7, 1); // Aug 1
      expect(weekOfSchoolYear(d)).toBe(1);
    });
    it("returns 2 for Aug 8th", () => {
      const d = new Date(2023, 7, 8); // Aug 8
      expect(weekOfSchoolYear(d)).toBe(2);
    });
  });

  describe("formatDateEs", () => {
    it("formats dates correctly", () => {
      const d = new Date(2024, 0, 10); // Jan 10, 2024
      expect(formatDateEs(d)).toBe("10 de enero de 2024");
    });
  });

  describe("formatDateEn", () => {
    it("formats dates correctly", () => {
      const d = new Date(2024, 0, 10); // Jan 10, 2024
      expect(formatDateEn(d)).toBe("January 10, 2024");
    });
  });

  describe("relativeDateEs", () => {
    it("returns hoy for diff 0", () => {
      const now = new Date(2024, 0, 10);
      const d = new Date(2024, 0, 10);
      expect(relativeDateEs(d, now)).toBe("hoy");
    });
    it("returns ayer for diff 1", () => {
      const now = new Date(2024, 0, 10);
      const d = new Date(2024, 0, 9);
      expect(relativeDateEs(d, now)).toBe("ayer");
    });
    it("returns hace X días for diff 3", () => {
      const now = new Date(2024, 0, 10);
      const d = new Date(2024, 0, 7);
      expect(relativeDateEs(d, now)).toBe("hace 3 días");
    });
    it("returns formatted date for diff 10", () => {
      const now = new Date(2024, 0, 15);
      const d = new Date(2024, 0, 5);
      expect(relativeDateEs(d, now)).toBe("5 de enero de 2024");
    });
  });

  describe("relativeDateEn", () => {
    it("returns today for diff 0", () => {
      const now = new Date(2024, 0, 10);
      const d = new Date(2024, 0, 10);
      expect(relativeDateEn(d, now)).toBe("today");
    });
    it("returns yesterday for diff 1", () => {
      const now = new Date(2024, 0, 10);
      const d = new Date(2024, 0, 9);
      expect(relativeDateEn(d, now)).toBe("yesterday");
    });
    it("returns X days ago for diff 3", () => {
      const now = new Date(2024, 0, 10);
      const d = new Date(2024, 0, 7);
      expect(relativeDateEn(d, now)).toBe("3 days ago");
    });
    it("returns formatted date for diff 10", () => {
      const now = new Date(2024, 0, 15);
      const d = new Date(2024, 0, 5);
      expect(relativeDateEn(d, now)).toBe("January 5, 2024");
    });
  });
});
