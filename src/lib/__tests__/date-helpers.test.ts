import { describe, it, expect } from "vitest";
import { schoolYearStart } from "../date-helpers";

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
});
