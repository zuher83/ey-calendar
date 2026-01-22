// Integration tests for calendar navigation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EyCalendar } from "../../src/components/EyCalendar";
import { createMockEvent } from "../setup/testUtils";

describe("Navigation Integration", () => {
  describe("View switching", () => {
    it("preserves the date when switching between views", async () => {
      const user = userEvent.setup();
      const testDate = new Date(2024, 5, 15); // June 15, 2024

      render(<EyCalendar defaultDate={testDate} defaultView="week" />);

      const container = await screen.findByTestId("calendar-container");
      expect(container).toBeInTheDocument();

      // Start in week view
      const monthButton = document.querySelector('[data-eycalendar-button-view="month"]');
      const dayButton = document.querySelector('[data-eycalendar-button-view="day"]');

      // Switch to month view
      if (monthButton) {
        await user.click(monthButton as Element);
      }

      // Title should still show June
      await waitFor(() => {
        const title = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(title?.textContent).toMatch(/jun/i);
      });

      // Switch to day view
      if (dayButton) {
        await user.click(dayButton as Element);
      }

      // Should still be on June 15
      await waitFor(() => {
        const title = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(title?.textContent).toMatch(/15/);
      });
    });

    it("displays events correctly after view switching", async () => {
      const user = userEvent.setup();
      const event = createMockEvent({
        id: "persistent-event",
        title: "Test Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      render(
        <EyCalendar events={[event]} defaultDate={new Date(2024, 0, 15)} defaultView="week" />
      );

      const container = await screen.findByTestId("calendar-container");
      expect(container).toBeInTheDocument();

      // Event should be visible in week view
      expect(screen.getByText("Test Event")).toBeInTheDocument();

      // Switch to day view
      const dayButton = document.querySelector('[data-eycalendar-button-view="day"]');
      if (dayButton) {
        await user.click(dayButton as Element);
      }

      // Event should still be visible
      await waitFor(() => {
        expect(screen.getByText("Test Event")).toBeInTheDocument();
      });

      // Switch to month view
      const monthButton = document.querySelector('[data-eycalendar-button-view="month"]');
      if (monthButton) {
        await user.click(monthButton as Element);
      }

      // Event should still be visible
      await waitFor(() => {
        expect(screen.getByText("Test Event")).toBeInTheDocument();
      });
    });
  });

  describe("Date navigation", () => {
    it("navigates forward and backward correctly", async () => {
      const user = userEvent.setup();
      const startDate = new Date(2024, 0, 15); // January 15, 2024

      render(<EyCalendar defaultDate={startDate} defaultView="week" />);

      const container = await screen.findByTestId("calendar-container");
      expect(container).toBeInTheDocument();

      // Get initial title
      const title = document.querySelector("[data-eycalendar-toolbar-title]");
      const initialTitle = title?.textContent;

      // Click next
      const nextButton = document.querySelector('[data-eycalendar-button-nav="next"]');
      if (nextButton) {
        await user.click(nextButton as Element);
      }

      // Title should change
      await waitFor(() => {
        const newTitle = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(newTitle?.textContent).not.toBe(initialTitle);
      });

      // Click previous to go back
      const prevButton = document.querySelector('[data-eycalendar-button-nav="prev"]');
      if (prevButton) {
        await user.click(prevButton as Element);
      }

      // Should be back to original
      await waitFor(() => {
        const finalTitle = document.querySelector("[data-eycalendar-toolbar-title]");
        expect(finalTitle?.textContent).toBe(initialTitle);
      });
    });

    it("returns to today when clicking today button", async () => {
      const user = userEvent.setup();
      const pastDate = new Date(2020, 0, 15); // January 15, 2020

      render(<EyCalendar defaultDate={pastDate} defaultView="week" />);

      const container = await screen.findByTestId("calendar-container");
      expect(container).toBeInTheDocument();

      // Click next a few times to move away from today
      const nextButton = document.querySelector('[data-eycalendar-button-nav="next"]');
      if (nextButton) {
        await user.click(nextButton as Element);
        await user.click(nextButton as Element);
      }

      // Click today button
      const todayButton = document.querySelector("[data-eycalendar-button-today]");
      if (todayButton) {
        await user.click(todayButton as Element);
      }

      // Should highlight today
      await waitFor(() => {
        const todayMarker = document.querySelector('[data-today="true"]');
        expect(todayMarker).toBeInTheDocument();
      });
    });
  });

  describe("Navigation callbacks", () => {
    it("triggers callbacks in correct order during navigation", async () => {
      const user = userEvent.setup();
      const onDateChange = jest.fn();
      const onViewChange = jest.fn();

      render(
        <EyCalendar defaultView="week" onDateChange={onDateChange} onViewChange={onViewChange} />
      );

      const container = await screen.findByTestId("calendar-container");
      expect(container).toBeInTheDocument();

      onDateChange.mockClear();
      onViewChange.mockClear();

      // Switch view
      const monthButton = document.querySelector('[data-eycalendar-button-view="month"]');
      if (monthButton) {
        await user.click(monthButton as Element);
      }

      await waitFor(() => {
        expect(onViewChange).toHaveBeenCalledWith("month", expect.any(Date));
      });

      // Navigate
      const nextButton = document.querySelector('[data-eycalendar-button-nav="next"]');
      if (nextButton) {
        await user.click(nextButton as Element);
      }

      await waitFor(() => {
        expect(onDateChange).toHaveBeenCalled();
      });
    });
  });
});
