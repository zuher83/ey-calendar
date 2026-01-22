// Tests for ViewContext
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { useView, ViewProvider } from "../../src/context/ViewContext";
import type { ViewMode } from "../../src/types";

describe("ViewContext", () => {
  const createWrapper = (
    initialView: ViewMode = "week",
    initialDate: Date = new Date(2024, 0, 15),
    initialCellHeight: number = 64
  ) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <ViewProvider
        initialView={initialView}
        initialDate={initialDate}
        initialCellHeight={initialCellHeight}
      >
        {children}
      </ViewProvider>
    );
    Wrapper.displayName = "ViewTestWrapper";
    return Wrapper;
  };

  describe("Provider initialization", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.currentView).toBe("week");
      expect(result.current.state.cellHeight).toBe(64);
      expect(result.current.state.scrollPosition).toEqual({ x: 0, y: 0 });
    });

    it("initializes with custom view mode", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("day"),
      });

      expect(result.current.state.currentView).toBe("day");
    });

    it("initializes with custom date", () => {
      const customDate = new Date(2024, 5, 15);
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week", customDate),
      });

      expect(result.current.state.currentDate.getMonth()).toBe(5);
      expect(result.current.state.currentDate.getDate()).toBe(15);
    });

    it("initializes with custom cell height", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week", new Date(), 80),
      });

      expect(result.current.state.cellHeight).toBe(80);
    });

    it("calculates date range based on view mode", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week", new Date(2024, 0, 15)),
      });

      expect(result.current.state.startDate).toBeDefined();
      expect(result.current.state.endDate).toBeDefined();
      expect(result.current.state.endDate.getTime()).toBeGreaterThan(
        result.current.state.startDate.getTime()
      );
    });
  });

  describe("setViewMode", () => {
    it("changes the current view mode", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week"),
      });

      act(() => {
        result.current.setViewMode("day");
      });

      expect(result.current.state.currentView).toBe("day");
    });

    it("updates date range when view changes", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week", new Date(2024, 0, 15)),
      });

      const weekStartDate = result.current.state.startDate;

      act(() => {
        result.current.setViewMode("month");
      });

      const monthStartDate = result.current.state.startDate;
      expect(monthStartDate).not.toEqual(weekStartDate);
    });

    it("supports all view modes", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      const viewModes: ViewMode[] = ["day", "week", "month", "planning"];

      viewModes.forEach((mode) => {
        act(() => {
          result.current.setViewMode(mode);
        });

        expect(result.current.state.currentView).toBe(mode);
      });
    });
  });

  describe("setCurrentDate", () => {
    it("changes the current date", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      const newDate = new Date(2024, 6, 20);

      act(() => {
        result.current.setCurrentDate(newDate);
      });

      expect(result.current.state.currentDate.getMonth()).toBe(6);
      expect(result.current.state.currentDate.getDate()).toBe(20);
    });

    it("updates date range when date changes", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week", new Date(2024, 0, 15)),
      });

      const originalStart = result.current.state.startDate;

      act(() => {
        result.current.setCurrentDate(new Date(2024, 1, 15));
      });

      const newStart = result.current.state.startDate;
      expect(newStart).not.toEqual(originalStart);
    });
  });

  describe("Date range calculations", () => {
    it("calculates correct range for day view", () => {
      const testDate = new Date(2024, 0, 15, 12, 0);
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("day", testDate),
      });

      const { startDate, endDate } = result.current.state;

      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
    });

    it("calculates correct range for week view", () => {
      const testDate = new Date(2024, 0, 17); // Wednesday
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("week", testDate),
      });

      const { startDate, endDate } = result.current.state;

      // Week should start on Monday
      expect(startDate.getDay()).toBe(1);
      // Week should end on Sunday
      expect(endDate.getDay()).toBe(0);
    });

    it("calculates correct range for month view", () => {
      const testDate = new Date(2024, 0, 15);
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper("month", testDate),
      });

      const { startDate, endDate } = result.current.state;

      expect(startDate.getDate()).toBe(1);
      expect(endDate.getMonth()).toBe(0);
    });
  });

  describe("setCellHeight", () => {
    it("updates the cell height", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCellHeight(100);
      });

      expect(result.current.state.cellHeight).toBe(100);
    });

    it("accepts different height values", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      const heights = [50, 75, 100, 125];

      heights.forEach((height) => {
        act(() => {
          result.current.setCellHeight(height);
        });

        expect(result.current.state.cellHeight).toBe(height);
      });
    });
  });

  describe("setSelectedDate", () => {
    it("sets a selected date", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      const selectedDate = new Date(2024, 0, 20);

      act(() => {
        result.current.setSelectedDate(selectedDate);
      });

      expect(result.current.state.selectedDate).toEqual(selectedDate);
    });

    it("clears selected date when undefined", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      // First set a date
      act(() => {
        result.current.setSelectedDate(new Date(2024, 0, 20));
      });

      expect(result.current.state.selectedDate).toBeDefined();

      // Then clear it
      act(() => {
        result.current.setSelectedDate(undefined);
      });

      expect(result.current.state.selectedDate).toBeUndefined();
    });
  });

  describe("setScrollPosition", () => {
    it("updates scroll position", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setScrollPosition({ x: 100, y: 200 });
      });

      expect(result.current.state.scrollPosition).toEqual({ x: 100, y: 200 });
    });

    it("updates both x and y coordinates", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setScrollPosition({ x: 50, y: 0 });
      });

      expect(result.current.state.scrollPosition.x).toBe(50);
      expect(result.current.state.scrollPosition.y).toBe(0);

      act(() => {
        result.current.setScrollPosition({ x: 0, y: 300 });
      });

      expect(result.current.state.scrollPosition.x).toBe(0);
      expect(result.current.state.scrollPosition.y).toBe(300);
    });
  });

  describe("setDateRange", () => {
    it("manually sets date range", () => {
      const { result } = renderHook(() => useView(), {
        wrapper: createWrapper(),
      });

      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 31);

      act(() => {
        result.current.setDateRange(start, end);
      });

      expect(result.current.state.startDate).toEqual(start);
      expect(result.current.state.endDate).toEqual(end);
    });
  });

  describe("Error handling", () => {
    it("throws error when used outside provider", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useView());
      }).toThrow("useView must be used within a ViewProvider");

      consoleSpy.mockRestore();
    });
  });
});
