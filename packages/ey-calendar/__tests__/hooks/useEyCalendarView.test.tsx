import React from "react";
import { act, renderHook } from "@testing-library/react";
import { EyCalendarProvider } from "../../src/context/CompositeEyCalendarContext";
import {
  useEyCalendarNavigation,
  useEyCalendarView,
  useEyCalendarVisibleEventCount,
} from "../../src/hooks/useEyCalendarView";
import type { EyCalendarEvent, EyCalendarOptions, ViewMode } from "../../src/types";
import { createMockEvent } from "../setup/testUtils";

function createWrapper(
  initialEvents: EyCalendarEvent[],
  initialDate: Date,
  options: Partial<EyCalendarOptions> = {},
  initialView: ViewMode = "week"
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <EyCalendarProvider
      initialEvents={initialEvents}
      initialDate={initialDate}
      initialView={initialView}
      options={options}
    >
      {children}
    </EyCalendarProvider>
  );

  Wrapper.displayName = "EyCalendarViewTestWrapper";

  return Wrapper;
}

describe("useEyCalendarView", () => {
  it("counts chained overlaps while excluding adjacent events", () => {
    const firstEvent = createMockEvent({
      id: "first-overlap",
      start: new Date(2024, 0, 15, 9, 0),
      end: new Date(2024, 0, 15, 11, 0),
    });
    const secondEvent = createMockEvent({
      id: "second-overlap",
      start: new Date(2024, 0, 15, 10, 30),
      end: new Date(2024, 0, 15, 12, 0),
    });
    const thirdEvent = createMockEvent({
      id: "third-overlap",
      start: new Date(2024, 0, 15, 11, 30),
      end: new Date(2024, 0, 15, 13, 0),
    });
    const adjacentEvent = createMockEvent({
      id: "adjacent",
      start: new Date(2024, 0, 15, 13, 0),
      end: new Date(2024, 0, 15, 14, 0),
    });

    const { result } = renderHook(() => useEyCalendarView(), {
      wrapper: createWrapper(
        [firstEvent, secondEvent, thirdEvent, adjacentEvent],
        new Date(2024, 0, 15),
        {},
        "day"
      ),
    });

    expect(result.current.stats.visibleEvents).toBe(4);
    expect(result.current.stats.conflictingEvents).toBe(3);
  });

  it("keeps navigation data aligned with the lightweight hooks", () => {
    const visibleEvent = createMockEvent({
      id: "visible",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 0),
    });
    const spanningEvent = createMockEvent({
      id: "spanning",
      start: new Date(2024, 0, 14, 23, 0),
      end: new Date(2024, 0, 15, 1, 0),
    });
    const hiddenEvent = createMockEvent({
      id: "hidden",
      start: new Date(2024, 1, 1, 10, 0),
      end: new Date(2024, 1, 1, 11, 0),
    });

    const { result } = renderHook(
      () => ({
        fullView: useEyCalendarView(),
        navigation: useEyCalendarNavigation(),
        visibleEventCount: useEyCalendarVisibleEventCount(),
      }),
      {
        wrapper: createWrapper(
          [visibleEvent, spanningEvent, hiddenEvent],
          new Date(2024, 0, 15),
          {},
          "week"
        ),
      }
    );

    expect(result.current.visibleEventCount).toBe(2);
    expect(result.current.visibleEventCount).toBe(result.current.fullView.stats.visibleEvents);
    expect(result.current.navigation.currentView).toBe(result.current.fullView.currentView);
    expect(result.current.navigation.navigation.currentLabel).toBe(
      result.current.fullView.navigation.currentLabel
    );
    expect(result.current.navigation.utils.getViewLabel("planning")).toBe(
      result.current.fullView.utils.getViewLabel("planning")
    );
  });

  it("navigates between periods through the lightweight navigation hook", () => {
    const { result } = renderHook(() => useEyCalendarNavigation(), {
      wrapper: createWrapper([], new Date(2024, 0, 17), {}, "week"),
    });

    expect(result.current.currentDate).toEqual(new Date(2024, 0, 17));

    act(() => {
      result.current.actions.goToNext();
    });

    expect(result.current.currentDate).toEqual(new Date(2024, 0, 22));

    act(() => {
      result.current.actions.goToPrevious();
    });

    expect(result.current.currentDate).toEqual(new Date(2024, 0, 15));
  });
});
