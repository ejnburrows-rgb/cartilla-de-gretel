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


  describe("startOfDay", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("resets hours, minutes, seconds, and milliseconds to zero for a given date", () => {
      const d = new Date(2023, 8, 6, 14, 30, 45, 123);
      const result = startOfDay(d);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(6);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("uses the current date when no argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 8, 6, 12, 0, 0));
      const result = startOfDay();
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(6);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });


  describe("endOfWeek", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns the Sunday at 23:59:59.999 for a mid-week date (default weekStartsOn=1)", () => {
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

    it("returns the Saturday at 23:59:59.999 for a mid-week date when weekStartsOn=0", () => {
      const d = new Date(2023, 8, 6, 14, 30, 0); // Wed, Sept 6, 2023
      const result = endOfWeek(d, 0);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(9); // Sat, Sept 9
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it("handles month boundaries", () => {
      const d = new Date(2023, 7, 30, 10, 0, 0); // Wed, Aug 30, 2023
      const result = endOfWeek(d, 1);
      expect(result.getMonth()).toBe(8); // Sept
      expect(result.getDate()).toBe(3); // Sun, Sept 3
    });

    it("handles year boundaries", () => {
      const d = new Date(2023, 11, 28, 10, 0, 0); // Thu, Dec 28, 2023
      const result = endOfWeek(d, 1);
      expect(result.getFullYear()).toBe(2023); // 2023-12-31 is Sunday
      expect(result.getMonth()).toBe(11); // Dec
      expect(result.getDate()).toBe(31);
    });

    it("uses the current date when no argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 8, 6, 12, 0, 0)); // Wed, Sept 6, 2023
      const result = endOfWeek();
      expect(result.getDate()).toBe(10); // Sun, Sept 10
      expect(result.getHours()).toBe(23);
    });
  });


  describe("daysBetween", () => {
    it("returns 0 for the same day at different times", () => {
      const a = new Date(2023, 8, 6, 10, 0, 0);
      const b = new Date(2023, 8, 6, 18, 0, 0);
      expect(daysBetween(a, b)).toBe(0);
    });

    it("returns 1 for consecutive days", () => {
      const a = new Date(2023, 8, 6, 10, 0, 0);
      const b = new Date(2023, 8, 7, 10, 0, 0);
      expect(daysBetween(a, b)).toBe(1);
    });

    it("returns negative values when the first date is later", () => {
      const a = new Date(2023, 8, 7, 10, 0, 0);
      const b = new Date(2023, 8, 6, 10, 0, 0);
      expect(daysBetween(a, b)).toBe(-1);
    });

    it("handles month boundaries correctly", () => {
      const a = new Date(2023, 7, 31, 10, 0, 0); // Aug 31
      const b = new Date(2023, 8, 1, 10, 0, 0);  // Sept 1
      expect(daysBetween(a, b)).toBe(1);
    });

    it("handles year boundaries correctly", () => {
      const a = new Date(2023, 11, 31, 10, 0, 0); // Dec 31, 2023
      const b = new Date(2024, 0, 1, 10, 0, 0);   // Jan 1, 2024
      expect(daysBetween(a, b)).toBe(1);
    });

    it("handles daylight saving time transitions safely", () => {
      // Create dates around a typical DST transition in some timezones (e.g. spring forward)
      // Since date-helpers uses startOfDay (resetting hours to 0), and then Math.round,
      // a 23-hour day should still round to 1.
      const a = new Date("2023-03-11T12:00:00Z");
      const b = new Date("2023-03-12T12:00:00Z");
      expect(daysBetween(a, b)).toBe(1);
    });
  });


  describe("isSameDay", () => {
    it("returns true for the exact same date", () => {
      const a = new Date(2023, 8, 6, 10, 0, 0);
      const b = new Date(2023, 8, 6, 10, 0, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it("returns true for the same date at different times", () => {
      const a = new Date(2023, 8, 6, 1, 0, 0);
      const b = new Date(2023, 8, 6, 23, 59, 59);
      expect(isSameDay(a, b)).toBe(true);
    });

    it("returns false for different dates", () => {
      const a = new Date(2023, 8, 6, 23, 59, 59);
      const b = new Date(2023, 8, 7, 0, 0, 1);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe("isConsecutiveDay", () => {
    it("returns true when next is exactly one day after prev", () => {
      const prev = new Date(2023, 8, 6, 10, 0, 0);
      const next = new Date(2023, 8, 7, 10, 0, 0);
      expect(isConsecutiveDay(prev, next)).toBe(true);
    });

    it("returns true when next is one day after prev at different times", () => {
      const prev = new Date(2023, 8, 6, 23, 59, 59);
      const next = new Date(2023, 8, 7, 0, 0, 1);
      expect(isConsecutiveDay(prev, next)).toBe(true);
    });

    it("returns false for the same day", () => {
      const prev = new Date(2023, 8, 6, 10, 0, 0);
      const next = new Date(2023, 8, 6, 18, 0, 0);
      expect(isConsecutiveDay(prev, next)).toBe(false);
    });

    it("returns false when next is before prev", () => {
      const prev = new Date(2023, 8, 7, 10, 0, 0);
      const next = new Date(2023, 8, 6, 10, 0, 0);
      expect(isConsecutiveDay(prev, next)).toBe(false);
    });

    it("returns false when days are separated by more than 1 day", () => {
      const prev = new Date(2023, 8, 5, 10, 0, 0);
      const next = new Date(2023, 8, 7, 10, 0, 0);
      expect(isConsecutiveDay(prev, next)).toBe(false);
    });
  });

  describe("schoolYearEnd", () => {
    it("returns July 31st of the next year for dates after August 1st", () => {
      const date = new Date(2023, 11, 15); // Dec 15, 2023
      const result = schoolYearEnd(date);
      expect(result).toEqual(new Date(2024, 6, 31, 23, 59, 59, 999));
    });

    it("returns July 31st of the current year for dates before August 1st", () => {
      const date = new Date(2024, 0, 1); // Jan 1, 2024
      const result = schoolYearEnd(date);
      expect(result).toEqual(new Date(2024, 6, 31, 23, 59, 59, 999));
    });

    it("returns July 31st of the next year for August 1st", () => {
      const date = new Date(2023, 7, 1); // Aug 1, 2023
      const result = schoolYearEnd(date);
      expect(result).toEqual(new Date(2024, 6, 31, 23, 59, 59, 999));
    });

    it("uses the current date when no argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 8, 6, 12, 0, 0)); // Sept 6, 2023
      const result = schoolYearEnd();
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(6); // July
      expect(result.getDate()).toBe(31);
      vi.useRealTimers();
    });
  });

  describe("weekOfSchoolYear", () => {
    it("returns 1 for the first week of August", () => {
      const date = new Date(2023, 7, 5); // Aug 5, 2023 (diff is 4 days -> week 1)
      expect(weekOfSchoolYear(date)).toBe(1);
    });

    it("returns 2 for exactly 7 days after the start", () => {
      const date = new Date(2023, 7, 8); // Aug 8, 2023 (diff is 7 days -> week 2)
      expect(weekOfSchoolYear(date)).toBe(2);
    });

    it("handles dates later in the school year", () => {
      const date = new Date(2023, 11, 15); // Dec 15, 2023
      // August has 31 days, September 30, October 31, November 30, plus 15 in December = 137 days total
      // floor(136 days / 7) + 1 = 19 + 1 = 20
      expect(weekOfSchoolYear(date)).toBe(20);
    });

    it("handles dates in the next calendar year but same school year", () => {
      const date = new Date(2024, 4, 15); // May 15, 2024
      // Aug: 31, Sep: 30, Oct: 31, Nov: 30, Dec: 31
      // Jan: 31, Feb: 29 (2024 is leap), Mar: 31, Apr: 30, May: 15
      // Total days: 31+30+31+30+31 + 31+29+31+30+15 = 289
      // daysBetween is 288. floor(288/7)+1 = 41 + 1 = 42
      expect(weekOfSchoolYear(date)).toBe(42);
    });

    it("uses the current date when no argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 7, 8, 12, 0, 0)); // Aug 8, 2023
      expect(weekOfSchoolYear()).toBe(2);
      vi.useRealTimers();
    });
  });


  describe("formatDateEs", () => {
    it("formats dates in Spanish format correctly", () => {
      expect(formatDateEs(new Date(2023, 0, 15))).toBe("15 de enero de 2023");
      expect(formatDateEs(new Date(2023, 11, 31))).toBe("31 de diciembre de 2023");
      expect(formatDateEs(new Date(2024, 1, 29))).toBe("29 de febrero de 2024"); // Leap year
    });
  });

  describe("formatDateEn", () => {
    it("formats dates in English format correctly", () => {
      expect(formatDateEn(new Date(2023, 0, 15))).toBe("January 15, 2023");
      expect(formatDateEn(new Date(2023, 11, 31))).toBe("December 31, 2023");
      expect(formatDateEn(new Date(2024, 1, 29))).toBe("February 29, 2024"); // Leap year
    });
  });

  describe("relativeDateEs", () => {
    it("returns 'hoy' for the same day", () => {
      const d = new Date(2023, 8, 6, 10, 0, 0);
      const now = new Date(2023, 8, 6, 15, 0, 0);
      expect(relativeDateEs(d, now)).toBe("hoy");
    });

    it("returns 'ayer' for exactly one day ago", () => {
      const d = new Date(2023, 8, 5, 10, 0, 0);
      const now = new Date(2023, 8, 6, 15, 0, 0);
      expect(relativeDateEs(d, now)).toBe("ayer");
    });

    it("returns 'hace N días' for 2 to 6 days ago", () => {
      const now = new Date(2023, 8, 10, 15, 0, 0);
      expect(relativeDateEs(new Date(2023, 8, 8, 10, 0, 0), now)).toBe("hace 2 días");
      expect(relativeDateEs(new Date(2023, 8, 4, 10, 0, 0), now)).toBe("hace 6 días");
    });

    it("returns full date for more than 6 days ago", () => {
      const now = new Date(2023, 8, 10, 15, 0, 0);
      const d = new Date(2023, 8, 3, 10, 0, 0); // 7 days ago
      expect(relativeDateEs(d, now)).toBe("3 de septiembre de 2023");
    });

    it("uses the current date when no now argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 8, 6, 12, 0, 0));
      expect(relativeDateEs(new Date(2023, 8, 6, 10, 0, 0))).toBe("hoy");
      expect(relativeDateEs(new Date(2023, 8, 5, 10, 0, 0))).toBe("ayer");
      vi.useRealTimers();
    });
  });

  describe("relativeDateEn", () => {
    it("returns 'today' for the same day", () => {
      const d = new Date(2023, 8, 6, 10, 0, 0);
      const now = new Date(2023, 8, 6, 15, 0, 0);
      expect(relativeDateEn(d, now)).toBe("today");
    });

    it("returns 'yesterday' for exactly one day ago", () => {
      const d = new Date(2023, 8, 5, 10, 0, 0);
      const now = new Date(2023, 8, 6, 15, 0, 0);
      expect(relativeDateEn(d, now)).toBe("yesterday");
    });

    it("returns 'N days ago' for 2 to 6 days ago", () => {
      const now = new Date(2023, 8, 10, 15, 0, 0);
      expect(relativeDateEn(new Date(2023, 8, 8, 10, 0, 0), now)).toBe("2 days ago");
      expect(relativeDateEn(new Date(2023, 8, 4, 10, 0, 0), now)).toBe("6 days ago");
    });

    it("returns full date for more than 6 days ago", () => {
      const now = new Date(2023, 8, 10, 15, 0, 0);
      const d = new Date(2023, 8, 3, 10, 0, 0); // 7 days ago
      expect(relativeDateEn(d, now)).toBe("September 3, 2023");
    });

    it("uses the current date when no now argument is provided", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 8, 6, 12, 0, 0));
      expect(relativeDateEn(new Date(2023, 8, 6, 10, 0, 0))).toBe("today");
      expect(relativeDateEn(new Date(2023, 8, 5, 10, 0, 0))).toBe("yesterday");
      vi.useRealTimers();
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
