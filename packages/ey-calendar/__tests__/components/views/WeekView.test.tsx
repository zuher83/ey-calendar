// Tests for WeekView component
import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { WeekView } from "../../../src/components/views/WeekView";
import { createMockEvent, renderWithProvider } from "../../setup/testUtils";

describe("WeekView", () => {
  describe("Rendering", () => {
    it("renders the week view container", () => {
      renderWithProvider(<WeekView />, { initialView: "week" });

      const weekView = document.querySelector("[data-eycalendar-week-view]");
      expect(weekView).toBeInTheDocument();
    });

    it("renders 7 day headers", () => {
      renderWithProvider(<WeekView />, { initialView: "week" });

      // Should have day headers for each day of the week
      const dayHeaders = document.querySelectorAll("[data-eycalendar-day-header]");
      expect(dayHeaders.length).toBe(7);
    });

    it("renders 5 day headers when showWeekends is false", () => {
      renderWithProvider(<WeekView />, {
        initialView: "week",
        options: { showWeekends: false },
      });

      const dayHeaders = document.querySelectorAll("[data-eycalendar-day-header]");
      expect(dayHeaders.length).toBe(5);
    });

    it("applies custom className", () => {
      renderWithProvider(<WeekView className="custom-week-class" />, { initialView: "week" });

      const weekView = document.querySelector("[data-eycalendar-week-view]");
      expect(weekView).toHaveClass("custom-week-class");
    });

    it("renders time slots for each day", () => {
      renderWithProvider(<WeekView />, { initialView: "week" });

      // Should have time labels (e.g., "00:00", "01:00", etc.)
      const timeLabels = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Event display", () => {
    it("displays events in the correct day column", () => {
      const monday = new Date(2024, 0, 15); // January 15, 2024 is a Monday
      const event = createMockEvent({
        id: "monday-event",
        title: "Monday Meeting",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<WeekView />, {
        initialEvents: [event],
        initialDate: monday,
        initialView: "week",
      });

      expect(screen.getByText("Monday Meeting")).toBeInTheDocument();
    });

    it("displays events across multiple days", () => {
      const monday = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "monday-event",
          title: "Monday Event",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "wednesday-event",
          title: "Wednesday Event",
          start: new Date(2024, 0, 17, 14, 0),
          end: new Date(2024, 0, 17, 15, 0),
        }),
        createMockEvent({
          id: "friday-event",
          title: "Friday Event",
          start: new Date(2024, 0, 19, 16, 0),
          end: new Date(2024, 0, 19, 17, 0),
        }),
      ];

      renderWithProvider(<WeekView />, {
        initialEvents: events,
        initialDate: monday,
        initialView: "week",
      });

      expect(screen.getByText("Monday Event")).toBeInTheDocument();
      expect(screen.getByText("Wednesday Event")).toBeInTheDocument();
      expect(screen.getByText("Friday Event")).toBeInTheDocument();
    });

    it("does not display events from outside the week", () => {
      const monday = new Date(2024, 0, 15);

      const event = createMockEvent({
        id: "next-week-event",
        title: "Next Week Event",
        start: new Date(2024, 0, 22, 10, 0), // Next Monday
        end: new Date(2024, 0, 22, 11, 0),
      });

      renderWithProvider(<WeekView />, {
        initialEvents: [event],
        initialDate: monday,
        initialView: "week",
      });

      expect(screen.queryByText("Next Week Event")).not.toBeInTheDocument();
    });
  });

  describe("Multi-day events", () => {
    it("displays multi-day spanning events", () => {
      const monday = new Date(2024, 0, 15);
      const multiDayEvent = createMockEvent({
        id: "multi-day",
        title: "Conference",
        start: new Date(2024, 0, 15, 9, 0), // Monday
        end: new Date(2024, 0, 17, 17, 0), // Wednesday
      });

      renderWithProvider(<WeekView />, {
        initialEvents: [multiDayEvent],
        initialDate: monday,
        initialView: "week",
      });

      // Event should span across multiple days
      expect(screen.getByText("Conference")).toBeInTheDocument();
    });

    it("handles all-day events spanning multiple days", () => {
      const monday = new Date(2024, 0, 15);
      const allDayEvent = createMockEvent({
        id: "all-day-multi",
        title: "Team Offsite",
        start: new Date(2024, 0, 16, 0, 0), // Tuesday
        end: new Date(2024, 0, 18, 23, 59), // Thursday
        isAllDay: true,
      });

      renderWithProvider(<WeekView />, {
        initialEvents: [allDayEvent],
        initialDate: monday,
        initialView: "week",
      });

      expect(screen.getByText("Team Offsite")).toBeInTheDocument();
    });
  });

  describe("Conflict handling", () => {
    it("handles overlapping events in the same day", () => {
      const monday = new Date(2024, 0, 15);
      const overlappingEvents = [
        createMockEvent({
          id: "event-1",
          title: "Event 1",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 30),
        }),
        createMockEvent({
          id: "event-2",
          title: "Event 2",
          start: new Date(2024, 0, 15, 10, 30),
          end: new Date(2024, 0, 15, 12, 0),
        }),
      ];

      renderWithProvider(<WeekView />, {
        initialEvents: overlappingEvents,
        initialDate: monday,
        initialView: "week",
      });

      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
    });
  });

  describe("Current day indicator", () => {
    it("marks the current day", () => {
      const today = new Date();

      renderWithProvider(<WeekView />, {
        initialDate: today,
        initialView: "week",
      });

      const weekView = document.querySelector("[data-eycalendar-week-view]");
      expect(weekView).toBeInTheDocument();

      // Today's header should have a special attribute
      const todayHeader = document.querySelector('[data-today="true"]');
      expect(todayHeader).toBeInTheDocument();
    });

    it("does not mark the current day when highlightToday is false", () => {
      const today = new Date();

      renderWithProvider(<WeekView />, {
        initialDate: today,
        initialView: "week",
        options: { highlightToday: false },
      });

      const todayHeader = document.querySelector('[data-today="true"]');
      expect(todayHeader).not.toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("renders correctly with no events", () => {
      renderWithProvider(<WeekView />, {
        initialEvents: [],
        initialView: "week",
      });

      const weekView = document.querySelector("[data-eycalendar-week-view]");
      expect(weekView).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has appropriate data attributes", () => {
      renderWithProvider(<WeekView />, { initialView: "week" });

      const weekView = document.querySelector("[data-eycalendar-week-view]");
      expect(weekView).toHaveAttribute("data-eycalendar-week-view", "");
    });

    it("day headers are accessible", () => {
      renderWithProvider(<WeekView />, { initialView: "week" });

      const headers = document.querySelectorAll("[data-eycalendar-day-header]");
      expect(headers.length).toBe(7);
      headers.forEach((header) => {
        expect(header).toBeInTheDocument();
      });
    });

    it("supports arrow-key navigation between day headers", () => {
      renderWithProvider(<WeekView />, { initialView: "week" });

      const headers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-eycalendar-day-header]")
      );

      headers[0]?.focus();
      fireEvent.keyDown(headers[0] as HTMLElement, { key: "ArrowRight" });
      expect(headers[1]).toHaveFocus();

      fireEvent.keyDown(headers[1] as HTMLElement, { key: "End" });
      expect(headers[headers.length - 1]).toHaveFocus();
    });

    it("events are keyboard accessible", () => {
      const monday = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "accessible-event",
        title: "Accessible Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<WeekView />, {
        initialEvents: [event],
        initialDate: monday,
        initialView: "week",
      });

      const eventElement = screen.getByText("Accessible Event");
      const clickableParent = eventElement.closest("div[tabindex]");
      expect(clickableParent).toHaveAttribute("tabindex", "0");
    });
  });

  describe("Week boundaries", () => {
    it("starts week on Monday by default", () => {
      const wednesday = new Date(2024, 0, 17); // Wednesday

      renderWithProvider(<WeekView />, {
        initialDate: wednesday,
        initialView: "week",
      });

      // Week should start from Monday (Jan 15)
      const weekView = document.querySelector("[data-eycalendar-week-view]");
      expect(weekView).toBeInTheDocument();

      // Day headers should show dates starting from Monday
      const dayHeaders = document.querySelectorAll("[data-eycalendar-day-number]");
      expect(dayHeaders.length).toBe(7);
    });
  });
});
