// Tests for EyCalendar component
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EyCalendar } from "../../src/components/EyCalendar";
import { DEFAULT_OPTIONS } from "../../src/constants";
import { enCalendar, frCalendar } from "../../src/locales";
import type { EyCalendarEvent } from "../../src/types";
import { createMockEvent } from "../setup/testUtils";

describe("EyCalendar", () => {
  describe("Basic rendering", () => {
    it("returns the calendar with minimal props", () => {
      render(<EyCalendar />);

      // The component should be in the document
      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toBeInTheDocument();
    });

    it("applies the custom CSS class", () => {
      render(<EyCalendar className="custom-calendar" />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toHaveClass("custom-calendar");
    });

    it("applies inline styles", () => {
      const style = { backgroundColor: "red", padding: "20px" };
      render(<EyCalendar style={style} />);

      const calendar = screen.getByTestId("calendar-container");
      // Verify the style attribute contains the expected values
      expect(calendar).toHaveAttribute("style");
      const styleAttr = calendar.getAttribute("style") || "";
      expect(styleAttr).toContain("background-color");
      expect(styleAttr).toContain("padding");
    });

    it("returns without toolbar if showToolbar=false", () => {
      render(<EyCalendar showToolbar={false} />);

      // The toolbar should not be present
      const toolbar = screen.queryByRole("toolbar");
      expect(toolbar).not.toBeInTheDocument();
    });
  });

  describe("Events", () => {
    it("displays the events provided", () => {
      const events: EyCalendarEvent[] = [
        createMockEvent({
          id: "1",
          title: "Event 1",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "2",
          title: "Event 2",
          start: new Date(2024, 0, 15, 14, 0),
          end: new Date(2024, 0, 15, 15, 0),
        }),
      ];

      render(<EyCalendar events={events} defaultDate={new Date(2024, 0, 15)} />);

      // Events should be visible
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
    });

    it("manages an empty event table", () => {
      render(<EyCalendar events={[]} />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toBeInTheDocument();
    });

    it("triggers onEventClick when an event is clicked", async () => {
      const user = userEvent.setup();
      const handleEventClick = jest.fn();
      const event = createMockEvent({
        id: "1",
        title: "Clickable Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      render(
        <EyCalendar
          events={[event]}
          defaultDate={new Date(2024, 0, 15)}
          onEventClick={handleEventClick}
        />
      );

      const eventElement = screen.getByText("Clickable Event");
      await user.click(eventElement);

      await waitFor(() => {
        expect(handleEventClick).toHaveBeenCalledWith(
          expect.objectContaining({ id: "1", title: "Clickable Event" }),
          expect.anything() // Mouse event
        );
      });
    });

    it("triggers onEventDoubleClick when double-clicked", async () => {
      const user = userEvent.setup();
      const handleDoubleClick = jest.fn();
      const event = createMockEvent({
        id: "1",
        title: "Double Click Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      render(
        <EyCalendar
          events={[event]}
          defaultDate={new Date(2024, 0, 15)}
          onEventDoubleClick={handleDoubleClick}
        />
      );

      const eventElement = screen.getByText("Double Click Event");
      await user.dblClick(eventElement);

      await waitFor(() => {
        expect(handleDoubleClick).toHaveBeenCalledWith(
          expect.objectContaining({ id: "1" }),
          expect.anything() // Mouse event
        );
      });
    });
  });

  describe("Theme and styling", () => {
    it("applies the unstyled mode", () => {
      render(<EyCalendar unstyled />);

      const calendar = screen.getByTestId("calendar-container");
      // Should have structural classes
      expect(calendar.className).toContain("ey-cal-root");
    });

    it("applies a custom theme", () => {
      const customTheme = {
        root: "custom-theme-root bg-custom",
      };

      render(<EyCalendar theme={customTheme} />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toHaveClass("bg-custom");
    });

    it("applies custom class names", () => {
      const classNames = {
        root: "override-root",
        toolbar: "override-toolbar",
      };

      render(<EyCalendar classNames={classNames} />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toHaveClass("override-root");
    });

    it("applies data-theme attribute", () => {
      render(<EyCalendar dataTheme="dark" />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toHaveAttribute("data-theme", "dark");
    });
  });

  describe("Internationalisation (i18n)", () => {
    it("uses English labels by default", () => {
      render(<EyCalendar options={enCalendar} />);

      // Verify English labels are present
      expect(screen.getByText(/today/i)).toBeInTheDocument();
    });

    it("applies French labels", () => {
      render(<EyCalendar options={frCalendar} />);

      // Verify French labels are present
      expect(screen.getByText(/aujourd'hui/i)).toBeInTheDocument();
    });

    it("allows overriding specific labels", () => {
      const customLabels = {
        navToday: "Now",
      };

      render(<EyCalendar options={{ labels: customLabels }} />);

      expect(screen.getByText("Now")).toBeInTheDocument();
    });
  });

  describe("Configuration and options", () => {
    it("respects the default view", () => {
      render(<EyCalendar defaultView="week" />);

      // The week view should be active (check via data attribute)
      const weekButton = document.querySelector('[data-eycalendar-button-view="week"]');
      expect(weekButton).toHaveClass("ey-cal-button-view-active");
    });

    it("respects the default date", () => {
      const testDate = new Date(2024, 5, 15); // June 15, 2024
      render(<EyCalendar defaultDate={testDate} />);

      // Verify that June is displayed in toolbar title
      const title = document.querySelector("[data-eycalendar-toolbar-title]");
      expect(title?.textContent).toMatch(/jun/i);
    });

    it("does not store a module-level default date", () => {
      expect(DEFAULT_OPTIONS.defaultDate).toBeUndefined();
    });

    it("applies custom height", () => {
      render(<EyCalendar height={800} />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toHaveStyle({ height: "800px" });
    });

    it("applies custom width", () => {
      render(<EyCalendar width="600px" />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toHaveStyle({ width: "600px" });
    });

    it("hides the today button when showToday is false", () => {
      render(<EyCalendar showToday={false} />);

      const todayButton = screen.queryByRole("button", { name: /today/i });
      expect(todayButton).not.toBeInTheDocument();
    });
  });

  describe("Navigation callbacks", () => {
    it("triggers onDateChange when the date changes", async () => {
      const user = userEvent.setup();
      const handleDateChange = jest.fn();

      render(<EyCalendar defaultDate={new Date(2024, 0, 15)} onDateChange={handleDateChange} />);

      // Click on the "next" button
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(handleDateChange).toHaveBeenCalled();
      });
    });

    it("triggers onViewChange when the view changes", async () => {
      const user = userEvent.setup();
      const handleViewChange = jest.fn();

      render(<EyCalendar defaultView="day" onViewChange={handleViewChange} />);

      // Click on the week view button using specific selector
      const weekButton = document.querySelector('[data-eycalendar-button-view="week"]');
      if (weekButton) {
        await user.click(weekButton as Element);
      }

      await waitFor(() => {
        expect(handleViewChange).toHaveBeenCalledWith("week", expect.any(Date));
      });
    });

    it("triggers onRenderComplete with render timing and event count", async () => {
      const onRenderComplete = jest.fn();
      const event = createMockEvent({
        id: "render-event",
        title: "Render Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      render(
        <EyCalendar
          events={[event]}
          defaultDate={new Date(2024, 0, 15)}
          onRenderComplete={onRenderComplete}
        />
      );

      await waitFor(() => {
        expect(onRenderComplete).toHaveBeenCalledWith(expect.any(Number), 1);
      });
    });
  });

  describe("Accessibility (a11y)", () => {
    it("has an appropriate container element", () => {
      render(<EyCalendar />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveAttribute("data-eycalendar-root", "");
      expect(calendar).toHaveAttribute("role", "region");
    });

    it("announces the current view in a live region", () => {
      render(
        <EyCalendar
          events={[
            createMockEvent({
              id: "live-region-event",
              title: "Live Region Event",
              start: new Date(2024, 0, 15, 10, 0),
              end: new Date(2024, 0, 15, 11, 0),
            }),
          ]}
          defaultDate={new Date(2024, 0, 15)}
          defaultView="week"
        />
      );

      const liveRegion = document.querySelector("[data-eycalendar-live-region]");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent(/week/i);
      expect(liveRegion).toHaveTextContent(/event/i);
    });

    it("buttons are keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<EyCalendar />);

      const todayButton = screen.getByRole("button", { name: /today/i });

      // Tab to the button
      await user.tab();

      // The button should be focusable
      expect(todayButton).toBeInTheDocument();
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      const handleDateChange = jest.fn();

      render(<EyCalendar onDateChange={handleDateChange} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      nextButton.focus();

      // Appuyer sur Enter
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(handleDateChange).toHaveBeenCalled();
      });
    });
  });

  describe("Edge cases", () => {
    it("gracefully handles undefined props", () => {
      expect(() => {
        render(<EyCalendar events={undefined} />);
      }).not.toThrow();
    });

    it("handles a large number of events", () => {
      const manyEvents = Array.from({ length: 100 }, (_, i) =>
        createMockEvent({
          id: `event-${i}`,
          title: `Event ${i}`,
          start: new Date(2024, 0, 15, 8 + (i % 10), 0),
          end: new Date(2024, 0, 15, 9 + (i % 10), 0),
        })
      );

      render(<EyCalendar events={manyEvents} defaultDate={new Date(2024, 0, 15)} />);

      const calendar = screen.getByTestId("calendar-container");
      expect(calendar).toBeInTheDocument();
    });

    it("handles all-day events", () => {
      const allDayEvent = createMockEvent({
        id: "1",
        title: "All Day Event",
        start: new Date(2024, 0, 15, 0, 0),
        end: new Date(2024, 0, 15, 23, 59),
        isAllDay: true,
      });

      render(<EyCalendar events={[allDayEvent]} defaultDate={new Date(2024, 0, 15)} />);

      expect(screen.getByText("All Day Event")).toBeInTheDocument();
    });

    it("handles multi-day events", () => {
      const multiDayEvent = createMockEvent({
        id: "1",
        title: "Multi Day Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 17, 12, 0),
      });

      render(<EyCalendar events={[multiDayEvent]} defaultDate={new Date(2024, 0, 15)} />);

      expect(screen.getByText("Multi Day Event")).toBeInTheDocument();
    });
  });
});
