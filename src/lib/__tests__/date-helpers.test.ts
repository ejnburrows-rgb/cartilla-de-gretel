import { describe, it, expect } from "vitest";
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  daysBetween,
  isSameDay,
  isConsecutiveDay,
  schoolYearStart,
  schoolYearEnd,
  weekOfSchoolYear,
  formatDateEs,
  formatDateEn,
  relativeDateEs,
  relativeDateEn,
} from "@/lib/date-helpers";

describe("startOfDay", () => {
  it("zeroes the time component", () => {
    const d = new Date(2026, 5, 19, 14, 37, 12, 500);
    const s = startOfDay(d);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(s.getSeconds()).toBe(0);
    expect(s.getMilliseconds()).toBe(0);
    expect(s.getDate()).toBe(19);
  });

  it("does not mutate its argument", () => {
    const d = new Date(2026, 5, 19, 14, 0, 0);
    startOfDay(d);
    expect(d.getHours()).toBe(14);
  });
});

describe("startOfWeek / endOfWeek (Monday-based by default)", () => {
  it("snaps to the preceding Monday", () => {
    // 2026-06-19 is a Friday.
    const friday = new Date(2026, 5, 19);
    const monday = startOfWeek(friday);
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(15);
  });

  it("treats Monday as its own week start", () => {
    const monday = new Date(2026, 5, 15);
    expect(startOfWeek(monday).getDate()).toBe(15);
  });

  it("rolls a Sunday back to the previous Monday", () => {
    // 2026-06-21 is a Sunday.
    const sunday = new Date(2026, 5, 21);
    expect(startOfWeek(sunday).getDate()).toBe(15);
  });

  it("ends the week six days after it starts, at end of day", () => {
    const end = endOfWeek(new Date(2026, 5, 19));
    expect(end.getDay()).toBe(0); // Sunday
    expect(end.getDate()).toBe(21);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });
});

describe("daysBetween / isSameDay / isConsecutiveDay", () => {
  it("counts calendar days regardless of time of day", () => {
    const a = new Date(2026, 5, 19, 23, 0, 0);
    const b = new Date(2026, 5, 22, 1, 0, 0);
    expect(daysBetween(a, b)).toBe(3);
  });

  it("is zero for two times on the same day", () => {
    const a = new Date(2026, 5, 19, 8, 0, 0);
    const b = new Date(2026, 5, 19, 20, 0, 0);
    expect(daysBetween(a, b)).toBe(0);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("recognizes consecutive days for streak math", () => {
    const mon = new Date(2026, 5, 15, 9, 0, 0);
    const tue = new Date(2026, 5, 16, 18, 0, 0);
    const wed = new Date(2026, 5, 17);
    expect(isConsecutiveDay(mon, tue)).toBe(true);
    expect(isConsecutiveDay(mon, wed)).toBe(false);
  });
});

describe("school year (Aug 1 – Jul 31)", () => {
  it("anchors the start to the most recent August 1st", () => {
    expect(schoolYearStart(new Date(2026, 8, 10))).toEqual(new Date(2026, 7, 1, 0, 0, 0, 0));
    // A date before August belongs to the prior school year.
    expect(schoolYearStart(new Date(2026, 0, 10))).toEqual(new Date(2025, 7, 1, 0, 0, 0, 0));
  });

  it("ends the year on the following July 31st", () => {
    const end = schoolYearEnd(new Date(2025, 8, 1));
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(6); // July
    expect(end.getDate()).toBe(31);
  });

  it("numbers weeks starting at 1 on August 1st", () => {
    expect(weekOfSchoolYear(new Date(2025, 7, 1))).toBe(1);
    expect(weekOfSchoolYear(new Date(2025, 7, 8))).toBe(2);
  });
});

describe("date formatting", () => {
  it("formats Spanish long dates", () => {
    expect(formatDateEs(new Date(2026, 5, 19))).toBe("19 de junio de 2026");
  });

  it("formats English long dates", () => {
    expect(formatDateEn(new Date(2026, 5, 19))).toBe("June 19, 2026");
  });
});

describe("relative dates", () => {
  const now = new Date(2026, 5, 19, 12, 0, 0);

  it("says today/yesterday and a short 'days ago' window (ES)", () => {
    expect(relativeDateEs(new Date(2026, 5, 19, 8, 0, 0), now)).toBe("hoy");
    expect(relativeDateEs(new Date(2026, 5, 18), now)).toBe("ayer");
    expect(relativeDateEs(new Date(2026, 5, 16), now)).toBe("hace 3 días");
  });

  it("falls back to an absolute date beyond a week (ES)", () => {
    expect(relativeDateEs(new Date(2026, 5, 1), now)).toBe("1 de junio de 2026");
  });

  it("says today/yesterday and a short 'days ago' window (EN)", () => {
    expect(relativeDateEn(new Date(2026, 5, 19, 8, 0, 0), now)).toBe("today");
    expect(relativeDateEn(new Date(2026, 5, 18), now)).toBe("yesterday");
    expect(relativeDateEn(new Date(2026, 5, 16), now)).toBe("3 days ago");
  });
});
