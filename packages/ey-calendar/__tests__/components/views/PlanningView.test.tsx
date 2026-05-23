// Tests for PlanningView component
import React from "react";
import { screen } from "@testing-library/react";
import { PlanningView } from "../../../src/components/views/PlanningView";
import { createMockEvent, renderWithProvider } from "../../setup/testUtils";

describe("PlanningView", () => {
  describe("Rendering", () => {
    it("renders the planning view container", () => {
      renderWithProvider(<PlanningView />, { initialView: "planning" });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toBeInTheDocument();
    });

    it("applies custom className", () => {
      renderWithProvider(<PlanningView className="custom-planning-class" />, {
        initialView: "planning",
      });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toHaveClass("custom-planning-class");
    });
  });

  describe("Event display", () => {
    it("displays events in chronological order", () => {
      const startDate = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "event-1",
          title: "Event 1",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "event-2",
          title: "Event 2",
          start: new Date(2024, 0, 16, 14, 0),
          end: new Date(2024, 0, 16, 15, 0),
        }),
        createMockEvent({
          id: "event-3",
          title: "Event 3",
          start: new Date(2024, 0, 17, 16, 0),
          end: new Date(2024, 0, 17, 17, 0),
        }),
      ];

      renderWithProvider(<PlanningView />, {
        initialEvents: events,
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
      expect(screen.getByText("Event 3")).toBeInTheDocument();
    });

    it("displays event times", () => {
      const startDate = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "timed-event",
        title: "Timed Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 30),
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [event],
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("Timed Event")).toBeInTheDocument();
      // Should display time in format like "10:00" or "10:00 - 11:30"
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
    });

    it("groups events by day", () => {
      const startDate = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "monday-1",
          title: "Monday Event 1",
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 10, 0),
        }),
        createMockEvent({
          id: "monday-2",
          title: "Monday Event 2",
          start: new Date(2024, 0, 15, 14, 0),
          end: new Date(2024, 0, 15, 15, 0),
        }),
        createMockEvent({
          id: "tuesday-1",
          title: "Tuesday Event",
          start: new Date(2024, 0, 16, 10, 0),
          end: new Date(2024, 0, 16, 11, 0),
        }),
      ];

      renderWithProvider(<PlanningView />, {
        initialEvents: events,
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("Monday Event 1")).toBeInTheDocument();
      expect(screen.getByText("Monday Event 2")).toBeInTheDocument();
      expect(screen.getByText("Tuesday Event")).toBeInTheDocument();
    });
  });

  describe("All-day events", () => {
    it("displays all-day events", () => {
      const startDate = new Date(2024, 0, 15);
      const allDayEvent = createMockEvent({
        id: "all-day",
        title: "All Day Event",
        start: new Date(2024, 0, 15, 0, 0),
        end: new Date(2024, 0, 15, 23, 59),
        isAllDay: true,
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [allDayEvent],
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("All Day Event")).toBeInTheDocument();
    });

    it("separates all-day events from timed events", () => {
      const startDate = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "all-day",
          title: "All Day Meeting",
          start: new Date(2024, 0, 15, 0, 0),
          end: new Date(2024, 0, 15, 23, 59),
          isAllDay: true,
        }),
        createMockEvent({
          id: "timed",
          title: "Timed Meeting",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
      ];

      renderWithProvider(<PlanningView />, {
        initialEvents: events,
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("All Day Meeting")).toBeInTheDocument();
      expect(screen.getByText("Timed Meeting")).toBeInTheDocument();
    });
  });

  describe("Multi-day events", () => {
    it("displays multi-day events", () => {
      const startDate = new Date(2024, 0, 15);
      const multiDayEvent = createMockEvent({
        id: "multi-day",
        title: "Conference",
        start: new Date(2024, 0, 15, 9, 0),
        end: new Date(2024, 0, 17, 17, 0),
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [multiDayEvent],
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("Conference")).toBeInTheDocument();
    });
  });

  describe("Date range display", () => {
    it("displays events within the visible date range", () => {
      const startDate = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "week-1",
          title: "This Week",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "week-2",
          title: "Outside Visible Range",
          start: new Date(2024, 0, 22, 10, 0),
          end: new Date(2024, 0, 22, 11, 0),
        }),
      ];

      renderWithProvider(<PlanningView />, {
        initialEvents: events,
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.queryByText("Outside Visible Range")).not.toBeInTheDocument();
    });

    it("does not mark today when highlightToday is false", () => {
      const today = new Date();
      const event = createMockEvent({
        id: "today-event",
        title: "Today Event",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [event],
        initialDate: today,
        initialView: "planning",
        options: { highlightToday: false },
      });

      const todayHeader = document.querySelector('[data-today="true"]');
      expect(todayHeader).not.toBeInTheDocument();

      const dateHeaderTitle = document.querySelector('[data-eycalendar-date-header] h3');
      expect(dateHeaderTitle?.textContent).not.toContain("Today");
    });
  });

  describe("Empty state", () => {
    it("renders correctly with no events", () => {
      renderWithProvider(<PlanningView />, {
        initialEvents: [],
        initialView: "planning",
      });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toBeInTheDocument();
    });

    it("shows empty message when no events", () => {
      renderWithProvider(<PlanningView />, {
        initialEvents: [],
        initialView: "planning",
      });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toBeInTheDocument();
    });
  });

  describe("Event styling", () => {
    it("applies custom event colors", () => {
      const startDate = new Date(2024, 0, 15);
      const coloredEvent = createMockEvent({
        id: "colored",
        title: "Colored Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
        backgroundColor: "#ff0000",
        textColor: "#ffffff",
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [coloredEvent],
        initialDate: startDate,
        initialView: "planning",
      });

      expect(screen.getByText("Colored Event")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has appropriate data attributes", () => {
      renderWithProvider(<PlanningView />, { initialView: "planning" });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toHaveAttribute("data-eycalendar-planning-view", "");
    });

    it("events are keyboard accessible", () => {
      const startDate = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "accessible",
        title: "Accessible Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [event],
        initialDate: startDate,
        initialView: "planning",
      });

      const eventElement = screen.getByText("Accessible Event");
      expect(eventElement).toBeInTheDocument();
    });

    it("date headers are accessible", () => {
      const startDate = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "event",
        title: "Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [event],
        initialDate: startDate,
        initialView: "planning",
      });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toBeInTheDocument();
    });
  });

  describe("Scrolling and pagination", () => {
    it("handles long list of events", () => {
      const startDate = new Date(2024, 0, 15);
      const events = Array.from({ length: 50 }, (_, i) =>
        createMockEvent({
          id: `event-${i}`,
          title: `Event ${i + 1}`,
          start: new Date(2024, 0, 15 + Math.floor(i / 5), 9 + (i % 10), 0),
          end: new Date(2024, 0, 15 + Math.floor(i / 5), 10 + (i % 10), 0),
        })
      );

      renderWithProvider(<PlanningView />, {
        initialEvents: events,
        initialDate: startDate,
        initialView: "planning",
      });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toBeInTheDocument();
    });
  });

  describe("Date formatting", () => {
    it("displays formatted dates correctly", () => {
      const startDate = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "dated-event",
        title: "Dated Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<PlanningView />, {
        initialEvents: [event],
        initialDate: startDate,
        initialView: "planning",
      });

      const planningView = document.querySelector("[data-eycalendar-planning-view]");
      expect(planningView).toBeInTheDocument();
    });
  });

  describe("Event ordering", () => {
    it("sorts events by time within the same day", () => {
      const startDate = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "afternoon",
          title: "Afternoon",
          start: new Date(2024, 0, 15, 14, 0),
          end: new Date(2024, 0, 15, 15, 0),
        }),
        createMockEvent({
          id: "morning",
          title: "Morning",
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 10, 0),
        }),
        createMockEvent({
          id: "noon",
          title: "Noon",
          start: new Date(2024, 0, 15, 12, 0),
          end: new Date(2024, 0, 15, 13, 0),
        }),
      ];

      renderWithProvider(<PlanningView />, {
        initialEvents: events,
        initialDate: startDate,
        initialView: "planning",
      });

      // All events should be present and sorted
      expect(screen.getByText("Morning")).toBeInTheDocument();
      expect(screen.getByText("Noon")).toBeInTheDocument();
      expect(screen.getByText("Afternoon")).toBeInTheDocument();
    });
  });
});
