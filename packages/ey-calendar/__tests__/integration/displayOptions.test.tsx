// Tests for the display options that control what a cell and an event show:
// `showEventTime` (and its all-day counterpart) and `maxEventsPerSlot`.
//
// Both were declared in the public options but read by nobody, so these tests
// exist to keep them wired to the components that render them.
import React from "react";
import { MonthView } from "../../src/components/views/MonthView";
import { PlanningView } from "../../src/components/views/PlanningView";
import { createMockEvent, renderWithProvider } from "../setup/testUtils";

const REFERENCE_DATE = new Date(2024, 0, 15);

function timedEvent(id: string, hour: number, minute = 0) {
  return createMockEvent({
    id,
    title: `Event ${id}`,
    start: new Date(2024, 0, 15, hour, minute),
    end: new Date(2024, 0, 15, hour + 1, minute),
  });
}

describe("Display options", () => {
  describe("showEventTime", () => {
    it("displays the event time by default", () => {
      renderWithProvider(<PlanningView />, {
        initialView: "planning",
        initialDate: REFERENCE_DATE,
        initialEvents: [timedEvent("1", 10, 38)],
      });

      expect(document.querySelector(".ey-cal-event-card-time")).toBeInTheDocument();
    });

    it("hides the event time when showEventTime is false", () => {
      renderWithProvider(<PlanningView />, {
        initialView: "planning",
        initialDate: REFERENCE_DATE,
        initialEvents: [timedEvent("1", 10, 38)],
        options: { showEventTime: false },
      });

      expect(document.querySelector(".ey-cal-event-card-time")).not.toBeInTheDocument();
    });

    it("keeps rendering the event itself when the time is hidden", () => {
      renderWithProvider(<PlanningView />, {
        initialView: "planning",
        initialDate: REFERENCE_DATE,
        initialEvents: [timedEvent("1", 10, 38)],
        options: { showEventTime: false },
      });

      // Hiding the hour must not hide the event.
      expect(document.querySelector("[data-eycalendar-event-card]")).toBeInTheDocument();
    });

    it("never displays a time for an all-day event, even by default", () => {
      renderWithProvider(<PlanningView />, {
        initialView: "planning",
        initialDate: REFERENCE_DATE,
        initialEvents: [
          createMockEvent({
            id: "all-day",
            title: "All day event",
            start: new Date(2024, 0, 15, 0, 0),
            end: new Date(2024, 0, 15, 23, 59),
            isAllDay: true,
          }),
        ],
      });

      // Used to render "00:00", which is worse than useless: it is misleading.
      expect(document.querySelector(".ey-cal-event-card-time")).not.toBeInTheDocument();
    });
  });

  describe("maxEventsPerSlot", () => {
    const sixEventsOnTheSameDay = [
      timedEvent("1", 8),
      timedEvent("2", 9),
      timedEvent("3", 10),
      timedEvent("4", 11),
      timedEvent("5", 12),
      timedEvent("6", 13),
    ];

    // The geometric budget is clamped to [2, 8] rows whatever the container
    // height, so an unset cap always leaves room for at least one event, and a
    // cap of 1 always leaves room for none — the single row goes to "+N more".
    // That makes the two assertions below independent of the jsdom layout.
    it("shows at least one event when no cap is set", () => {
      renderWithProvider(<MonthView />, {
        initialView: "month",
        initialDate: REFERENCE_DATE,
        initialEvents: sixEventsOnTheSameDay,
      });

      const shown = document.querySelectorAll("[data-eycalendar-event-dot]");
      expect(shown.length).toBeGreaterThanOrEqual(1);
    });

    it("caps how many events a day cell renders", () => {
      renderWithProvider(<MonthView />, {
        initialView: "month",
        initialDate: REFERENCE_DATE,
        initialEvents: sixEventsOnTheSameDay,
        options: { maxEventsPerSlot: 1 },
      });

      const shown = document.querySelectorAll("[data-eycalendar-event-dot]");
      expect(shown.length).toBe(0);
    });

    it("moves the events it hides into the overflow indicator", () => {
      renderWithProvider(<MonthView />, {
        initialView: "month",
        initialDate: REFERENCE_DATE,
        initialEvents: sixEventsOnTheSameDay,
        options: { maxEventsPerSlot: 1 },
      });

      // The overflow count is computed by MonthWeekRow, from the same capped
      // budget: if the cap were applied on one side only, this would disagree.
      expect(document.body.textContent).toContain("+6 more");
    });
  });
});
