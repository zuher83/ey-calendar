// Tests for DayView component
import React from "react";
import { screen } from "@testing-library/react";
import { DayView } from "../../../src/components/views/DayView";
import { createMockEvent, renderWithProvider } from "../../setup/testUtils";

describe("DayView", () => {
  describe("Rendering", () => {
    it("renders the day view container", () => {
      renderWithProvider(<DayView />, { initialView: "day" });

      const dayView = document.querySelector("[data-eycalendar-day-view]");
      expect(dayView).toBeInTheDocument();
    });

    it("renders time slots for the day", () => {
      renderWithProvider(<DayView />, { initialView: "day" });

      // Should have time labels (e.g., "00:00", "01:00", etc.)
      const timeLabels = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeLabels.length).toBeGreaterThan(0);
    });

    it("applies custom className", () => {
      renderWithProvider(<DayView className="custom-day-class" />, { initialView: "day" });

      const dayView = document.querySelector("[data-eycalendar-day-view]");
      expect(dayView).toHaveClass("custom-day-class");
    });

    it("does not render the current time line when showToday is false", () => {
      const today = new Date();

      renderWithProvider(<DayView />, {
        initialDate: today,
        initialView: "day",
        options: { showToday: false },
      });

      const currentTimeLine = document.querySelector("[data-eycalendar-current-time]");
      expect(currentTimeLine).not.toBeInTheDocument();
    });
  });

  describe("Event display", () => {
    it("displays events for the current day", () => {
      const today = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "day-event-1",
        title: "Daily Meeting",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<DayView />, {
        initialEvents: [event],
        initialDate: today,
        initialView: "day",
      });

      expect(screen.getByText("Daily Meeting")).toBeInTheDocument();
    });

    it("does not display events from other days", () => {
      const today = new Date(2024, 0, 15);

      const event = createMockEvent({
        id: "tomorrow-event",
        title: "Tomorrow Event",
        start: new Date(2024, 0, 16, 10, 0),
        end: new Date(2024, 0, 16, 11, 0),
      });

      renderWithProvider(<DayView />, {
        initialEvents: [event],
        initialDate: today,
        initialView: "day",
      });

      expect(screen.queryByText("Tomorrow Event")).not.toBeInTheDocument();
    });

    it("displays multiple events in the same day", () => {
      const today = new Date(2024, 0, 15);
      const events = [
        createMockEvent({
          id: "event-1",
          title: "Morning Meeting",
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 10, 0),
        }),
        createMockEvent({
          id: "event-2",
          title: "Lunch",
          start: new Date(2024, 0, 15, 12, 0),
          end: new Date(2024, 0, 15, 13, 0),
        }),
        createMockEvent({
          id: "event-3",
          title: "Afternoon Meeting",
          start: new Date(2024, 0, 15, 15, 0),
          end: new Date(2024, 0, 15, 16, 0),
        }),
      ];

      renderWithProvider(<DayView />, {
        initialEvents: events,
        initialDate: today,
        initialView: "day",
      });

      expect(screen.getByText("Morning Meeting")).toBeInTheDocument();
      expect(screen.getByText("Lunch")).toBeInTheDocument();
      expect(screen.getByText("Afternoon Meeting")).toBeInTheDocument();
    });
  });

  describe("All-day events", () => {
    it("displays all-day events separately", () => {
      const today = new Date(2024, 0, 15);
      const allDayEvent = createMockEvent({
        id: "all-day",
        title: "All Day Conference",
        start: new Date(2024, 0, 15, 0, 0),
        end: new Date(2024, 0, 15, 23, 59),
        isAllDay: true,
      });

      renderWithProvider(<DayView />, {
        initialEvents: [allDayEvent],
        initialDate: today,
        initialView: "day",
      });

      expect(screen.getByText("All Day Conference")).toBeInTheDocument();
    });
  });

  describe("Conflict handling", () => {
    it("handles overlapping events correctly", () => {
      const today = new Date(2024, 0, 15);
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

      renderWithProvider(<DayView />, {
        initialEvents: overlappingEvents,
        initialDate: today,
        initialView: "day",
      });

      // Both events should be visible
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("renders correctly with no events", () => {
      renderWithProvider(<DayView />, {
        initialEvents: [],
        initialView: "day",
      });

      const dayView = document.querySelector("[data-eycalendar-day-view]");
      expect(dayView).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has appropriate data attributes", () => {
      renderWithProvider(<DayView />, { initialView: "day" });

      const dayView = document.querySelector("[data-eycalendar-day-view]");
      expect(dayView).toHaveAttribute("data-eycalendar-day-view", "");
    });

    it("events are keyboard accessible", () => {
      const today = new Date(2024, 0, 15);
      const event = createMockEvent({
        id: "accessible-event",
        title: "Accessible Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      renderWithProvider(<DayView />, {
        initialEvents: [event],
        initialDate: today,
        initialView: "day",
      });

      const eventElement = screen.getByText("Accessible Event");
      expect(eventElement).toBeInTheDocument();
      // Events are clickable divs with keyboard support
      const clickableParent = eventElement.closest("div[tabindex]");
      expect(clickableParent).toHaveAttribute("tabindex", "0");
    });
  });
});
