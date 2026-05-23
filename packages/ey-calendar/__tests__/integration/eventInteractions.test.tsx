// Integration tests for event interactions
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EyCalendar } from "../../src/components/EyCalendar";
import { createMockEvent } from "../setup/testUtils";

describe("Event Interactions Integration", () => {
  describe("Event click handling", () => {
    it("handles single and double clicks correctly", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const onDoubleClick = jest.fn();

      const event = createMockEvent({
        id: "clickable",
        title: "Clickable Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      render(
        <EyCalendar
          events={[event]}
          defaultDate={new Date(2024, 0, 15)}
          onEventClick={onClick}
          onEventDoubleClick={onDoubleClick}
        />
      );

      const eventElement = await screen.findByText("Clickable Event");

      // Single click
      await user.click(eventElement);

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });

      // Double click
      await user.dblClick(eventElement);

      await waitFor(() => {
        expect(onDoubleClick).toHaveBeenCalledTimes(1);
      });
    });

    it("provides correct event data in callbacks", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const event = createMockEvent({
        id: "event-with-data",
        title: "Event With Data",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
        custom: { customField: "customValue" },
      });

      render(
        <EyCalendar events={[event]} defaultDate={new Date(2024, 0, 15)} onEventClick={onClick} />
      );

      const eventElement = await screen.findByText("Event With Data");
      await user.click(eventElement);

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "event-with-data",
            title: "Event With Data",
            custom: { customField: "customValue" },
          }),
          expect.anything()
        );
      });
    });

    it("passes a keyboard event when an event is activated from the keyboard", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const event = createMockEvent({
        id: "keyboard-clickable",
        title: "Keyboard Clickable Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      });

      render(
        <EyCalendar events={[event]} defaultDate={new Date(2024, 0, 15)} onEventClick={onClick} />
      );

      const eventElement = await screen.findByText("Keyboard Clickable Event");
      const interactiveEvent = eventElement.closest('[role="button"]') as HTMLElement | null;

      expect(interactiveEvent).not.toBeNull();

      interactiveEvent?.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });

      const activationEvent = onClick.mock.calls[0]?.[1];

      expect(activationEvent?.type).toBe("keydown");
      expect(activationEvent?.key).toBe("Enter");
    });
  });

  describe("Multiple events display", () => {
    it("displays multiple overlapping events correctly", () => {
      const overlappingEvents = [
        createMockEvent({
          id: "1",
          title: "Event 1",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 30),
        }),
        createMockEvent({
          id: "2",
          title: "Event 2",
          start: new Date(2024, 0, 15, 10, 30),
          end: new Date(2024, 0, 15, 12, 0),
        }),
        createMockEvent({
          id: "3",
          title: "Event 3",
          start: new Date(2024, 0, 15, 11, 0),
          end: new Date(2024, 0, 15, 12, 30),
        }),
      ];

      render(
        <EyCalendar
          events={overlappingEvents}
          defaultDate={new Date(2024, 0, 15)}
          defaultView="day"
        />
      );

      // All events should be visible
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
      expect(screen.getByText("Event 3")).toBeInTheDocument();
    });

    it("displays events across multiple days correctly", () => {
      const multiDayEvents = [
        createMockEvent({
          id: "mon",
          title: "Monday Event",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "wed",
          title: "Wednesday Event",
          start: new Date(2024, 0, 17, 14, 0),
          end: new Date(2024, 0, 17, 15, 0),
        }),
        createMockEvent({
          id: "fri",
          title: "Friday Event",
          start: new Date(2024, 0, 19, 16, 0),
          end: new Date(2024, 0, 19, 17, 0),
        }),
      ];

      render(
        <EyCalendar
          events={multiDayEvents}
          defaultDate={new Date(2024, 0, 15)}
          defaultView="week"
        />
      );

      expect(screen.getByText("Monday Event")).toBeInTheDocument();
      expect(screen.getByText("Wednesday Event")).toBeInTheDocument();
      expect(screen.getByText("Friday Event")).toBeInTheDocument();
    });
  });

  describe("Event filtering by view", () => {
    it("shows only relevant events in day view", () => {
      const events = [
        createMockEvent({
          id: "today",
          title: "Today Event",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "tomorrow",
          title: "Tomorrow Event",
          start: new Date(2024, 0, 16, 10, 0),
          end: new Date(2024, 0, 16, 11, 0),
        }),
      ];

      render(<EyCalendar events={events} defaultDate={new Date(2024, 0, 15)} defaultView="day" />);

      expect(screen.getByText("Today Event")).toBeInTheDocument();
      expect(screen.queryByText("Tomorrow Event")).not.toBeInTheDocument();
    });

    it("shows all events in planning view", () => {
      const events = [
        createMockEvent({
          id: "1",
          title: "Event 1",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
        createMockEvent({
          id: "2",
          title: "Event 2",
          start: new Date(2024, 0, 16, 10, 0),
          end: new Date(2024, 0, 16, 11, 0),
        }),
        createMockEvent({
          id: "3",
          title: "Event 3",
          start: new Date(2024, 0, 20, 10, 0),
          end: new Date(2024, 0, 20, 11, 0),
        }),
      ];

      render(
        <EyCalendar events={events} defaultDate={new Date(2024, 0, 15)} defaultView="planning" />
      );

      // Planning view shows events from current date forward
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
      expect(screen.getByText("Event 3")).toBeInTheDocument();
    });
  });

  describe("Event styling", () => {
    it("applies custom colors to events", () => {
      const coloredEvent = createMockEvent({
        id: "colored",
        title: "Colored Event",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
        backgroundColor: "#ff0000",
        textColor: "#ffffff",
      });

      render(<EyCalendar events={[coloredEvent]} defaultDate={new Date(2024, 0, 15)} />);

      const eventElement = screen.getByText("Colored Event");
      expect(eventElement).toBeInTheDocument();
    });

    it("handles all-day events styling differently", () => {
      const allDayEvent = createMockEvent({
        id: "allday",
        title: "All Day Event",
        start: new Date(2024, 0, 15, 0, 0),
        end: new Date(2024, 0, 15, 23, 59),
        isAllDay: true,
      });

      render(<EyCalendar events={[allDayEvent]} defaultDate={new Date(2024, 0, 15)} />);

      expect(screen.getByText("All Day Event")).toBeInTheDocument();
    });
  });

  describe("Dynamic event updates", () => {
    it("updates display when events change", () => {
      const initialEvents = [
        createMockEvent({
          id: "1",
          title: "Initial Event",
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
        }),
      ];

      const { rerender } = render(
        <EyCalendar events={initialEvents} defaultDate={new Date(2024, 0, 15)} />
      );

      expect(screen.getByText("Initial Event")).toBeInTheDocument();

      // Update events
      const updatedEvents = [
        createMockEvent({
          id: "2",
          title: "Updated Event",
          start: new Date(2024, 0, 15, 14, 0),
          end: new Date(2024, 0, 15, 15, 0),
        }),
      ];

      rerender(<EyCalendar events={updatedEvents} defaultDate={new Date(2024, 0, 15)} />);

      expect(screen.queryByText("Initial Event")).not.toBeInTheDocument();
      expect(screen.getByText("Updated Event")).toBeInTheDocument();
    });
  });
});
