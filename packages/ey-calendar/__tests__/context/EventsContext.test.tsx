// Tests for EventsContext
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { EventsProvider, useEvents } from "../../src/context/EventsContext";
import type { EventPosition, EyCalendarEvent } from "../../src/types";
import { createMockEvent } from "../setup/testUtils";

describe("EventsContext", () => {
  const createWrapper = (initialEvents: EyCalendarEvent[] = []) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <EventsProvider initialEvents={initialEvents}>{children}</EventsProvider>
    );
    Wrapper.displayName = "EventsTestWrapper";
    return Wrapper;
  };

  describe("Provider initialization", () => {
    it("initializes with empty events array", () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.events).toEqual([]);
      expect(result.current.state.selectedEventIds).toEqual([]);
    });

    it("initializes with provided events", () => {
      const events = [
        createMockEvent({ id: "1", title: "Event 1" }),
        createMockEvent({ id: "2", title: "Event 2" }),
      ];

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      expect(result.current.state.events).toHaveLength(2);
      expect(result.current.state.events[0].id).toBe("1");
      expect(result.current.state.events[1].id).toBe("2");
    });
  });

  describe("setEvents", () => {
    it("replaces all events", () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      const newEvents = [
        createMockEvent({ id: "1", title: "New Event 1" }),
        createMockEvent({ id: "2", title: "New Event 2" }),
      ];

      act(() => {
        result.current.setEvents(newEvents);
      });

      expect(result.current.state.events).toHaveLength(2);
      expect(result.current.state.events[0].title).toBe("New Event 1");
    });

    it("resets selection when setting new events", () => {
      const initialEvents = [createMockEvent({ id: "1" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(initialEvents),
      });

      // Select an event
      act(() => {
        result.current.setSelectedEvents(["1"]);
      });

      expect(result.current.state.selectedEventIds).toEqual(["1"]);

      // Set new events should reset selection
      act(() => {
        result.current.setEvents([createMockEvent({ id: "2" })]);
      });

      expect(result.current.state.selectedEventIds).toEqual([]);
    });
  });

  describe("addEvent", () => {
    it("adds a new event to the list", () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      const newEvent = createMockEvent({ id: "1", title: "New Event" });

      act(() => {
        result.current.addEvent(newEvent);
      });

      expect(result.current.state.events).toHaveLength(1);
      expect(result.current.state.events[0]).toEqual(newEvent);
    });

    it("appends event to existing list", () => {
      const initialEvents = [createMockEvent({ id: "1" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(initialEvents),
      });

      const newEvent = createMockEvent({ id: "2", title: "Second Event" });

      act(() => {
        result.current.addEvent(newEvent);
      });

      expect(result.current.state.events).toHaveLength(2);
      expect(result.current.state.events[1].id).toBe("2");
    });
  });

  describe("updateEvent", () => {
    it("updates an existing event", () => {
      const events = [createMockEvent({ id: "1", title: "Original Title" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.updateEvent("1", { title: "Updated Title" });
      });

      expect(result.current.state.events[0].title).toBe("Updated Title");
    });

    it("only updates specified event", () => {
      const events = [
        createMockEvent({ id: "1", title: "Event 1" }),
        createMockEvent({ id: "2", title: "Event 2" }),
      ];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.updateEvent("1", { title: "Updated Event 1" });
      });

      expect(result.current.state.events[0].title).toBe("Updated Event 1");
      expect(result.current.state.events[1].title).toBe("Event 2");
    });

    it("handles updating non-existent event gracefully", () => {
      const events = [createMockEvent({ id: "1" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.updateEvent("999", { title: "Does not exist" });
      });

      // Should not crash, event list unchanged
      expect(result.current.state.events).toHaveLength(1);
    });
  });

  describe("deleteEvent", () => {
    it("removes an event from the list", () => {
      const events = [createMockEvent({ id: "1" }), createMockEvent({ id: "2" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.deleteEvent("1");
      });

      expect(result.current.state.events).toHaveLength(1);
      expect(result.current.state.events[0].id).toBe("2");
    });

    it("removes event from selection when deleted", () => {
      const events = [createMockEvent({ id: "1" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      // Select the event
      act(() => {
        result.current.setSelectedEvents(["1"]);
      });

      expect(result.current.state.selectedEventIds).toEqual(["1"]);

      // Delete the event
      act(() => {
        result.current.deleteEvent("1");
      });

      expect(result.current.state.selectedEventIds).toEqual([]);
    });
  });

  describe("Event selection", () => {
    it("sets selected events", () => {
      const events = [createMockEvent({ id: "1" }), createMockEvent({ id: "2" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.setSelectedEvents(["1", "2"]);
      });

      expect(result.current.state.selectedEventIds).toEqual(["1", "2"]);
    });

    it("toggles event selection - adds when not selected", () => {
      const events = [createMockEvent({ id: "1" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.toggleEventSelection("1");
      });

      expect(result.current.state.selectedEventIds).toContain("1");
    });

    it("toggles event selection - removes when already selected", () => {
      const events = [createMockEvent({ id: "1" })];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      // Select first
      act(() => {
        result.current.setSelectedEvents(["1"]);
      });

      // Toggle to deselect
      act(() => {
        result.current.toggleEventSelection("1");
      });

      expect(result.current.state.selectedEventIds).not.toContain("1");
    });

    it("supports multi-selection", () => {
      const events = [
        createMockEvent({ id: "1" }),
        createMockEvent({ id: "2" }),
        createMockEvent({ id: "3" }),
      ];
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(events),
      });

      act(() => {
        result.current.toggleEventSelection("1");
        result.current.toggleEventSelection("3");
      });

      expect(result.current.state.selectedEventIds).toEqual(["1", "3"]);
    });
  });

  describe("Event positions", () => {
    it("sets event positions map", () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      const positions = new Map<string, EventPosition>();
      positions.set("1", { x: 0, y: 0, width: 100, height: 60 });

      act(() => {
        result.current.setEventPositions(positions);
      });

      expect(result.current.state.eventPositions.get("1")).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 60,
      });
    });

    it("updates a single event position", () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      const position: EventPosition = {
        x: 50,
        y: 0,
        width: 50,
        height: 60,
      };

      act(() => {
        result.current.updateEventPosition("1", position);
      });

      expect(result.current.state.eventPositions.get("1")).toEqual(position);
    });

    it("updates position without affecting others", () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      const positions = new Map<string, EventPosition>();
      positions.set("1", { x: 0, y: 0, width: 50, height: 60 });
      positions.set("2", { x: 50, y: 0, width: 50, height: 60 });

      act(() => {
        result.current.setEventPositions(positions);
      });

      // Update only position for event '1'
      act(() => {
        result.current.updateEventPosition("1", {
          x: 10,
          y: 0,
          width: 40,
          height: 60,
        });
      });

      expect(result.current.state.eventPositions.get("1")?.x).toBe(10);
      expect(result.current.state.eventPositions.get("2")?.x).toBe(50);
    });
  });

  describe("Error handling", () => {
    it("throws error when used outside provider", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useEvents());
      }).toThrow("useEvents must be used within an EventsProvider");

      consoleSpy.mockRestore();
    });
  });
});
