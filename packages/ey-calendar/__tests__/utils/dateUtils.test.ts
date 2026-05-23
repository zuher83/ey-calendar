// Tests for dateUtils
import { doDateRangesOverlap, formatDuration, formatTime } from "../../src/utils/dateUtils";

describe("dateUtils", () => {
  describe("formatTime", () => {
    it("formats correctly within 24 hours by default", () => {
      const date = new Date(2024, 0, 1, 14, 30);
      expect(formatTime(date)).toBe("14:30");
    });

    it("formats correctly in 12 hours", () => {
      const date = new Date(2024, 0, 1, 14, 30);
      expect(formatTime(date, undefined, "12h")).toBe("2:30 PM");
    });

    it("format midnight correctly in 24 hours", () => {
      const date = new Date(2024, 0, 1, 0, 0);
      expect(formatTime(date)).toBe("00:00");
    });

    it("format midnight correctly as 12:00", () => {
      const date = new Date(2024, 0, 1, 0, 0);
      expect(formatTime(date, undefined, "12h")).toBe("12:00 AM");
    });

    it("format 12 noon correctly", () => {
      const date = new Date(2024, 0, 1, 12, 0);
      expect(formatTime(date, undefined, "12h")).toBe("12:00 PM");
    });
  });

  describe("formatDuration", () => {
    it("correctly format a duration in minutes", () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = new Date(2024, 0, 1, 10, 30);
      expect(formatDuration(start, end)).toBe("30min");
    });

    it("correctly format a duration in hours", () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = new Date(2024, 0, 1, 12, 0);
      expect(formatDuration(start, end)).toBe("2h");
    });

    it("correctly format a mixed duration of hours and minutes", () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = new Date(2024, 0, 1, 11, 45);
      expect(formatDuration(start, end)).toBe("1h45");
    });

    it("manages a duration of 0 minutes", () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = new Date(2024, 0, 1, 10, 0);
      expect(formatDuration(start, end)).toBe("0min");
    });

    it("format correctly 1 minute", () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = new Date(2024, 0, 1, 10, 1);
      expect(formatDuration(start, end)).toBe("1min");
    });

    it("ignores seconds and milliseconds to stay aligned with displayed times", () => {
      const start = new Date(2024, 0, 1, 11, 0, 59, 900);
      const end = new Date(2024, 0, 1, 12, 30, 0, 0);
      expect(formatDuration(start, end)).toBe("1h30");
    });
  });

  describe("doDateRangesOverlap", () => {
    it("detects a complete overlap", () => {
      const range1 = {
        start: new Date(2024, 0, 1, 10, 0),
        end: new Date(2024, 0, 1, 12, 0),
      };
      const range2 = {
        start: new Date(2024, 0, 1, 11, 0),
        end: new Date(2024, 0, 1, 13, 0),
      };
      expect(doDateRangesOverlap(range1, range2)).toBe(true);
    });

    it("detects when one range completely contains the other", () => {
      const range1 = {
        start: new Date(2024, 0, 1, 10, 0),
        end: new Date(2024, 0, 1, 14, 0),
      };
      const range2 = {
        start: new Date(2024, 0, 1, 11, 0),
        end: new Date(2024, 0, 1, 13, 0),
      };
      expect(doDateRangesOverlap(range1, range2)).toBe(true);
    });

    it("detects when ranges do not overlap", () => {
      const range1 = {
        start: new Date(2024, 0, 1, 10, 0),
        end: new Date(2024, 0, 1, 12, 0),
      };
      const range2 = {
        start: new Date(2024, 0, 1, 13, 0),
        end: new Date(2024, 0, 1, 14, 0),
      };
      expect(doDateRangesOverlap(range1, range2)).toBe(false);
    });

    it("properly handles adjacent ranges (end = start)", () => {
      const range1 = {
        start: new Date(2024, 0, 1, 10, 0),
        end: new Date(2024, 0, 1, 12, 0),
      };
      const range2 = {
        start: new Date(2024, 0, 1, 12, 0),
        end: new Date(2024, 0, 1, 14, 0),
      };
      // Les plages adjacentes ne devraient pas chevaucher
      expect(doDateRangesOverlap(range1, range2)).toBe(false);
    });

    it("properly handles the reverse order of ranges", () => {
      const range1 = {
        start: new Date(2024, 0, 1, 13, 0),
        end: new Date(2024, 0, 1, 14, 0),
      };
      const range2 = {
        start: new Date(2024, 0, 1, 10, 0),
        end: new Date(2024, 0, 1, 12, 0),
      };
      expect(doDateRangesOverlap(range1, range2)).toBe(false);
    });

    it("detects minimal overlap (1 millisecond)", () => {
      const range1 = {
        start: new Date(2024, 0, 1, 10, 0, 0, 0),
        end: new Date(2024, 0, 1, 12, 0, 0, 1),
      };
      const range2 = {
        start: new Date(2024, 0, 1, 12, 0, 0, 0),
        end: new Date(2024, 0, 1, 14, 0, 0, 0),
      };
      expect(doDateRangesOverlap(range1, range2)).toBe(true);
    });
  });
});
