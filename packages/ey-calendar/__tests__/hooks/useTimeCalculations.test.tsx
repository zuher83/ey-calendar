// Tests for useTimeCalculations hook
import React from "react";
import { renderHook } from "@testing-library/react";
import { EyCalendarProvider } from "../../src/context/CompositeEyCalendarContext";
import { useTimeCalculations } from "../../src/hooks/useTimeCalculations";
import type { EyCalendarOptions, ViewMode } from "../../src/types";

describe("useTimeCalculations", () => {
  // Wrapper for Provider
  const createWrapper = (
    initialDate: Date = new Date(2024, 0, 15),
    options: Partial<EyCalendarOptions> = {},
    initialView: ViewMode = "week"
  ) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[]}
        initialDate={initialDate}
        initialView={initialView}
        options={options}
      >
        {children}
      </EyCalendarProvider>
    );
    Wrapper.displayName = "TimeCalculationsTestWrapper";
    return Wrapper;
  };

  describe("viewInfo - Day View", () => {
    it("correctly calculates the information for the day view", () => {
      const testDate = new Date(2024, 0, 15, 12, 0); // January 15, 2024
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(testDate),
      });

      // In default week mode, displays 7 days
      expect(result.current.viewInfo.totalDays).toBe(7);
      expect(result.current.viewInfo.visibleDays).toHaveLength(7);
      // Verify that January 15 is included in the visible days
      const has15Jan = result.current.viewInfo.visibleDays.some(
        (day) => day.getDate() === 15 && day.getMonth() === 0
      );
      expect(has15Jan).toBe(true);
    });

    it("includes the full date of the day", () => {
      const testDate = new Date(2024, 0, 15);
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(testDate),
      });

      const { startDate, endDate } = result.current.viewInfo;
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
    });
  });

  describe("viewInfo - Week View", () => {
    it("correctly calculates the information for the week view", () => {
      const testDate = new Date(2024, 0, 15); // Monday, January 15, 2024
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(testDate),
      });

      // Default week view = 7 days
      expect(result.current.viewInfo.totalDays).toBe(7);
      expect(result.current.viewInfo.visibleDays).toHaveLength(7);
    });

    it("starts the week on Monday", () => {
      const testDate = new Date(2024, 0, 17); // Wednesday
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(testDate),
      });

      // Must return dates from Monday to Sunday
      const { visibleDays } = result.current.viewInfo;
      if (visibleDays.length === 7) {
        expect(visibleDays[0].getDay()).toBe(1); // Monday
        expect(visibleDays[6].getDay()).toBe(0); // Sunday
      }
    });

    it("omits weekends when showWeekends is false", () => {
      const testDate = new Date(2024, 0, 17); // Wednesday
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(testDate, { showWeekends: false }, "week"),
      });

      const { visibleDays } = result.current.viewInfo;

      expect(visibleDays).toHaveLength(5);
      expect(visibleDays[0]?.getDay()).toBe(1);
      expect(visibleDays[4]?.getDay()).toBe(5);
      expect(visibleDays.every((day) => day.getDay() >= 1 && day.getDay() <= 5)).toBe(true);
    });
  });

  describe("month grid", () => {
    it("builds a business-week month grid when showWeekends is false", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(new Date(2024, 0, 15), { showWeekends: false }, "month"),
      });

      expect(result.current.viewInfo.visibleDays).toHaveLength(25);
      expect(result.current.monthGrid?.weeks).toHaveLength(5);
      expect(result.current.monthGrid?.weeks.every((week) => week.days.length === 5)).toBe(true);
    });
  });

  describe("timeSlots", () => {
    it("generates time slots", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.timeSlots).toBeDefined();
      expect(Array.isArray(result.current.timeSlots)).toBe(true);
      expect(result.current.timeSlots.length).toBeGreaterThan(0);
    });

    it("each time slot has the required properties", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      const firstSlot = result.current.timeSlots[0];
      expect(firstSlot).toHaveProperty("id");
      expect(firstSlot).toHaveProperty("start");
      expect(firstSlot).toHaveProperty("end");
      expect(firstSlot).toHaveProperty("startTime");
      expect(firstSlot).toHaveProperty("endTime");
    });

    it("time slots are ordered chronologically", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      const slots = result.current.timeSlots;
      for (let i = 1; i < slots.length; i++) {
        expect(slots[i].start.getTime()).toBeGreaterThanOrEqual(slots[i - 1].start.getTime());
      }
    });

    it("uses custom timeSlots configuration in week/day calculations", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(new Date(2024, 0, 15), {
          timeSlots: {
            duration: 30,
            startHour: 9,
            endHour: 12,
            format: "24h",
            granularity: "half-hour",
            showMinutes: true,
            stepMinutes: 30,
          },
        }),
      });

      const lastSlot = result.current.timeSlots[result.current.timeSlots.length - 1];

      expect(result.current.timeSlots).toHaveLength(42);
      expect(result.current.timeSlots[0]?.start.getHours()).toBe(9);
      expect(result.current.timeSlots[0]?.start.getMinutes()).toBe(0);
      expect(lastSlot?.end.getHours()).toBe(12);
      expect(lastSlot?.end.getMinutes()).toBe(0);
    });

    it("groups hourSlots without changing the public output", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(new Date(2024, 0, 15), {
          timeSlots: {
            duration: 30,
            startHour: 9,
            endHour: 12,
            format: "24h",
            granularity: "half-hour",
            showMinutes: true,
            stepMinutes: 30,
          },
        }),
      });

      expect(result.current.hourSlots).toHaveLength(3);
      expect(result.current.hourSlots?.[0]).toMatchObject({
        hour: 9,
        formattedTime: "09:00",
      });
      expect(result.current.hourSlots?.[0]?.slots).toHaveLength(14);
      expect(result.current.hourSlots?.[1]?.slots).toHaveLength(14);
      expect(result.current.hourSlots?.[2]?.slots).toHaveLength(14);
    });
  });

  describe("utils", () => {
    it("formatDate correctly formats a date", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      const testDate = new Date(2024, 0, 15);
      const formatted = result.current.utils.formatDate(testDate);

      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("isInViewRange correctly detects if a date is within the range", () => {
      const testDate = new Date(2024, 0, 15);
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(testDate),
      });

      // The current date must be within the range
      expect(result.current.utils.isInViewRange(testDate)).toBe(true);

      // A very distant date should not be within the range.
      const farDate = new Date(2025, 0, 1);
      expect(result.current.utils.isInViewRange(farDate)).toBe(false);
    });

    it("snapToGrid rounds a date to the grid", () => {
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      const testDate = new Date(2024, 0, 15, 10, 17); // 10:17
      const snapped = result.current.utils.snapToGrid(testDate);

      expect(snapped).toBeDefined();
      expect(snapped instanceof Date).toBe(true);
    });
  });

  describe("Memoization", () => {
    it("does not recalculate if the date does not change", () => {
      const { result, rerender } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // Objects should be the same (memoization)
      expect(firstResult.viewInfo).toBe(secondResult.viewInfo);
      expect(firstResult.timeSlots).toBe(secondResult.timeSlots);
      expect(firstResult.hourSlots).toBe(secondResult.hourSlots);
    });
  });

  describe("Edge cases", () => {
    it("correctly handles year change", () => {
      const newYear = new Date(2024, 0, 1); // January 1, 2024
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(newYear),
      });

      expect(result.current.viewInfo.visibleDays[0].getFullYear()).toBe(2024);
    });

    it("correctly handles month change", () => {
      const endOfMonth = new Date(2024, 0, 31); // January 31
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(endOfMonth),
      });

      expect(result.current.viewInfo.visibleDays[0].getMonth()).toBe(0);
    });

    it("correctly handles leap years", () => {
      const leapYear = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const { result } = renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(leapYear),
      });

      // In week mode, displays the week containing February 29
      // The week starts on Monday, February 26
      const visibleDays = result.current.viewInfo.visibleDays;
      expect(visibleDays).toHaveLength(7);

      // Checks that February 29 is in the visible days
      const has29Feb = visibleDays.some((day) => day.getDate() === 29 && day.getMonth() === 1);
      expect(has29Feb).toBe(true);
    });
  });

  describe("Performance", () => {
    it("quickly generates time slots even with many days", () => {
      const startTime = performance.now();

      renderHook(() => useTimeCalculations(), {
        wrapper: createWrapper(),
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // The calculation should be fast (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
