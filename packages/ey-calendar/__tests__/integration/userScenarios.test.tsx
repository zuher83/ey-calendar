// Integration tests for complete user scenarios
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EyCalendar } from "../../src/components/EyCalendar";
import { frCalendar } from "../../src/locales";
import { createMockEvent } from "../setup/testUtils";

describe("User Scenarios Integration", () => {
  describe("Weekly planning workflow", () => {
    it("completes a full weekly planning session", async () => {
      const user = userEvent.setup();
      const events = [
        createMockEvent({
          id: "meeting1",
          title: "Team Standup",
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 9, 30),
        }),
        createMockEvent({
          id: "meeting2",
          title: "Client Call",
          start: new Date(2024, 0, 16, 14, 0),
          end: new Date(2024, 0, 16, 15, 0),
        }),
        createMockEvent({
          id: "meeting3",
          title: "Project Review",
          start: new Date(2024, 0, 18, 10, 0),
          end: new Date(2024, 0, 18, 11, 30),
        }),
      ];

      render(<EyCalendar events={events} defaultDate={new Date(2024, 0, 15)} defaultView="week" />);

      // 1. Verify week view shows all events
      expect(screen.getByText("Team Standup")).toBeInTheDocument();
      expect(screen.getByText("Client Call")).toBeInTheDocument();
      expect(screen.getByText("Project Review")).toBeInTheDocument();

      // 2. Switch to day view to focus on Monday
      const dayButton = document.querySelector('[data-eycalendar-button-view="day"]');
      if (dayButton) {
        await user.click(dayButton as Element);
      }

      await waitFor(() => {
        expect(screen.getByText("Team Standup")).toBeInTheDocument();
        expect(screen.queryByText("Client Call")).not.toBeInTheDocument();
      });

      // 3. Navigate to next day
      const nextButton = document.querySelector('[data-eycalendar-button-nav="next"]');
      if (nextButton) {
        await user.click(nextButton as Element);
      }

      await waitFor(() => {
        expect(screen.getByText("Client Call")).toBeInTheDocument();
      });

      // 4. Switch to planning view for overview
      const planningButton = document.querySelector('[data-eycalendar-button-view="planning"]');
      if (planningButton) {
        await user.click(planningButton as Element);
      }

      await waitFor(() => {
        const planningView = document.querySelector("[data-eycalendar-planning-view]");
        expect(planningView).toBeInTheDocument();
      });
    });
  });

  describe("Month overview workflow", () => {
    it("navigates through month view and drills down to details", async () => {
      const user = userEvent.setup();
      const monthEvents = Array.from({ length: 15 }, (_, i) =>
        createMockEvent({
          id: `event-${i}`,
          title: `Event ${i + 1}`,
          start: new Date(2024, 0, i + 1, 10, 0),
          end: new Date(2024, 0, i + 1, 11, 0),
        })
      );

      render(
        <EyCalendar events={monthEvents} defaultDate={new Date(2024, 0, 15)} defaultView="month" />
      );

      // 1. Verify month view
      const monthView = document.querySelector("[data-eycalendar-month-view]");
      expect(monthView).toBeInTheDocument();

      // 2. Events should be visible (at least some)
      expect(screen.getByText("Event 1")).toBeInTheDocument();

      // 3. Navigate to next month
      const nextButton = document.querySelector('[data-eycalendar-button-nav="next"]');
      if (nextButton) {
        await user.click(nextButton as Element);
      }

      await waitFor(() => {
        const title = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(title?.textContent).toMatch(/feb/i);
      });

      // 4. Go back to original month
      const prevButton = document.querySelector('[data-eycalendar-button-nav="prev"]');
      if (prevButton) {
        await user.click(prevButton as Element);
      }

      await waitFor(() => {
        const title = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(title?.textContent).toMatch(/jan/i);
      });
    });
  });

  describe("Multi-language workflow", () => {
    it("switches between languages and preserves functionality", async () => {
      const event = createMockEvent({
        id: "lang-test",
        title: "Language Test Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      const { rerender } = render(
        <EyCalendar events={[event]} defaultDate={new Date(2024, 0, 15)} />
      );

      // 1. English by default
      expect(screen.getByText(/today/i)).toBeInTheDocument();

      // 2. Switch to French
      rerender(
        <EyCalendar events={[event]} defaultDate={new Date(2024, 0, 15)} options={frCalendar} />
      );

      await waitFor(() => {
        expect(screen.getByText(/aujourd'hui/i)).toBeInTheDocument();
      });

      // 3. Event should still be visible
      expect(screen.getByText("Language Test Event")).toBeInTheDocument();
    });
  });

  describe("Empty state workflow", () => {
    it("handles empty calendar gracefully", async () => {
      const user = userEvent.setup();

      render(<EyCalendar events={[]} defaultDate={new Date(2024, 0, 15)} defaultView="week" />);

      // Calendar should render
      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toBeInTheDocument();

      // Navigation should still work
      const nextButton = document.querySelector('[data-eycalendar-button-nav="next"]');
      if (nextButton) {
        await user.click(nextButton as Element);
      }

      await waitFor(() => {
        const title = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(title).toBeInTheDocument();
      });

      // View switching should work
      const monthButton = document.querySelector('[data-eycalendar-button-view="month"]');
      if (monthButton) {
        await user.click(monthButton as Element);
      }

      await waitFor(() => {
        const monthView = document.querySelector("[data-eycalendar-month-view]");
        expect(monthView).toBeInTheDocument();
      });
    });
  });

  describe("Performance with many events", () => {
    it("handles large number of events efficiently", () => {
      const manyEvents = Array.from({ length: 200 }, (_, i) =>
        createMockEvent({
          id: `event-${i}`,
          title: `Event ${i + 1}`,
          start: new Date(2024, 0, 1 + (i % 28), 8 + (i % 12), 0),
          end: new Date(2024, 0, 1 + (i % 28), 9 + (i % 12), 0),
        })
      );

      const startTime = performance.now();

      render(<EyCalendar events={manyEvents} defaultDate={new Date(2024, 0, 15)} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (< 2 seconds)
      expect(renderTime).toBeLessThan(2000);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toBeInTheDocument();
    });
  });

  describe("Edge cases workflow", () => {
    it("handles midnight spanning events", () => {
      const midnightEvent = createMockEvent({
        id: "midnight",
        title: "Midnight Event",
        start: new Date(2024, 0, 15, 23, 0),
        end: new Date(2024, 0, 16, 1, 0),
      });

      render(
        <EyCalendar
          events={[midnightEvent]}
          defaultDate={new Date(2024, 0, 15)}
          defaultView="day"
        />
      );

      expect(screen.getByText("Midnight Event")).toBeInTheDocument();
    });

    it("handles very long multi-day events", () => {
      const longEvent = createMockEvent({
        id: "long",
        title: "Week-long Conference",
        start: new Date(2024, 0, 15, 9, 0),
        end: new Date(2024, 0, 22, 17, 0),
      });

      render(
        <EyCalendar events={[longEvent]} defaultDate={new Date(2024, 0, 15)} defaultView="week" />
      );

      expect(screen.getByText("Week-long Conference")).toBeInTheDocument();
    });

    it("handles events with very short duration", () => {
      const shortEvent = createMockEvent({
        id: "short",
        title: "15 Minute Meeting",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 10, 15),
      });

      render(
        <EyCalendar events={[shortEvent]} defaultDate={new Date(2024, 0, 15)} defaultView="day" />
      );

      expect(screen.getByText("15 Minute Meeting")).toBeInTheDocument();
    });
  });
});
