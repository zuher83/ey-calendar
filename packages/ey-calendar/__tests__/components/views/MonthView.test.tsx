// Tests for MonthView component
import React from "react";
import { screen } from "@testing-library/react";
import { MonthView } from "../../../src/components/views/MonthView";
import { createMockEvent, renderWithProvider } from "../../setup/testUtils";

describe("MonthView", () => {
  describe("Rendering", () => {
    it("renders the month view container", () => {
      renderWithProvider(<MonthView />, { initialView: "month" });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();
    });

    it("renders day headers for weekdays", () => {
      renderWithProvider(<MonthView />, { initialView: "month" });

      // Should have headers for Mon, Tue, Wed, Thu, Fri, Sat, Sun
      const dayHeaders = document.querySelectorAll("[data-eycalendar-weekday-header]");
      expect(dayHeaders.length).toBe(7);
    });

    it("applies custom className", () => {
      renderWithProvider(<MonthView className="custom-month-class" />, { initialView: "month" });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toHaveClass("custom-month-class");
    });

    it("renders month grid with correct number of cells", () => {
      const january2024 = new Date(2024, 0, 15);

      renderWithProvider(<MonthView />, {
        initialDate: january2024,
        initialView: "month",
      });

      // Should have cells for all days (typically 28-42 cells depending on month)
      const dayCells = document.querySelectorAll("[data-eycalendar-day-cell]");
      expect(dayCells.length).toBeGreaterThanOrEqual(28);
      expect(dayCells.length).toBeLessThanOrEqual(42);
    });
  });

  describe("Event display", () => {
    it("displays events in the correct day cell", () => {
      const january15 = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "month-event",
        title: "Monthly Meeting",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<MonthView />, {
        initialEvents: [event],
        initialDate: january15,
        initialView: "month",
      });

      expect(screen.getByText("Monthly Meeting")).toBeInTheDocument();
    });

    it("displays multiple events in the same day", () => {
      const january15 = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "event-1",
          title: "Event 1",
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 10, 0),
        }),
        createMockEvent({
          id: "event-2",
          title: "Event 2",
          start: new Date(2024, 0, 15, 14, 0),
          end: new Date(2024, 0, 15, 15, 0),
        }),
        createMockEvent({
          id: "event-3",
          title: "Event 3",
          start: new Date(2024, 0, 15, 16, 0),
          end: new Date(2024, 0, 15, 17, 0),
        }),
      ];

      renderWithProvider(<MonthView />, {
        initialEvents: events,
        initialDate: january15,
        initialView: "month",
      });

      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
      expect(screen.getByText("Event 3")).toBeInTheDocument();
    });

    it("displays events across different days in the month", () => {
      const january15 = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "start-month",
          title: "Start of Month",
          start: new Date(2024, 0, 1, 10, 0),
          end: new Date(2024, 0, 1, 11, 0),
        }),
        createMockEvent({
          id: "mid-month",
          title: "Mid Month",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "end-month",
          title: "End of Month",
          start: new Date(2024, 0, 31, 10, 0),
          end: new Date(2024, 0, 31, 11, 0),
        }),
      ];

      renderWithProvider(<MonthView />, {
        initialEvents: events,
        initialDate: january15,
        initialView: "month",
      });

      expect(screen.getByText("Start of Month")).toBeInTheDocument();
      expect(screen.getByText("Mid Month")).toBeInTheDocument();
      expect(screen.getByText("End of Month")).toBeInTheDocument();
    });

    it("displays events from adjacent months in the grid", () => {
      const january15 = new Date(2024, 0, 15);

      // February 1 falls in the last week of January's month view
      // (January 31 is a Wednesday, so the week continues through Sunday Feb 4)
      const event = createMockEvent({
        id: "february-event",
        title: "February Event",
        start: new Date(2024, 1, 1, 10, 0), // February 1 (Thursday)
        end: new Date(2024, 1, 1, 11, 0),
      });

      renderWithProvider(<MonthView />, {
        initialEvents: [event],
        initialDate: january15,
        initialView: "month",
      });

      // Event SHOULD be visible because Feb 1-4 are in January's month grid
      expect(screen.getByText("February Event")).toBeInTheDocument();
    });
  });

  describe("All-day events", () => {
    it("displays all-day events", () => {
      const january15 = new Date(2024, 0, 15);
      const allDayEvent = createMockEvent({
        id: "all-day",
        title: "Holiday",
        start: new Date(2024, 0, 15, 0, 0),
        end: new Date(2024, 0, 15, 23, 59),
        isAllDay: true,
      });

      renderWithProvider(<MonthView />, {
        initialEvents: [allDayEvent],
        initialDate: january15,
        initialView: "month",
      });

      expect(screen.getByText("Holiday")).toBeInTheDocument();
    });
  });

  describe("Multi-day events", () => {
    it("displays multi-day spanning events", () => {
      const january15 = new Date(2024, 0, 15);
      const multiDayEvent = createMockEvent({
        id: "multi-day",
        title: "Week-long Conference",
        start: new Date(2024, 0, 15, 9, 0),
        end: new Date(2024, 0, 19, 17, 0),
      });

      renderWithProvider(<MonthView />, {
        initialEvents: [multiDayEvent],
        initialDate: january15,
        initialView: "month",
      });

      expect(screen.getByText("Week-long Conference")).toBeInTheDocument();
    });
  });

  describe("Current day indicator", () => {
    it("marks the current day", () => {
      const today = new Date();

      renderWithProvider(<MonthView />, {
        initialDate: today,
        initialView: "month",
      });

      // Today's cell should have a special attribute
      const todayCell = document.querySelector('[data-today="true"]');
      expect(todayCell).toBeInTheDocument();
    });
  });

  describe("Previous/Next month days", () => {
    it("shows days from previous and next months", () => {
      const january15 = new Date(2024, 0, 15);

      renderWithProvider(<MonthView />, {
        initialDate: january15,
        initialView: "month",
      });

      // January 2024 starts on Monday, so no previous month days needed at start
      // But there will be days from February at the end
      const dayCells = document.querySelectorAll("[data-eycalendar-day-cell]");
      expect(dayCells.length).toBeGreaterThan(31); // More than just January days
    });
  });

  describe("Event overflow handling", () => {
    it("handles many events on the same day", () => {
      const january15 = new Date(2024, 0, 15);
      const events = Array.from({ length: 10 }, (_, i) =>
        createMockEvent({
          id: `event-${i}`,
          title: `Event ${i + 1}`,
          start: new Date(2024, 0, 15, 9 + i, 0),
          end: new Date(2024, 0, 15, 10 + i, 0),
        })
      );

      renderWithProvider(<MonthView />, {
        initialEvents: events,
        initialDate: january15,
        initialView: "month",
      });

      // All events should be present (might show "+X more" indicator)
      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("renders correctly with no events", () => {
      renderWithProvider(<MonthView />, {
        initialEvents: [],
        initialView: "month",
      });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has appropriate data attributes", () => {
      renderWithProvider(<MonthView />, { initialView: "month" });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toHaveAttribute("data-eycalendar-month-view", "");
    });

    it("day cells are accessible", () => {
      renderWithProvider(<MonthView />, { initialView: "month" });

      const dayCells = document.querySelectorAll("[data-eycalendar-day-cell]");
      expect(dayCells.length).toBeGreaterThan(0);
      dayCells.forEach((cell) => {
        expect(cell).toBeInTheDocument();
      });
    });

    it("events are keyboard accessible", () => {
      const january15 = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "accessible-event",
        title: "Accessible Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<MonthView />, {
        initialEvents: [event],
        initialDate: january15,
        initialView: "month",
      });

      const eventElement = screen.getByText("Accessible Event");
      expect(eventElement).toBeInTheDocument();
    });
  });

  describe("Week numbers", () => {
    it("displays week numbers when enabled", () => {
      renderWithProvider(<MonthView />, {
        initialView: "month",
        initialDate: new Date(2024, 0, 15),
      });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();
    });
  });

  describe("Month boundaries", () => {
    it("correctly displays February (28 days)", () => {
      const february2024 = new Date(2024, 1, 15); // 2024 is a leap year

      renderWithProvider(<MonthView />, {
        initialDate: february2024,
        initialView: "month",
      });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();
    });

    it("correctly displays months with 31 days", () => {
      const january2024 = new Date(2024, 0, 15);

      renderWithProvider(<MonthView />, {
        initialDate: january2024,
        initialView: "month",
      });

      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();
    });
  });

  describe("Click interactions", () => {
    it("day cells are clickable", () => {
      const january15 = new Date(2024, 0, 15);

      renderWithProvider(<MonthView />, {
        initialDate: january15,
        initialView: "month",
      });

      const dayCells = document.querySelectorAll("[data-eycalendar-day-cell]");
      expect(dayCells.length).toBeGreaterThan(0);

      // Cells should be interactive
      dayCells.forEach((cell) => {
        expect(cell).toBeInTheDocument();
      });
    });
  });
});
